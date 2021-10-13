import { useState, useEffect } from "react"; // Local state management
import { createContainer } from "unstated-next"; // Global state provider

// Onboarding wallet providers
// To edit
const wallets = [
  { walletName: "Sync2" },

];

function useVechain() {
  const [address, setAddress] = useState(null); // User address
  const [onboard, setOnboard] = useState(null); // Onboard provider
  const [provider, setProvider] = useState(null); // Ethers provider

  /**
   * Unlock wallet, store ethers provider and address
   */
  const unlock = async () => {
    // Enables wallet selection via BNC onboard
    
  };

  // --> Lifecycle: on mount
  useEffect(async () => {
    // Initialize the connex provider
    const { Connex } = await import('@vechain/connex');      
    const provider = new Connex({ 
                            node: 'https://testnet.veblocks.net',
                            network: 'test'
                           })

    console.log("Connex successfully initiated", provider);
    
  }, []);

  return {
    provider,
    address,
    unlock,
  };
}

// Create unstated-next container
const vechain = createContainer(useVechain);
export default vechain;
