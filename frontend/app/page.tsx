'use client';

import { ConnectKitButton } from 'connectkit';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar';
import RetroGrid from "@/components/components/ui/retro-grid";
import HyperText from '@/components/components/ui/hyper-text';


export default function Home() {
  const router = useRouter();
  return (
    <main className="min-h-screen font-mono bg-cyber-black text-neon-blue">
      <RetroGrid />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b border-b from-cyber-black to-cyber-gray-900 border-neon-pink/30">
        <div className="px-4 mx-auto max-w-6xl text-center">
          <HyperText className='mb-6 text-4xl font-bold lg:text-5xl text-neon-pink'>
            NEXT_GEN::GAMING_EVOLUTION
          </HyperText>
          <p className="mx-auto mb-8 max-w-2xl text-neon-blue/80">
            CREATE AI-DRIVEN AGENTS WITH UNIQUE ATTRIBUTES ON THE LENS
            NETWORK. BATTLE. EXPLORE. TRADE. IN A DECENTRALIZED DYSTOPIA.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              onClick={() => router.push('/game')}
              className="inline-block px-6 py-3 font-bold text-cyber-black bg-neon-pink rounded-none cursor-pointer hover:bg-neon-blue hover:text-cyber-black transition-all duration-300 border border-neon-pink hover:border-neon-blue transform hover:translate-y-[-2px] hover:shadow-[0_0_15px_rgba(255,0,255,0.5)]"
            >
              INITIALIZE_GAME
            </a>
            <a
              onClick={() => router.push('/manage')}
              className="inline-block px-6 py-3 font-bold text-neon-pink bg-transparent rounded-none cursor-pointer hover:bg-neon-pink hover:text-cyber-black transition-all duration-300 border border-neon-pink transform hover:translate-y-[-2px] hover:shadow-[0_0_15px_rgba(255,0,255,0.5)]"
            >
              MANAGE_AGENT
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-cyber-black/80">
        <div className="px-4 mx-auto max-w-6xl">
          <h3 className="mb-8 text-3xl font-bold text-neon-blue">CORE::FEATURES</h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="p-6 border transition-colors duration-300 bg-cyber-gray-800/50 border-neon-blue/30 hover:border-neon-blue">
              <h4 className="mb-2 text-xl font-bold text-neon-pink">AI-DRIVEN_AGENTS</h4>
              <p className="text-neon-blue/70">
                EACH AGENT IS UNIQUE, POWERED BY ON-CHAIN WALLETS, SHAPED BY
                USER-PROVIDED ATTRIBUTES AND PERSONALITIES.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="p-6 border transition-colors duration-300 bg-cyber-gray-800/50 border-neon-blue/30 hover:border-neon-blue">
              <h4 className="mb-2 text-xl font-bold text-neon-pink">ERC20-BASED_ATTRIBUTES</h4>
              <p className="text-neon-blue/70">
                STR, INT, VIT... TRANSFER TOKENS TO YOUR
                AGENT TO UPGRADE STATS AND CUSTOMIZE PLAYSTYLES.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="p-6 border transition-colors duration-300 bg-cyber-gray-800/50 border-neon-blue/30 hover:border-neon-blue">
              <h4 className="mb-2 text-xl font-bold text-neon-pink">LENS_PROTOCOL</h4>
              <p className="text-neon-blue/70">
                GASLESS, HIGH-SPEED TRANSACTIONS AND INTEGRATED SOCIAL FEATURES
                FOR GUILDS, RAIDS, AND MARKETPLACE INTERACTIONS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hackathon MVP Recap */}
      <section id="mvp-recap" className="py-16 bg-cyber-black border-y border-neon-pink/30">
        <div className="px-4 mx-auto max-w-6xl">
          <h3 className="mb-6 text-3xl font-bold text-neon-blue">SYSTEM::MVP_RECAP</h3>
          <ul className="space-y-4 list-disc list-inside text-neon-blue/70">
            <li>
              <strong className="text-neon-pink">NFT = AI_AGENT</strong> — EACH AGENT IS AN NFT
              WITH UNIQUE PERSONALITY AND ATTRIBUTE DATA.
            </li>
            <li>
              <strong className="text-neon-pink">CORE_ATTRIBUTES: STR, INT, VIT</strong> — STORED ON-CHAIN.
            </li>
            <li>
              <strong className="text-neon-pink">TOKEN_UPGRADES</strong> — MINT OR BUY TOKENS
              (E.G., STR_TOKEN) AND APPLY TO AGENT.
            </li>
            <li>
              <strong className="text-neon-pink">COMBAT_SYSTEM</strong> — ALGORITHMIC POWER
              COMPARISON VS ENEMY OR AGENT.
            </li>
            <li>
              <strong className="text-neon-pink">SOCIAL_INTEGRATION</strong> — BROADCAST COMBAT
              RESULTS TO LENS FEED.
            </li>
            <li>
              <strong className="text-neon-pink">MINIMAL_VIABLE_PRODUCT</strong> — SINGLE CONTRACT:
              AGENT DATA, COMBAT, UPGRADES.
            </li>
          </ul>
        </div>
      </section>

      {/* Call to Action */}
      <section id="get-started" className="py-16 text-center backdrop-blur-sm bg-neon-purple/10">
        <div className="px-4 mx-auto max-w-6xl">
          <h4 className="mb-4 text-2xl font-bold text-neon-pink">READY_TO_HACK?</h4>
          <p className="mb-8 text-neon-blue">
            JOIN THE REVOLUTION. BUILD THE FUTURE OF ON-CHAIN GAMING.
          </p>
          <a
            href="#"
            className="inline-block px-6 py-3 font-bold text-cyber-black bg-neon-pink rounded-none hover:bg-neon-blue transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-[0_0_15px_rgba(255,0,255,0.5)]"
          >
            INITIALIZE_BUILD
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 w-full border-t bg-cyber-black border-neon-pink/30">
        <div className="px-4 mx-auto max-w-6xl text-center text-neon-blue/50">
          <p>© {new Date().getFullYear()} CYBER_AI_RPG :: ALL_RIGHTS_RESERVED</p>
        </div>
      </footer>
    </main>
  );
}