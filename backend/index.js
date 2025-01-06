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
    mapWidth: 1864 - 10,
    mapHeight: 1337 - 10,
    gamePaused: false,
    npcs: [],
    activeConversations: new Map(), // Track ongoing conversations
    combatLog: []
};

// Cache sample messages to avoid array lookups
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

// Pre-calculate values used frequently
const CONVERSATION_DISTANCE = 100;
const TWO_PI = Math.PI * 2;
const FRAME_INTERVAL = 1000 / 60;
const UPDATE_INTERVAL = 5 * 60 * 1000;

// Function to get evenly distributed positions - memoize for repeated calls with same params
const memoizedPositions = new Map();
function getEvenlyDistributedPositions(numNPCs, mapWidth, mapHeight) {
    const key = `${numNPCs}-${mapWidth}-${mapHeight}`;
    if (memoizedPositions.has(key)) {
        return [...memoizedPositions.get(key)]; // Return copy of cached positions
    }

    if (numNPCs === 1) {
        const positions = [{ x: 782, y: 568 }];
        memoizedPositions.set(key, positions);
        return [...positions];
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
    memoizedPositions.set(key, positions);
    return [...positions];
}

// Cache random positions for reuse
const positionCache = new Map();
function getRandomPositions(numNPCs, mapWidth, mapHeight) {
    const key = `${numNPCs}-${mapWidth}-${mapHeight}`;
    if (positionCache.has(key)) {
        return [...positionCache.get(key)];
    }

    const positions = [];
    for (let i = 0; i < numNPCs; i++) {
        positions.push({
            x: Math.random() * (mapWidth - 64) + 32,
            y: Math.random() * (mapHeight - 64) + 32
        });
    }
    positionCache.set(key, positions);
    return [...positions];
}

// Use object pooling for conversations to reduce garbage collection
const conversationPool = [];
function getConversation() {
    return conversationPool.pop() || {};
}

function releaseConversation(conversation) {
    clearInterval(conversation.interval);
    conversation.participants = null;
    conversation.messageCount = 0;
    conversation.interval = null;
    conversationPool.push(conversation);
}

function moveNPCsApart(npc1, npc2) {
    const angle = Math.random() * TWO_PI;
    
    // Calculate new positions
    const newX1 = npc1.x + Math.cos(angle) * CONVERSATION_DISTANCE;
    const newY1 = npc1.y + Math.sin(angle) * CONVERSATION_DISTANCE;
    const newX2 = npc2.x - Math.cos(angle) * CONVERSATION_DISTANCE;
    const newY2 = npc2.y - Math.sin(angle) * CONVERSATION_DISTANCE;

    // Ensure new positions are within bounds using Math.min/max
    npc1.x = Math.max(0, Math.min(gameState.mapWidth - npc1.size, newX1));
    npc1.y = Math.max(0, Math.min(gameState.mapHeight - npc1.size, newY1));
    npc2.x = Math.max(0, Math.min(gameState.mapWidth - npc2.size, newX2));
    npc2.y = Math.max(0, Math.min(gameState.mapHeight - npc2.size, newY2));
}

function startConversation(npc1, npc2) {
    const conversationId = `${npc1.id}-${npc2.id}`;
    if (!gameState.activeConversations.has(conversationId)) {
        const conversation = getConversation();
        conversation.participants = [npc1.id, npc2.id];
        conversation.messageCount = 0;
        conversation.interval = setInterval(async () => {
            const speaker = Math.random() < 0.5 ? npc1 : npc2;
            const interaction = `Hi ${npc2.name}, my name is ${speaker.name} and I'm a ${speaker.character}.    ${sampleMessages[Math.floor(Math.random() * sampleMessages.length)]}`;
            const message = await askSimple(speaker.bio, interaction);

            io.emit('npcMessage', {
                speaker: speaker.name,
                message: message,
                conversationId
            });

            conversation.messageCount++;
            if (conversation.messageCount >= 2) {
                releaseConversation(conversation);
                gameState.activeConversations.delete(conversationId);
                npc1.isInConversation = false;
                npc2.isInConversation = false;
                moveNPCsApart(npc1, npc2);
            }
        }, 10000);

        npc1.isInConversation = true;
        npc2.isInConversation = true;
        gameState.activeConversations.set(conversationId, conversation);
    }
}

// Cache direction calculations
const directions = ['up', 'down', 'left', 'right'];
const directionMap = {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 }
};

function updateNPC(npc) {
    if (npc.isInConversation) return;

    const npcConfig = npc.config;
    npcConfig.moveTimer++;

    if (npcConfig.moveTimer >= npcConfig.moveDuration) {
        npcConfig.direction = directions[Math.floor(Math.random() * directions.length)];
        npcConfig.moveTimer = 0;
        npcConfig.isMoving = Math.random() > 0.3;
    }

    if (npcConfig.isMoving) {
        const movement = directionMap[npcConfig.direction];
        const dx = movement.dx * npc.speed;
        const dy = movement.dy * npc.speed;

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

// Use spatial partitioning for collision detection
const GRID_SIZE = 64; // Size of each grid cell
const spatialGrid = new Map();

function updateSpatialGrid() {
    spatialGrid.clear();
    for (const npc of gameState.npcs) {
        const gridX = Math.floor(npc.x / GRID_SIZE);
        const gridY = Math.floor(npc.y / GRID_SIZE);
        const key = `${gridX},${gridY}`;
        
        if (!spatialGrid.has(key)) {
            spatialGrid.set(key, []);
        }
        spatialGrid.get(key).push(npc);
    }
}

function checkCollisions() {
    updateSpatialGrid();
    const collisions = [];
    const checked = new Set();

    for (const [_, npcsInCell] of spatialGrid) {
        for (let i = 0; i < npcsInCell.length; i++) {
            const npc1 = npcsInCell[i];
            for (let j = i + 1; j < npcsInCell.length; j++) {
                const npc2 = npcsInCell[j];
                const pairKey = `${Math.min(npc1.id, npc2.id)}-${Math.max(npc1.id, npc2.id)}`;
                
                if (!checked.has(pairKey) && !npc1.isInConversation && !npc2.isInConversation) {
                    const dx = npc1.x - npc2.x;
                    const dy = npc1.y - npc2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < npc1.size) {
                        collisions.push({ npc1, npc2 });
                    }
                    checked.add(pairKey);
                }
            }
        }
    }
    return collisions;
}

// Use requestAnimationFrame for smoother animation
let lastUpdate = performance.now();
function gameLoop(timestamp) {
    const delta = timestamp - lastUpdate;
    
    if (delta >= FRAME_INTERVAL) {
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

        lastUpdate = timestamp;
    }

    requestAnimationFrame(gameLoop);
}

app.use(express.static('public'));
app.use(express.json());
app.route('/blacklist').get((req, res) => {
    res.json(blacklist);
});
app.route('/gameState').get((req, res) => {
    res.json(gameState);
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

requestAnimationFrame(gameLoop);

const PORT = 3003;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Cache agents from contract
let cachedAgents = [];
async function updateNPCsFromContract() {
    try {
        const agents = await getAllAgents();
        if (agents.length > 0) {
            // Compare with cached agents to only process new ones
            const newAgents = agents.filter(agent => 
                !cachedAgents.some(cached => cached.id === agent.id)
            );

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
                cachedAgents = agents;
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

// Add periodic NPC updates
setInterval(updateNPCsFromContract, UPDATE_INTERVAL);
