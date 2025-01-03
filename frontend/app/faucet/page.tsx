'use client';

import { useAccount, useBalance } from 'wagmi';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FaucetPage() {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center p-8 min-h-screen bg-gray-900">
      <div className="p-6 mb-8 w-full max-w-3xl text-white bg-gray-800 rounded-lg">
        <h2 className="mb-4 text-2xl font-bold">Lens Protocol Testnet Faucet</h2>
        
        {/* Balance Display */}
        <div className="p-4 mb-4 bg-gray-700 rounded-lg">
          <p className="text-lg">Current Balance:</p>
          <p className="font-mono text-xl">
            {balance ? `${Number(balance.value).toFixed(4)} ${balance.symbol}` : 'Loading...'}
          </p>
        </div>

        <p className="mb-4">
          To request tokens from the faucet, copy your address below and paste it into the faucet interface:
        </p>
        
        <div className="flex gap-4 items-center mb-6">
          <code className="overflow-x-auto flex-1 p-3 bg-gray-700 rounded">
            {address || 'No wallet connected'}
          </code>
          <button
            onClick={copyAddress}
            disabled={!address}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <div className="text-sm text-gray-300">
          <p>Instructions:</p>
          <ol className="ml-4 space-y-1 list-decimal">
            <li>Copy your wallet address above</li>
            <li>Paste it into the faucet interface below</li>
            <li>Complete the verification and request tokens</li>
          </ol>
        </div>

        <button
          onClick={() => router.push('/agents')}
          className="px-6 py-3 mt-6 w-full text-lg font-bold text-white bg-green-600 rounded transition-colors hover:bg-green-700"
        >
          Create Your Agent
        </button>
      </div>

      <iframe 
        src="https://testnet.lenscan.io/faucet" 
        className="w-full max-w-3xl h-[600px] rounded-lg border border-gray-700"
      />
    </div>
  );
}
