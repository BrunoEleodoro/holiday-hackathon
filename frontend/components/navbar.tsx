'use client';

import { ConnectKitButton } from 'connectkit';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  return (
    <header className="w-full py-6 bg-gray-800">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <h1 onClick={() => router.push('/')} className="text-2xl font-bold text-white cursor-pointer">On-Chain AI RPG</h1>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <a href="#features" className="hover:text-indigo-400 text-white">
                Features
              </a>
            </li>
            <li>
              <a href="#mvp-recap" className="hover:text-indigo-400 text-white">
                MVP Recap
              </a>
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
