'use client';

import { ConnectKitButton } from 'connectkit';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar';

export default function Home() {
  const router = useRouter();
  return (
    <main className="min-h-screen font-sans text-white bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="px-4 mx-auto max-w-6xl text-center">
          <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
            The Next Evolution of Gaming
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-300">
            Create AI-driven agents with unique attributes, all on the Lens
            Network. Battle, explore, and trade in a decentralized world.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              onClick={() => router.push('/game')}
              className="inline-block px-6 py-3 font-semibold text-white bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700"
            >
              Play Now
            </a>
            <a
              onClick={() => router.push('/manage')}
              className="inline-block px-6 py-3 font-semibold text-white bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700"
            >
              Manage
            </a>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="px-4 mx-auto max-w-6xl">
          <h3 className="mb-8 text-3xl font-bold">Key Features</h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="p-6 bg-gray-800 rounded-md">
              <h4 className="mb-2 text-xl font-semibold">AI-Driven Agents</h4>
              <p className="text-gray-300">
                Each agent is unique, powered by on-chain wallets, and shaped by
                user-provided attributes and personalities.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="p-6 bg-gray-800 rounded-md">
              <h4 className="mb-2 text-xl font-semibold">ERC20-Based Attributes</h4>
              <p className="text-gray-300">
                Strength, Intelligence, Vitality... Transfer tokens to your
                agent to upgrade stats and customize playstyles.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="p-6 bg-gray-800 rounded-md">
              <h4 className="mb-2 text-xl font-semibold">Built on Lens</h4>
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
        <div className="px-4 mx-auto max-w-6xl">
          <h3 className="mb-6 text-3xl font-bold">Hackathon MVP Recap</h3>
          <ul className="space-y-4 list-disc list-inside text-gray-300">
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
      <section id="get-started" className="py-16 text-center bg-indigo-600">
        <div className="px-4 mx-auto max-w-6xl">
          <h4 className="mb-4 text-2xl font-bold">Ready to Build?</h4>
          <p className="mb-8 text-gray-100">
            Join our hackathon and create the next generation of on-chain games.
          </p>
          <a
            href="#"
            className="inline-block px-6 py-3 font-semibold text-white bg-gray-900 rounded-md hover:bg-black"
          >
            Get Started Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 w-full bg-gray-800">
        <div className="px-4 mx-auto max-w-6xl text-center text-gray-400">
          <p>© {new Date().getFullYear()} On-Chain AI RPG. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}