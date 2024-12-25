import { getDefaultConfig } from 'connectkit';
import { createConfig } from 'wagmi';
import { mainnet, base } from 'wagmi/chains';
import { chains } from "@lens-network/sdk/viem";

export const config = createConfig(
  getDefaultConfig({
    appName: 'ConnectKit Next.js demo',
    chains: [mainnet,base, chains.testnet],
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  })
);

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
