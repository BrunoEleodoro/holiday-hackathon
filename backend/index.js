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
    mapWidth: 1280,
    mapHeight: 1280,
    gamePaused: false,
    npcs: [],
    activeCombat: null,
    combatLog: [],
    mapElements: [] // Store map obstacles/elements
};

// Map element types with their sizes
const elementTypes = {
    buildings: [
        { name: 'Building facade 1 - 12x3.png', width: 12, height: 3, rotation: 0 },
        { name: 'Building facade 2 - Yellow - 12x3.png', width: 12, height: 3, rotation: 0 },
        { name: 'Building facade 3 - Red - 12x3.png', width: 12, height: 3, rotation: 0 }
    ],
    obstacles: [
        { name: 'Dumpster 1 - 2x2.png', width: 2, height: 2, rotation: 0 },
        { name: 'Barrier - Concrete 1 - 1x1.png', width: 1, height: 1, rotation: 0 },
        { name: 'Crate 1 - 1x1.png', width: 1, height: 1, rotation: 0 },
        { name: 'Trash bags - 2x1.png', width: 2, height: 1, rotation: 0 },
        { name: 'Vending machine 1 - 1x1.png', width: 1, height: 1, rotation: 0 }
    ],
    decorations: [
        { name: 'Hologram 1 - 1x1.png', width: 1, height: 1, rotation: 0 },
        { name: 'Screen 1 - Red - 1x1.png', width: 1, height: 1, rotation: 0 },
        { name: 'Street light 1 - 2x1.png', width: 2, height: 1, rotation: 0 },
        { name: 'Noodle lunch - 1x1.png', width: 1, height: 1, rotation: 0 }
    ]
};

// Initialize map with elements
function initializeMap() {
    // create fake npcs 
    gameState.npcs = [
        { name: 'NPC 1', x: 100, y: 100, size: 32, character: 'npc1' },
        { name: 'NPC 2', x: 200, y: 200, size: 32, character: 'npc2' }
    ];
}

// Find valid position for new element that doesn't overlap with existing elements
function findValidPosition(width, height) {
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
        const x = Math.random() * (gameState.mapWidth - width);
        const y = Math.random() * (gameState.mapHeight - height);

        if (!checkElementCollision(x, y, width, height)) {
            return { x, y };
        }
        attempts++;
    }
    return null;
}

// Check if position collides with any existing map elements
function checkElementCollision(x, y, width, height) {
    return gameState.mapElements.some(element => {
        return !(x + width < element.x ||
            x > element.x + element.width ||
            y + height < element.y ||
            y > element.y + element.height);
    });
}

// Modified checkCollisions to include map elements
function checkCollisions() {
    // Check NPC collisions with map elements
    for (let npc of gameState.npcs) {
        for (let element of gameState.mapElements) {
            if (!(npc.x + npc.size < element.x ||
                npc.x > element.x + element.width ||
                npc.y + npc.size < element.y ||
                npc.y > element.y + element.height)) {
                // Move NPC back to previous valid position
                npc.x = npc.prevX;
                npc.y = npc.prevY;
            }
        }
    }

    // Check NPC-to-NPC collisions
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

// Modified updateNPC to store previous position
function updateNPC(npc) {
    if (gameState.gamePaused) return;

    // Store previous position
    npc.prevX = npc.x;
    npc.prevY = npc.y;

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

// Initialize map when server starts
initializeMap();

// Modified gameLoop to include map elements in state update
function gameLoop() {
    if (!gameState.gamePaused) {
        gameState.npcs.forEach(updateNPC);
        const collisionResult = checkCollisions();

        if (collisionResult.collision) {
            gameState.gamePaused = true;
            gameState.activeCombat = {
                npc1: collisionResult.npc1,
                npc2: collisionResult.npc2
            };

            io.emit('collision', {
                npc1: collisionResult.npc1,
                npc2: collisionResult.npc2
            });

            const winner = Math.random() < 0.5 ? collisionResult.npc1 : collisionResult.npc2;

            io.emit('fightResult', {
                winner: winner,
                reason: `${winner} won by chance!`,
                npc1: collisionResult.npc1,
                npc2: collisionResult.npc2
            });

            setTimeout(() => {
                gameState.gamePaused = false;
                gameState.activeCombat = null;
                gameState.combatLog = [];
                io.emit('gameResumed');
                resetNPCPositions();
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
            mapElements: gameState.mapElements,
            timestamp: Date.now()
        });
    }
}

app.use(express.static('public'));
app.use(express.json());

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send initial map state
    socket.emit('mapInit', {
        mapElements: gameState.mapElements
    });

    // emitGameStatus();

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