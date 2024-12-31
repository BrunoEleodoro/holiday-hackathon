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
  }) as { data: string; isSuccess: boolean };

  // Get agent details from wallet
  const { data: name } = useReadContract({
    address: walletAddress as `0x${string}`,
    abi: agentWalletAbi,
    functionName: "name",
  }) as { data: string; isSuccess: boolean };

  const { data: bio } = useReadContract({
    address: walletAddress as `0x${string}`,
    abi: agentWalletAbi,
    functionName: "bio",
  }) as { data: string; isSuccess: boolean };

  const { data: character } = useReadContract({
    address: walletAddress as `0x${string}`,
    abi: agentWalletAbi,
    functionName: "character",
  }) as { data: string; isSuccess: boolean };

  const { data: balance } = useReadContract({
    address: walletAddress as `0x${string}`,
    abi: agentWalletAbi,
    functionName: "wethBalance",
  }) as { data: string; isSuccess: boolean };

  const { data: isActive } = useReadContract({
    address: walletAddress as `0x${string}`,
    abi: agentWalletAbi,
    functionName: "withdrawalsAllowed",
  }) as { data: boolean; isSuccess: boolean };

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
            <div className="w-[128px] h-[128px] overflow-hidden relative">
              <div
                className="absolute"
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundImage: `url(/static/characters/${encodeURIComponent(character)})`,
                  backgroundPosition: "0 0", 
                  imageRendering: "pixelated",
                  transform: "scale(4)",
                  transformOrigin: "top left"
                }}
              />
            </div>
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
          href={`/game/?follow=${name}`}
          className="px-4 py-2 bg-green-500 rounded watch-live-btn hover:bg-green-600"
        >
          Watch Live
        </a>
      </div>
    </div>
  );
}
