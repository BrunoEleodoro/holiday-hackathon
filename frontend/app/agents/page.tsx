"use client";

import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import abi from "../../abis/AgentFactory.json";
import AgentCard from "../../components/AgentCard";
// import { useLens } from "../../contexts/LensContext";
import { AGENT_FACTORY_ADDRESS } from "../constants";

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

export default function AgentsPage() {
  const router = useRouter();
  const { address } = useAccount();

  const { data: agentIds, isSuccess } = useReadContract({
    abi: abi.abi,
    address: AGENT_FACTORY_ADDRESS,
    functionName: "getAgentsByOwner",
    args: [address],
  }) as { data: string[]; isSuccess: boolean };

  return (
    <main className="min-h-screen font-sans text-white bg-gray-900">
      {address ? (
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
            {isSuccess &&
              agentIds.map((id: string) => (
                <AgentCard key={id.toString()} agentId={id.toString()} />
              ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen text-white bg-gray-900">
          Please connect your wallet first
          <br />
          <ConnectKitButton />
        </div>
      )}
    </main>
  );
}
