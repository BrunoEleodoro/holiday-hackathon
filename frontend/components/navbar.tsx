'use client';

import { ConnectKitButton } from 'connectkit';
import Link from 'next/link';
import { useRouter, } from 'next/navigation';
import { useLens } from '../contexts/LensContext';

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, createAccount, createApp, connect, accounts } = useLens();
  
  return (
    <header className="py-6 w-full bg-gray-800">
      <div className="flex justify-between items-center px-4 mx-auto max-w-6xl">
        <h1 onClick={() => router.push('/')} className="text-2xl font-bold text-white cursor-pointer">On-Chain AI RPG</h1>
        <nav>
          <ul className="flex items-center space-x-4">
            <li>
              <Link href="#" onClick={() => {
                if (isAuthenticated) {
                  // createApp()
                  createAccount("agentarena-1-agent","agentarena-1-agent")
                } else {
                  connect()
                }

              }} className="text-white hover:text-indigo-400">
                Create Game
              </Link>
            </li>
            <li>
              <Link href="/agents" className="text-white hover:text-indigo-400">
                Agents
              </Link>
            </li>
            <li>
              <Link href="/game" className="text-white hover:text-indigo-400">
                Game
              </Link>
            </li>
            <li>
              <Link href="/manage" className="text-white hover:text-indigo-400">
                Manage
              </Link>
            </li>
            <li>
              <ConnectKitButton />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
