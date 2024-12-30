'use client';

import { useState, useEffect } from 'react';
import { ConnectKitButton } from 'connectkit';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/navbar';
import { useLens } from '../../contexts/LensContext';
import ConnectLens from '../../components/connect-lens';
import { formatTimeAgo } from '../../utils/time';
import Image from 'next/image';

// Mock data types
interface AgentStats {
  wins: number;
  losses: number;
  totalEncounters: number;
}

interface AgentDetails {
  isActive: boolean;
  speed: number;
  stats: AgentStats;
  lastActive: string;
  character: string;
  instructions?: string;
}

interface Agent {
  id: string;
  name: string;
  address: string;
  balance: string;
  details: AgentDetails;
}

// Mock data
const mockAgents: Agent[] = [
  {
    id: "1",
    name: "agent1",
    address: "0x1234...5678",
    balance: "1000000", // 1 USDC
    details: {
      isActive: true,
      speed: 5,
      stats: { wins: 10, losses: 5, totalEncounters: 15 },
      lastActive: new Date().toISOString(),
      character: "joi.png"
    }
  },
  // Add more mock agents as needed
];

export default function AgentsPage() {
  const router = useRouter();
  const { isAuthenticated, fetchUserAccounts } = useLens();
  const [agents, setAgents] = useState<Agent[]>(mockAgents);


  useEffect(() => {
    fetchUserAccounts();
  }, []);

  const formatStats = (stats: AgentStats) => {
    return `Wins: ${stats.wins}, Losses: ${stats.losses}, Total Encounters: ${stats.totalEncounters}`;
  };

  return (
    <main className="min-h-screen font-sans text-white bg-gray-900">
      {isAuthenticated ? (
        <div className="container px-4 py-8 mx-auto">
          {/* create agent button at the right side*/}
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-blue-500 rounded create-agent-btn hover:bg-blue-600" onClick={() => {
              router.push('/agents/create');
            }}>
              Create Agent
            </button>
          </div>
          <div className="grid gap-6 mt-4">
            {agents.map((agent) => (
              <div key={agent.id} className="p-6 bg-gray-800 rounded-lg shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{agent.name}.base.eth</h3>
                    <div className="mt-1 text-gray-400">
                      <p className="agent-id">ID: {agent.id}</p>
                      <p className="agent-address">Address: {agent.address}</p>
                      <p className="agent-balance">
                        {/* {ethers.utils.formatUnits(agent.balance, 6)} USDC */}
                      </p>
                    </div>
                  </div>
                  <div id="agentStatus" className="flex items-center">
                    {agent.details.isActive ? (
                      <>
                        Active &nbsp;
                        <span className="w-4 h-4 bg-green-400 rounded-full animate-pulse" />
                      </>
                    ) : (
                      <>
                        Inactive &nbsp;
                        <span className="w-4 h-4 bg-red-400 rounded-full animate-pulse" />
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="agent-speed">Speed: {agent.details.speed}</p>
                    <p className="agent-stats">{formatStats(agent.details.stats)}</p>
                    <p className="agent-last-active">
                      Last active: {formatTimeAgo(agent.details.lastActive)}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Image
                      src={`/static/characters/${agent.details.character}`}
                      alt={`${agent.name} character`}
                      width={112}
                      height={128}
                      className="pixel-art"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button className="px-4 py-2 bg-blue-500 rounded toggle-game-btn hover:bg-blue-600">
                    {agent.details.isActive ? 'Leave Game' : 'Join Game'}
                  </button>
                  <button className="px-4 py-2 bg-gray-600 rounded view-details hover:bg-gray-700">
                    View Details
                  </button>
                  <a
                    href={`/?follow=${agent.name}.base.eth`}
                    className="px-4 py-2 bg-green-500 rounded watch-live-btn hover:bg-green-600"
                  >
                    Watch Live
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen text-white bg-gray-900">
          Please connect your wallet first
          <br/>
          <ConnectLens/>
        </div>
      )}
    </main>
  );
}
