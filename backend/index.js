/***************************************************************
 * server.js
 ***************************************************************/
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const cors = require('cors');
const { getAllAgents, createNPCConfig } = require('./web3');
const blacklist = require('./blacklist.json');
const { askSimple } = require('./openai');

// =================== CONFIGURATIONS & CONSTANTS ===================
const PORT = 3003;

// How often (ms) to check collisions
const COLLISION_CHECK_INTERVAL = 1000;

// Use a simple approach to skip frames for NPC movement / game state emissions
const UPDATE_SKIP_FRAMES = 1;    // Updates happen only every N frames

// How often to run the main gameLoop (fps)
const GAME_LOOP_FPS = 60;
const FRAME_INTERVAL_MS = 1000 / GAME_LOOP_FPS;

// =================== EXPRESS & SOCKET SETUP ===================
app.use(cors({ origin: "*", methods: ["GET", "POST"], credentials: true }));
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"], credentials: true }
});

app.use(express.static('public'));
app.use(express.json());

// =================== GAME STATE ===================
const gameState = {
    mapWidth: 1864 - 10,
    mapHeight: 1337 - 10,
    gamePaused: false,
    npcs: [],
    activeConversations: new Map(), // Track ongoing conversations
    combatLog: []
};

// =================== SAMPLE MESSAGES ===================
const sampleMessages = [
    "How are you doing?",
    "Nice weather we're having!",
    "Have you heard the latest news?",
    "I must be going now.",
    "What brings you here?",
    "Interesting outfit!",
    "Care to join me on an adventure?",
    "Watch where you're going!",
    "Let's be friends!"
];

// =================== SIMPLE POSITION UTILS ===================
function getEvenlyDistributedPositions(numNPCs, mapWidth, mapHeight) {
    if (numNPCs === 1) {
        return [{ x: 782, y: 568 }];
    }
    const positions = [];
    const cols = Math.ceil(Math.sqrt(numNPCs));
    const rows = Math.ceil(numNPCs / cols);

    const cellWidth = mapWidth / cols;
    const cellHeight = mapHeight / rows;

    let count = 0;
    for (let i = 0; i < rows && count < numNPCs; i++) {
        for (let j = 0; j < cols && count < numNPCs; j++) {
            const randomX = (j * cellWidth) + (Math.random() * (cellWidth - 64)) + 32;
            const randomY = (i * cellHeight) + (Math.random() * (cellHeight - 64)) + 32;
            positions.push({ x: randomX, y: randomY });
            count++;
        }
    }
    return positions;
}

// Just for reference if you need truly random placement
function getRandomPositions(numNPCs, mapWidth, mapHeight) {
    const positions = [];
    for (let i = 0; i < numNPCs; i++) {
        positions.push({
            x: Math.random() * (mapWidth - 64) + 32,
            y: Math.random() * (mapHeight - 64) + 32
        });
    }
    return positions;
}

// =================== NPC MOVEMENT & CONVERSATION LOGIC ===================

// Moves two NPCs apart after their conversation ends
function moveNPCsApart(npc1, npc2) {
    const angle = Math.random() * 2 * Math.PI; // Random angle
    const distance = 100; // Distance to move apart

    const newX1 = npc1.x + Math.cos(angle) * distance;
    const newY1 = npc1.y + Math.sin(angle) * distance;
    const newX2 = npc2.x - Math.cos(angle) * distance;
    const newY2 = npc2.y - Math.sin(angle) * distance;

    // Clamp positions to map boundaries
    npc1.x = Math.max(0, Math.min(gameState.mapWidth - npc1.size, newX1));
    npc1.y = Math.max(0, Math.min(gameState.mapHeight - npc1.size, newY1));
    npc2.x = Math.max(0, Math.min(gameState.mapWidth - npc2.size, newX2));
    npc2.y = Math.max(0, Math.min(gameState.mapHeight - npc2.size, newY2));
}

// -------------------- RATE-LIMITING OPENAI CALLS --------------------
/**
 * We'll use a simple queue to store our OpenAI calls.
 * Whenever we want to call askSimple, we push into the queue,
 * and an async worker processes them one at a time.
 */
const openAIQueue = [];
let isProcessingQueue = false;

async function processOpenAIQueue() {
    if (isProcessingQueue) return;
    isProcessingQueue = true;

    while (openAIQueue.length > 0) {
        const { speakerBio, interaction, conversationId, speakerName } = openAIQueue.shift();
        try {
            // The actual OpenAI call:
            const message = await askSimple(speakerBio, interaction);

            // Broadcast the message after we receive it
            io.emit('npcMessage', {
                speaker: speakerName,
                message,
                conversationId
            });
        } catch (err) {
            console.error("Error calling OpenAI:", err);
        }
    }

    isProcessingQueue = false;
}

/**
 * Instead of calling `askSimple` directly in setInterval,
 * push tasks into the queue and let processOpenAIQueue handle them.
 */
function startConversation(npc1, npc2) {
    const conversationId = `${npc1.id}-${npc2.id}`;
    if (!gameState.activeConversations.has(conversationId)) {
        const conversation = {
            participants: [npc1.id, npc2.id],
            messageCount: 0,
            interval: setInterval(() => {
                // If we haven't exchanged 2 messages yet, push a new request
                if (conversation.messageCount < 2) {
                    const speaker = Math.random() < 0.5 ? npc1 : npc2;
                    const other = (speaker === npc1) ? npc2 : npc1;

                    const interaction = `Hi ${other.name}, my name is ${speaker.name} and I'm a ${speaker.character}.` +
                        ` ${sampleMessages[Math.floor(Math.random() * sampleMessages.length)]}`;

                    // Enqueue OpenAI call
                    openAIQueue.push({
                        speakerBio: speaker.bio,
                        interaction,
                        conversationId,
                        speakerName: speaker.name
                    });
                    processOpenAIQueue();

                    conversation.messageCount++;
                } else {
                    clearInterval(conversation.interval);
                    gameState.activeConversations.delete(conversationId);
                    npc1.isInConversation = false;
                    npc2.isInConversation = false;
                    moveNPCsApart(npc1, npc2);
                }
            }, 10000)
        };

        npc1.isInConversation = true;
        npc2.isInConversation = true;
        gameState.activeConversations.set(conversationId, conversation);
    }
}

function updateNPC(npc) {
    if (npc.isInConversation) return;

    const npcConfig = npc.config;
    npcConfig.moveTimer++;

    if (npcConfig.moveTimer >= npcConfig.moveDuration) {
        const directions = ['up', 'down', 'left', 'right'];
        npcConfig.direction = directions[Math.floor(Math.random() * directions.length)];
        npcConfig.moveTimer = 0;
        npcConfig.isMoving = Math.random() > 0.3;
    }

    if (npcConfig.isMoving) {
        let dx = 0;
        let dy = 0;

        switch (npcConfig.direction) {
            case 'up':
                dy -= npc.speed;
                break;
            case 'down':
                dy += npc.speed;
                break;
            case 'left':
                dx -= npc.speed;
                break;
            case 'right':
                dx += npc.speed;
                break;
        }

        npc.x = Math.max(0, Math.min(gameState.mapWidth - npc.size, npc.x + dx));
        npc.y = Math.max(0, Math.min(gameState.mapHeight - npc.size, npc.y + dy));

        npcConfig.frameCount++;
        if (npcConfig.frameCount >= 5) {
            npcConfig.frameCount = 0;
            npcConfig.currentFrame =
                (npcConfig.currentFrame + 1) % npcConfig.animations[npcConfig.direction].frames;
        }
    } else {
        npcConfig.currentFrame = 0;
    }
}

// =================== COLLISION CHECKING ===================
// We'll do it on a cooldown rather than every frame.
function checkCollisions() {
    const collisions = [];
    for (let i = 0; i < gameState.npcs.length; i++) {
        for (let j = i + 1; j < gameState.npcs.length; j++) {
            const npc1 = gameState.npcs[i];
            const npc2 = gameState.npcs[j];

            const dx = npc1.x - npc2.x;
            const dy = npc1.y - npc2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < npc1.size && !npc1.isInConversation && !npc2.isInConversation) {
                collisions.push({ npc1, npc2 });
            }
        }
    }
    return collisions;
}

// =================== GAME LOOP ===================
let frameCount = 0;
let lastCollisionCheck = 0;

function gameLoop() {
    frameCount++;

    /************************
     * 1) NPC MOVEMENT
     ************************/
    // Skip frames to reduce CPU usage (update NPCs every other frame, for example)
    if (frameCount % UPDATE_SKIP_FRAMES === 0) {
        gameState.npcs.forEach(updateNPC);
    }

    /************************
     * 2) COLLISION CHECK
     ************************/
    const now = Date.now();
    if (now - lastCollisionCheck > COLLISION_CHECK_INTERVAL) {
        const collisions = checkCollisions();
        collisions.forEach(({ npc1, npc2 }) => {
            startConversation(npc1, npc2);
        });
        lastCollisionCheck = now;
    }

    /************************
     * 3) EMIT GAME STATE
     ************************/
    // Also skip frames for emitting game state
    if (frameCount % UPDATE_SKIP_FRAMES === 0) {
        io.emit('gameState', {
            npcs: gameState.npcs.map(npc => ({
                x: npc.x,
                y: npc.y,
                name: npc.name,
                character: npc.character,
                size: npc.size,
                isInConversation: npc.isInConversation,
                animation: {
                    direction: npc.config.direction,
                    currentFrame: npc.config.currentFrame,
                    isMoving: npc.config.isMoving
                }
            })),
            timestamp: now
        });
    }
}

// =================== ROUTES ===================
app.route('/blacklist').get((req, res) => {
    res.json(blacklist);
});

app.route('/gameState').get((req, res) => {
    res.json(gameState);
});

// =================== SOCKET CONNECTIONS ===================
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// =================== MAIN SERVER STARTUP ===================
setInterval(gameLoop, FRAME_INTERVAL_MS);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// =================== NPCs FROM CONTRACT ===================
async function updateNPCsFromContract() {
    try {
        const agents = await getAllAgents();
        if (agents.length > 0) {
            // Get existing NPCs by ID
            const existingNPCs = new Map(gameState.npcs.map(npc => [npc.id, npc]));

            // Filter out new agents
            const newAgents = agents.filter(agent => !existingNPCs.has(agent.id));

            if (newAgents.length > 0) {
                const newPositions = getEvenlyDistributedPositions(
                    newAgents.length,
                    gameState.mapWidth,
                    gameState.mapHeight
                );

                const newNPCs = newAgents.map((agent, index) => ({
                    ...agent,
                    x: newPositions[index].x,
                    y: newPositions[index].y,
                    isInConversation: false
                }));

                gameState.npcs = [...gameState.npcs, ...newNPCs];
                gameState.playersCount = [...new Set(gameState.npcs.map(npc => npc.owner))];
            }
        }
    } catch (error) {
        console.error("Error updating NPCs:", error);
    }
}

// Initial load of NPCs from the blockchain
updateNPCsFromContract().then(() => {
    console.log(`Loaded ${gameState.npcs.length} NPCs from blockchain`);
});

// Periodic NPC updates (every 5 minutes)
setInterval(updateNPCsFromContract, 5 * 60 * 1000);
