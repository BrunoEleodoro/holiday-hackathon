'use client';

import { ConnectKitButton } from 'connectkit';
import Link from 'next/link';
import { useRouter, } from 'next/navigation';
// import { useLens } from '../contexts/LensContext';

export default function Navbar() {
  const router = useRouter();
  // const { isAuthenticated, createAccount, createApp, connect, accounts } = useLens();
  
  return (
    <header className="py-4 w-full bg-black border-b border-neon-pink">
      <div className="flex justify-between items-center px-4 mx-auto max-w-6xl">
        <h1 
          onClick={() => router.push('/')} 
          className="text-2xl font-bold tracking-wider transition-colors duration-300 cursor-pointer text-neon-blue hover:text-neon-pink"
        >
          AI_AGENT::ARENA
        </h1>
        <nav className="px-6 py-2 rounded-lg border backdrop-blur-sm bg-black/30 border-neon-blue/20">
          <ul className="flex items-center space-x-6">
            <li>
              <Link href="#" onClick={() => {
                // if (isAuthenticated) {
                //   // createApp()
                //   // createAccount("agentarena-1-agent","agentarena-1-agent")
                // } else {
                //   connect()
                // }

              }} className="transition-colors duration-300 text-neon-blue hover:text-neon-pink">
                CREATE_GAME
              </Link>
            </li>
            <li>
              <Link href="/agents" className="transition-colors duration-300 text-neon-blue hover:text-neon-pink">
                AGENTS
              </Link>
            </li>
            <li>
              <Link href="/game" className="transition-colors duration-300 text-neon-blue hover:text-neon-pink">
                GAME
              </Link>
            </li>
            <li>
              <Link href="/manage" className="transition-colors duration-300 text-neon-blue hover:text-neon-pink">
                MANAGE
              </Link>
            </li>
            <li className="ml-2">
              <ConnectKitButton />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
