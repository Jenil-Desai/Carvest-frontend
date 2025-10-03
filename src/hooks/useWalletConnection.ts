import { useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { toast } from 'sonner';
import cravestService from '@/services/carvest';

export function useWalletConnection() {
  const { isConnected, address } = useAccount();
  const { connectors } = useConnect();

  // When wallet is connected, update the Carvest service
  useEffect(() => {
    if (isConnected && window.ethereum) {
      const connectWallet = async () => {
        try {
          await cravestService.connectBrowserWallet();
          toast.success('Wallet connected to Carvest');
        } catch (error) {
          console.error('Failed to connect wallet to Carvest:', error);
          toast.error('Failed to initialize with wallet');
        }
      };

      connectWallet();
    }
  }, [isConnected]);

  return {
    isConnected,
    address,
    connectors,
  };
}
