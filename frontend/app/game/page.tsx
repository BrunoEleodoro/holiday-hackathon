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
            <div className="flex justify-center items-center w-screen h-screen bg-black text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center w-screen min-h-screen bg-black text-white">
        <div className="relative w-[1564px] h-[1137px] overflow-hidden ">
            <div className="absolute w-[1564px] h-[1137px] -top-[1px] -left-[1px]">
                {/* Background Image */}
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    <Image
                        src="/Cyberpunk Scenes - 22x16.png"
                        alt="Cyberpunk Scene"
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Render NPCs */}
                {gameState.npcs.map((npc, index) => (
                    <div
                        key={index}
                        className="absolute cursor-pointer z-[4]"
                        style={{
                            left: npc.x,
                            top: npc.y,
                            width: npc.size + 30, // Increased container size
                            height: npc.size + 30, // Increased container size
                        }}
                        title={npc.name}
                    >
                        {/* Sprite Cropping Container */}
                        <div className="w-[64px] h-[64px] overflow-hidden relative"> {/* Doubled container size */}
                            <div 
                                className="absolute"
                                style={{
                                    width: '64px', // Doubled sprite width
                                    height: '64px', // Doubled sprite height
                                    backgroundImage: `url(${npc.character})`,
                                    backgroundPosition: `-${npc.animation.currentFrame * 32}px -${['down', 'left', 'right', 'up'].indexOf(npc.animation.direction) * 32}px`,
                                    imageRendering: 'pixelated',
                                    transform: 'scale(2)', // Scale up the sprite
                                    transformOrigin: 'top left'
                                }}
                            />
                        </div>

                        {/* NPC Name above sprite */}
                        <div className="absolute -top-[20px] w-full text-center text-[#0f0] text-[22px] z-[5]"
                            style={{
                                textShadow: '0 0 5px rgba(0, 255, 0, 0.7)'
                            }}>
                            {npc.name}
                        </div>
                    </div>
                ))}

                {/* Combat overlay */}
                {activeCombat && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-5 bg-black/80 text-[#0f0] rounded-lg z-[5] border-2 border-[#0f0]"
                        style={{
                            boxShadow: '0 0 15px rgba(0, 255, 0, 0.5)'
                        }}>
                        <h2 className="text-center mb-2.5">Combat!</h2>
                        <p className="text-center">{activeCombat.npc1} vs {activeCombat.npc2}</p>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
}

export default Game;
