'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Image from 'next/image';
import { Combat, GameState } from '../types/game';

function Game() {
    const [gameState, setGameState] = useState<GameState>({
        npcs: [],
        activeCombat: null,
        combatLog: []
    });
    const [activeCombat, setActiveCombat] = useState<Combat | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3003');

        socket.on('connect', () => {
            console.log('Connected to server');
            setIsLoading(false);
        });

        socket.on('gameState', (data: GameState) => {
            setGameState(data);
        });

        socket.on('collision', (data: Combat) => {
            setActiveCombat(data);
        });

        socket.on('gameResumed', () => {
            setActiveCombat(null);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                height: '100vh',
                backgroundColor: 'black',
                color: 'white'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            <div style={{
                position: 'absolute',
                width: '1564px',
                height: '1137px',
                top: '-1px',
                left: '-1px',
            }}>
                {/* Background Image */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0
                }}>
                    <Image
                        src="/Cyberpunk Scenes - 22x16.png"
                        alt="Cyberpunk Scene"
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>

                {/* Render NPCs */}
                {gameState.npcs.map((npc, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            left: npc.x,
                            top: npc.y,
                            width: npc.size + 10,
                            height: npc.size + 10,
                            cursor: 'pointer',
                            zIndex: 4
                        }}
                        title={npc.name}
                    >
                        {/* Sprite Cropping Container */}
                        <div
                            style={{
                                width: '48px',
                                height: '64px',
                                overflow: 'hidden',
                                position: 'relative',
                            }}
                        >
                            <Image
                                src={npc.character}
                                alt={npc.name}
                                width={144}
                                height={256}
                                style={{
                                    position: 'absolute',
                                    left: `-${npc.animation.currentFrame * 48}px`,
                                    top: `-${['down', 'left', 'right', 'up'].indexOf(npc.animation.direction) * 64}px`,
                                }}
                            />
                        </div>

                        {/* NPC Name above sprite */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '-10px',
                                width: '100%',
                                textAlign: 'center',
                                color: '#0f0',
                                fontSize: '22px',
                                textShadow: '0 0 5px rgba(0, 255, 0, 0.7)'
                            }}
                        >
                            {npc.name}
                        </div>
                    </div>
                ))}

                {/* Combat overlay */}
                {activeCombat && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            padding: '20px',
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            color: '#0f0',
                            borderRadius: '10px',
                            zIndex: 5,
                            border: '2px solid #0f0',
                            boxShadow: '0 0 15px rgba(0, 255, 0, 0.5)'
                        }}
                    >
                        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Combat!</h2>
                        <p style={{ textAlign: 'center' }}>{activeCombat.npc1} vs {activeCombat.npc2}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Game;
