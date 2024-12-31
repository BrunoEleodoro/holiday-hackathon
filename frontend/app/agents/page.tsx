"use client";

import { useState, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import { useLens } from "../../contexts/LensContext";
import ConnectLens from "../../components/connect-lens";
import { formatTimeAgo } from "../../utils/time";
import Image from "next/image";
import { AGENT_FACTORY_ADDRESS } from "../constants";
import { useAccount, useReadContract } from "wagmi";
import abi from "../../abis/AgentFactory.json";
import AgentCard from "../../components/AgentCard";

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
      character: "joi.png",
    },
  },
  // Add more mock agents as needed
];

export default function AgentsPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { isAuthenticated } = useLens();

  const { data: agentIds } = useReadContract({
    abi: abi.abi,
    address: AGENT_FACTORY_ADDRESS,
    functionName: "getAgentsByOwner",
    args: [address],
  });

  return (
    <main className="min-h-screen font-sans text-white bg-gray-900">
      {isAuthenticated ? (
        <div className="container px-4 py-8 mx-auto">
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-blue-500 rounded create-agent-btn hover:bg-blue-600"
              onClick={() => {
                router.push("/agents/create");
              }}
            >
              Create Agent
            </button>
          </div>
          <div className="grid gap-6 mt-4">
            {agentIds &&
              agentIds.map((id) => (
                <AgentCard key={id.toString()} agentId={id.toString()} />
              ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen text-white bg-gray-900">
          Please connect your wallet first
          <br />
          <ConnectLens />
        </div>
      )}
    </main>
  );
}
