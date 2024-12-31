"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatTimeAgo } from "../utils/time";
import { useReadContract } from "wagmi";
import { AGENT_FACTORY_ADDRESS } from "../app/constants";
import factoryAbi from "../abis/AgentFactory.json";

const agentWalletAbi = [
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "bio",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "character",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "wethBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawalsAllowed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
];

interface AgentCardProps {
  agentId: string;
}

export default function AgentCard({ agentId }: AgentCardProps) {
  // Get wallet address from AgentFactory
  const { data: walletAddress } = useReadContract({
    address: AGENT_FACTORY_ADDRESS,
    abi: factoryAbi.abi,
    functionName: "agentWallets",
    args: [BigInt(agentId)],
  });

  // Get agent details from wallet
  const { data: name } = useReadContract({
    address: walletAddress,
    abi: agentWalletAbi,
    functionName: "name",
  });

  const { data: bio } = useReadContract({
    address: walletAddress,
    abi: agentWalletAbi,
    functionName: "bio",
  });

  const { data: character } = useReadContract({
    address: walletAddress,
    abi: agentWalletAbi,
    functionName: "character",
  });

  const { data: balance } = useReadContract({
    address: walletAddress,
    abi: agentWalletAbi,
    functionName: "wethBalance",
  });

  const { data: isActive } = useReadContract({
    address: walletAddress,
    abi: agentWalletAbi,
    functionName: "withdrawalsAllowed",
  });

  if (!walletAddress) return null;

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{name || "Loading..."}</h3>
          <div className="mt-1 text-gray-400">
            <p className="agent-id">ID: {agentId}</p>
            <p className="agent-address">Address: {walletAddress}</p>
            <p className="agent-balance">
              Balance: {balance ? balance.toString() : "0"} WETH
            </p>
          </div>
        </div>
        <div id="agentStatus" className="flex items-center">
          {isActive ? (
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
          <p className="agent-bio">{bio || "No bio available"}</p>
        </div>
        <div className="flex justify-end">
          {character && (
            <Image
              src={`/static/characters/${character}`}
              alt={`${name} character`}
              width={112}
              height={128}
              className="pixel-art"
            />
          )}
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button className="px-4 py-2 bg-blue-500 rounded toggle-game-btn hover:bg-blue-600">
          {isActive ? "Leave Game" : "Join Game"}
        </button>
        <button className="px-4 py-2 bg-gray-600 rounded view-details hover:bg-gray-700">
          View Details
        </button>
        <a
          href={`/?follow=${name}`}
          className="px-4 py-2 bg-green-500 rounded watch-live-btn hover:bg-green-600"
        >
          Watch Live
        </a>
      </div>
    </div>
  );
} 