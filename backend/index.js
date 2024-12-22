const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const cors = require('cors');

// Configure CORS for Express
app.use(cors({
    origin: "http://localhost:3000", // NextJS default port
    methods: ["GET", "POST"],
    credentials: true
}));

const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Game state
const gameState = {
    mapWidth: 1564,
    mapHeight: 1137,
    gamePaused: false,
    npcs: [
        {
            x: 200,
            y: 200,
            size: 32,
            speed: 2,
            name: "Deckard",
            character: "/static/characters/deckard.png",
            config: createNPCConfig()
        },
        {
            x: 400,
            y: 400,
            size: 32,
            speed: 2,
            name: "Joi",
            character: "/static/characters/joi.png",
            config: createNPCConfig()
        },
        {
            x: 600,
            y: 600,
            size: 32,
            speed: 2,
            name: "K Jacket",
            character: "/static/characters/k jacket.png",
            config: createNPCConfig()
        },
        {
            x: 800,
            y: 800,
            size: 32,
            speed: 2,
            name: "Pris",
            character: "/static/characters/pris.png",
            config: createNPCConfig()
        },
        {
            x: 1000,
            y: 1000,
            size: 32,
            speed: 2,
            name: "Rachael",
            character: "/static/characters/luv combat.png",
            config: createNPCConfig()
        },
        {
            x: 1200,
            y: 1000,
            size: 32,
            speed: 2,
            name: "Zowie",
            character: "/static/characters/royshirtless.png",
            config: createNPCConfig()
        }
    ],
    activeCombat: null,
    combatLog: []
};

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

// NPC configuration template
function createNPCConfig() {
    return {
        frameWidth: 96,  // 288/3 frames per row
        frameHeight: 96, // 384/4 rows
        animations: {
            down: { y: 0, frames: 3 },
            left: { y: 1, frames: 3 },
            right: { y: 2, frames: 3 },
            up: { y: 3, frames: 3 }
        },
        currentFrame: 0,
        frameCount: 0,
        direction: 'down',
        moveTimer: 0,
        moveDuration: 60,
        isMoving: false
    };
}

function updateNPC(npc) {
    if (gameState.gamePaused) return;
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
    for (let i = 0; i < gameState.npcs.length; i++) {
        for (let j = i + 1; j < gameState.npcs.length; j++) {
            const npc1 = gameState.npcs[i];
            const npc2 = gameState.npcs[j];

            const dx = npc1.x - npc2.x;
            const dy = npc1.y - npc2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < npc1.size) {
                return {
                    collision: true,
                    npc1: npc1.name,
                    npc2: npc2.name
                };
            }
        }
    }
    return { collision: false };
}

function gameLoop() {
    if (!gameState.gamePaused) {
        gameState.npcs.forEach(updateNPC);
        const collisionResult = checkCollisions();
        // TODO: Implement combat logic
        if (collisionResult.collision && false) {
            gameState.gamePaused = true;
            gameState.activeCombat = {
                npc1: collisionResult.npc1,
                npc2: collisionResult.npc2
            };

            io.emit('collision', {
                npc1: collisionResult.npc1,
                npc2: collisionResult.npc2
            });

            setTimeout(() => {
                gameState.gamePaused = false;
                gameState.activeCombat = null;
                gameState.combatLog = [];
                io.emit('gameResumed');
            }, 5000);
        }

        io.emit('gameState', {
            npcs: gameState.npcs.map(npc => ({
                x: npc.x,
                y: npc.y,
                name: npc.name,
                character: npc.character,
                size: npc.size,
                animation: {
                    direction: npc.config.direction,
                    currentFrame: npc.config.currentFrame,
                    isMoving: npc.config.isMoving
                }
            })),
            timestamp: Date.now()
        });
    }
}

app.use(express.static('public'));
app.use(express.json());

io.on('connection', (socket) => {
    console.log('A user connected');

    if (gameState.activeCombat) {
        socket.emit('collision', {
            npc1: gameState.activeCombat.npc1,
            npc2: gameState.activeCombat.npc2
        });
    }

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

setInterval(gameLoop, 1000 / 60);

const PORT = 3003;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});