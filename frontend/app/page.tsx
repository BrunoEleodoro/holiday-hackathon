'use client';

import { ConnectKitButton } from 'connectkit';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar';

export default function Home() {
    const router = useRouter();
  return (
    <main className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-800 to-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            The Next Evolution of Gaming
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Create AI-driven agents with unique attributes, all on the Lens
            Network. Battle, explore, and trade in a decentralized world.
          </p>
        <div className="flex justify-center gap-4">
<a
            onClick={() => router.push('/game')}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-md text-white font-semibold cursor-pointer"
          >
            Play Now
          </a>
          <a
            onClick={() => router.push('/manage')}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-md text-white font-semibold cursor-pointer"
          >
            Manage
          </a>
            </div> 

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800 p-6 rounded-md">
              <h4 className="text-xl font-semibold mb-2">AI-Driven Agents</h4>
              <p className="text-gray-300">
                Each agent is unique, powered by on-chain wallets, and shaped by
                user-provided attributes and personalities.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-gray-800 p-6 rounded-md">
              <h4 className="text-xl font-semibold mb-2">ERC20-Based Attributes</h4>
              <p className="text-gray-300">
                Strength, Intelligence, Vitality... Transfer tokens to your
                agent to upgrade stats and customize playstyles.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-gray-800 p-6 rounded-md">
              <h4 className="text-xl font-semibold mb-2">Built on Lens</h4>
              <p className="text-gray-300">
                Gasless, high-speed transactions and integrated social features
                for guilds, raids, and marketplace interactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hackathon MVP Recap */}
      <section id="mvp-recap" className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-6">Hackathon MVP Recap</h3>
          <ul className="list-disc list-inside space-y-4 text-gray-300">
            <li>
              <strong>One NFT = One AI Agent</strong> — each agent is an NFT
              that holds unique personality and attribute data.
            </li>
            <li>
              <strong>Core Attributes: STR, INT, VIT</strong> — stored on-chain.
            </li>
            <li>
              <strong>Token Upgrades</strong> — players can mint or buy tokens
              (e.g., STR Token) and apply them to their agent.
            </li>
            <li>
              <strong>Fight Function</strong> — simple logic compares total
              power vs. an enemy or another agent.
            </li>
            <li>
              <strong>Optional Social Integration</strong> — share fight results
              to a Lens feed for community engagement.
            </li>
            <li>
              <strong>Keep It Simple</strong> — a single contract stores
              agent data, fights, and upgrades for a quick demonstration.
            </li>
          </ul>
        </div>
      </section>

      {/* Call to Action */}
      <section id="get-started" className="py-16 bg-indigo-600 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h4 className="text-2xl font-bold mb-4">Ready to Build?</h4>
          <p className="text-gray-100 mb-8">
            Join our hackathon and create the next generation of on-chain games.
          </p>
          <a
            href="#"
            className="inline-block bg-gray-900 hover:bg-black px-6 py-3 rounded-md text-white font-semibold"
          >
            Get Started Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400">
          <p>© {new Date().getFullYear()} On-Chain AI RPG. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}