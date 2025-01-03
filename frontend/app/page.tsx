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
    <main className="relative min-h-screen font-mono bg-cyber-black text-neon-blue">
      <div className="fixed inset-0 w-full">
        <RetroGrid />
      </div>
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-b border-b md:py-20 from-cyber-black to-cyber-gray-900 border-neon-pink/30">
          <div className="px-4 mx-auto max-w-6xl text-center">
            <HyperText className='mb-4 text-3xl font-bold md:mb-6 md:text-4xl lg:text-5xl text-neon-pink'>
              NEXT_GEN::GAMING_EVOLUTION
            </HyperText>
            <p className="mx-auto mb-6 max-w-2xl text-sm md:mb-8 md:text-base text-neon-blue/80">
              CREATE AI-DRIVEN AGENTS WITH UNIQUE ATTRIBUTES ON THE LENS
              NETWORK. BATTLE. EXPLORE. TRADE. IN A DECENTRALIZED DYSTOPIA.
            </p>
            <div className="flex flex-col gap-4 justify-center items-center sm:flex-row">
              <a
                onClick={() => router.push('/game')}
                className="w-full sm:w-auto inline-block px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-bold text-cyber-black bg-neon-pink rounded-none cursor-pointer hover:bg-neon-blue hover:text-cyber-black transition-all duration-300 border border-neon-pink hover:border-neon-blue transform hover:translate-y-[-2px] hover:shadow-[0_0_15px_rgba(255,0,255,0.5)]"
              >
                INITIALIZE_GAME
              </a>
              <a
                onClick={() => router.push('/manage')}
                className="w-full sm:w-auto inline-block px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-bold text-neon-pink bg-transparent rounded-none cursor-pointer hover:bg-neon-pink hover:text-cyber-black transition-all duration-300 border border-neon-pink transform hover:translate-y-[-2px] hover:shadow-[0_0_15px_rgba(255,0,255,0.5)]"
              >
                MANAGE_AGENT
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-16 bg-cyber-black/80">
          <div className="px-4 mx-auto max-w-6xl">
            <h3 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl text-neon-blue">CORE::FEATURES</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
              {/* Feature 1 */}
              <div className="p-4 border transition-colors duration-300 md:p-6 bg-cyber-gray-800/50 border-neon-blue/30 hover:border-neon-blue">
                <h4 className="mb-2 text-lg font-bold md:text-xl text-neon-pink">AI-DRIVEN_AGENTS</h4>
                <p className="text-sm md:text-base text-neon-blue/70">
                  EACH AGENT IS UNIQUE, POWERED BY ON-CHAIN WALLETS, SHAPED BY
                  USER-PROVIDED ATTRIBUTES AND PERSONALITIES.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="p-4 border transition-colors duration-300 md:p-6 bg-cyber-gray-800/50 border-neon-blue/30 hover:border-neon-blue">
                <h4 className="mb-2 text-lg font-bold md:text-xl text-neon-pink">ERC20-BASED_ATTRIBUTES</h4>
                <p className="text-sm md:text-base text-neon-blue/70">
                  STR, INT, VIT... TRANSFER TOKENS TO YOUR
                  AGENT TO UPGRADE STATS AND CUSTOMIZE PLAYSTYLES.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="p-4 border transition-colors duration-300 md:p-6 bg-cyber-gray-800/50 border-neon-blue/30 hover:border-neon-blue">
                <h4 className="mb-2 text-lg font-bold md:text-xl text-neon-pink">LENS_PROTOCOL</h4>
                <p className="text-sm md:text-base text-neon-blue/70">
                  GASLESS, HIGH-SPEED TRANSACTIONS AND INTEGRATED SOCIAL FEATURES
                  FOR GUILDS, RAIDS, AND MARKETPLACE INTERACTIONS.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* System Overview */}
        <section id="system-overview" className="py-12 md:py-16 bg-cyber-black border-y border-neon-pink/30">
          <div className="px-4 mx-auto max-w-6xl">
            <h3 className="mb-4 text-2xl font-bold md:mb-6 md:text-3xl text-neon-blue">SYSTEM::OVERVIEW</h3>
            <ul className="space-y-3 text-sm list-disc list-inside md:space-y-4 md:text-base text-neon-blue/70">
              <li>
                <strong className="text-neon-pink">NFT = AI_AGENT</strong> — EACH AGENT IS AN NFT
                WITH UNIQUE PERSONALITY AND ATTRIBUTE DATA.
              </li>
              <li>
                <strong className="text-neon-pink">CORE_ATTRIBUTES: STR, INT, VIT</strong> — STORED ON-CHAIN.
              </li>
              <li>
                <strong className="text-neon-pink">TOKEN_UPGRADES</strong> — USE $AGNT TOKENS
                TO ENHANCE YOUR AGENT&apos;S ABILITIES.
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
                <strong className="text-neon-pink">NETWORK_SUPPORT</strong> — CURRENTLY ON LENS NETWORK,
                BASE INTEGRATION COMING SOON.
              </li>
            </ul>
          </div>
        </section>

        {/* Call to Action */}
        <section id="get-started" className="py-12 text-center backdrop-blur-sm md:py-16 bg-neon-purple/10">
          <div className="px-4 mx-auto max-w-6xl">
            <h4 className="mb-3 text-xl font-bold md:mb-4 md:text-2xl text-neon-pink">READY_TO_JOIN?</h4>
            <p className="mb-6 text-sm md:mb-8 md:text-base text-neon-blue">
              ENTER THE ARENA. SHAPE THE FUTURE OF ON-CHAIN GAMING.
            </p>
            <a
              href="#"
              className="inline-block px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-bold text-cyber-black bg-neon-pink rounded-none hover:bg-neon-blue transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-[0_0_15px_rgba(255,0,255,0.5)]"
            >
              INITIALIZE_AGENT
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-4 w-full border-t md:py-6 bg-cyber-black border-neon-pink/30">
          <div className="px-4 mx-auto max-w-6xl text-sm text-center md:text-base text-neon-blue/50">
            <p>© {new Date().getFullYear()} CYBER_AI_RPG :: ALL_RIGHTS_RESERVED</p>
          </div>
        </footer>
      </div>
    </main>
  );
}