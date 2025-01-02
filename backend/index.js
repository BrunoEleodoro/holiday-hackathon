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

// Configure CORS for Express
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
}));

const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Game state
const gameState = {
    mapWidth: 1564 - 10,
    mapHeight: 1137 - 10,
    gamePaused: false,
    npcs: [],
    activeConversations: new Map(), // Track ongoing conversations
    combatLog: []
};

// Sample conversation messages
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

// Function to get evenly distributed positions
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
            // Add some randomness within each cell
            const randomX = (j * cellWidth) + (Math.random() * (cellWidth - 64)) + 32;
            const randomY = (i * cellHeight) + (Math.random() * (cellHeight - 64)) + 32;
            positions.push({ x: randomX, y: randomY });
            count++;
        }
    }
    return positions;
}

// Function to get random positions
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

// Function to move NPCs away from each other after conversation
function moveNPCsApart(npc1, npc2) {
    const angle = Math.random() * 2 * Math.PI; // Random angle
    const distance = 100; // Distance to move apart

    // Calculate new positions
    const newX1 = npc1.x + Math.cos(angle) * distance;
    const newY1 = npc1.y + Math.sin(angle) * distance;
    const newX2 = npc2.x - Math.cos(angle) * distance;
    const newY2 = npc2.y - Math.sin(angle) * distance;

    // Ensure new positions are within bounds
    npc1.x = Math.max(0, Math.min(gameState.mapWidth - npc1.size, newX1));
    npc1.y = Math.max(0, Math.min(gameState.mapHeight - npc1.size, newY1));
    npc2.x = Math.max(0, Math.min(gameState.mapWidth - npc2.size, newX2));
    npc2.y = Math.max(0, Math.min(gameState.mapHeight - npc2.size, newY2));
}

function startConversation(npc1, npc2) {
    const conversationId = `${npc1.id}-${npc2.id}`;
    if (!gameState.activeConversations.has(conversationId)) {
        const conversation = {
            participants: [npc1.id, npc2.id],
            messageCount: 0,
            interval: setInterval(async () => {
                const speaker = Math.random() < 0.5 ? npc1 : npc2;
                const interaction = `Hi ${npc2.name}, my name is ${speaker.name} and I'm a ${speaker.character}.    ${sampleMessages[Math.floor(Math.random() * sampleMessages.length)]}`;
                const message = await askSimple(speaker.bio, interaction);

                io.emit('npcMessage', {
                    speaker: speaker.name,
                    message: message,
                    conversationId
                });

                conversation.messageCount++;
                if (conversation.messageCount >= 5) {
                    clearInterval(conversation.interval);
                    gameState.activeConversations.delete(conversationId);
                    npc1.isInConversation = false;
                    npc2.isInConversation = false;
                    moveNPCsApart(npc1, npc2); // Move NPCs apart after conversation
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
            npcConfig.currentFrame = (npcConfig.currentFrame + 1) % npcConfig.animations[npcConfig.direction].frames;
        }
    } else {
        npcConfig.currentFrame = 0;
    }
}

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

function gameLoop() {
    gameState.npcs.forEach(updateNPC);
    const collisions = checkCollisions();

    collisions.forEach(({ npc1, npc2 }) => {
        startConversation(npc1, npc2);
    });

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
        timestamp: Date.now()
    });
}

app.use(express.static('public'));
app.use(express.json());
app.route('/blacklist').get((req, res) => {
    res.json(blacklist);
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

setInterval(gameLoop, 1000 / 60);

const PORT = 3003;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

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
            }
        }
    } catch (error) {
        console.error("Error updating NPCs:", error);
    }
}

// Add initial NPC fetch when server starts
updateNPCsFromContract().then(() => {
    console.log(`Loaded ${gameState.npcs.length} NPCs from blockchain`);
});

// Add periodic NPC updates (every 5 minutes)
setInterval(updateNPCsFromContract, 5 * 60 * 1000);
