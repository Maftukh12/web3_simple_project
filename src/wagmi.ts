import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygon, optimism, arbitrum, base } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Web3 Premium dApp',
    projectId: 'YOUR_PROJECT_ID', // Get one at https://cloud.walletconnect.com
    chains: [mainnet, sepolia, polygon, optimism, arbitrum, base],
    ssr: true, // If your dApp uses server side rendering (SSR)
});
