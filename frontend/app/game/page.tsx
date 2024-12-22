'use client';

import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import Image from 'next/image';
import { Combat, GameState } from '../types/game';

function Game() {
  const [gameState, setGameState] = useState<GameState>({
    npcs: [],
    mapElements: []
  });
  const [activeCombat, setActiveCombat] = useState<Combat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = io('http://localhost:3003');

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('mapInit', (data: { mapElements: GameState['mapElements'] }) => {
      setGameState(prevState => ({
        ...prevState,
        mapElements: data.mapElements
      }));
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
    <div 
      ref={containerRef}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'black'
      }}
    >
      <div style={{ 
        position: 'absolute',
        width: '1280px',
        height: '1280px',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
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
              width: npc.size,
              height: npc.size,
              backgroundColor: 'red',
              borderRadius: '50%',
              zIndex: 4
            }}
            title={npc.name}
          />
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
              color: 'white',
              borderRadius: '10px',
              zIndex: 5
            }}
          >
            <h2>Combat!</h2>
            <p>{activeCombat.npc1} vs {activeCombat.npc2}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;
