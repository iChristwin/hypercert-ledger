"use client";

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import { iotex, arbitrum, fantom, pgn, mainnet } from "viem/chains";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://mywebsite.com",
  icons: ["https://avatars.mywebsite.com/"],
};

const goerli = {
  name: "Goerli",
  chainId: 5,
  currency: "ETH",
  explorerUrl: "https://goerli.etherscan.io",
  rpcUrl: "https://rpc.ankr.com/eth_goerli",
};
const optimism = {
  name: "Optimism",
  chainId: 10, // The chain ID for Optimism may vary, please verify the correct chain ID
  currency: "ETH",
  explorerUrl: "https://optimistic.etherscan.io", // Note: The explorer URL for Optimism may vary, please check the official explorer for Optimism
  rpcUrl: "https://mainnet.optimism.io", // Note: The RPC URL for Optimism may vary, please check the official documentation for Optimism
};
createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata,
    defaultChainId: 5,
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
    rpcUrl: "...", // used for the Coinbase SDK
  }),
  chains: [
    goerli,
    optimism,
    {
      ...iotex,
      rpcUrl: iotex.rpcUrls.default.http[0],
      explorerUrl: iotex.blockExplorers.default.url,
      chainId: iotex.id,
      currency: iotex.nativeCurrency.symbol,
    },
    {
      ...arbitrum,
      rpcUrl: arbitrum.rpcUrls.default.http[0],
      explorerUrl: arbitrum.blockExplorers.default.url,
      chainId: arbitrum.id,
      currency: arbitrum.nativeCurrency.symbol,
    },
    {
      ...fantom,
      rpcUrl: fantom.rpcUrls.default.http[0],
      explorerUrl: fantom.blockExplorers.default.url,
      chainId: fantom.id,
      currency: fantom.nativeCurrency.symbol,
    },
    {
      ...pgn,
      rpcUrl: pgn.rpcUrls.default.http[0],
      explorerUrl: pgn.blockExplorers.default.url,
      chainId: pgn.id,
      currency: pgn.nativeCurrency.symbol,
    },
    {
      ...mainnet,
      rpcUrl: mainnet.rpcUrls.default.http[0],
      explorerUrl: mainnet.blockExplorers.default.url,
      chainId: mainnet.id,
      currency: mainnet.nativeCurrency.symbol,
    },
  ],
  projectId,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#3a59ef",
    "--w3m-font-size-master": "18",
  },
});

function WalletProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export default WalletProvider;
