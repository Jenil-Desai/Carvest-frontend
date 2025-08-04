import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
      ),
    },
    walletConnectProjectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID as string,
    appName: "Carvest",
    appDescription: "Decentralized Crowdfunding Platform",
    appUrl: "https://carvest.vercel.app",
    appIcon: "https://carvest.vercel.app/logo.png",
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: {children: React.ReactNode}) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
