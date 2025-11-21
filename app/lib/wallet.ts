import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return (
    typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  );
};

// Check if MetaMask is unlocked
export const isMetaMaskUnlocked = async (): Promise<boolean> => {
  if (!isMetaMaskInstalled()) {
    return false;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    return accounts && accounts.length > 0;
  } catch (error) {
    console.error("Error checking MetaMask unlock status:", error);
    return false;
  }
};

// Connect to MetaMask and get wallet address
export const connectWallet = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error(
      "MetaMask is not installed. Please install MetaMask to continue."
    );
  }

  try {
    // Use window.ethereum.request directly for better reliability
    // This properly triggers MetaMask popup even when locked
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock your MetaMask wallet and try again.");
    }

    return accounts[0];
  } catch (error: any) {
    // Error codes reference:
    // 4001: User rejected the request
    // -32002: Request already pending
    // -32603: Internal error

    if (error.code === 4001) {
      throw new Error("Connection request rejected. Please approve the connection in MetaMask.");
    }

    if (error.code === -32002) {
      throw new Error("MetaMask is already showing a connection request. Please check your MetaMask extension.");
    }

    // Handle case where MetaMask is locked but didn't open
    if (error.message?.includes("locked") || error.message?.includes("unlock")) {
      throw new Error("Please unlock your MetaMask wallet and try again.");
    }

    throw new Error(error.message || "Failed to connect wallet. Please try again.");
  }
};

// Sign a message with MetaMask
export const signMessage = async (message: string): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed.");
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);
    return signature;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error("User rejected the signature request.");
    }
    throw error;
  }
};

// Get current connected account
export const getCurrentAccount = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();
    return accounts.length > 0 ? accounts[0].address : null;
  } catch (error) {
    console.error("Failed to get current account:", error);
    return null;
  }
};

// Listen for account changes
export const onAccountsChanged = (callback: (accounts: string[]) => void) => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on("accountsChanged", callback);
  }
};

// Remove account change listener
export const removeAccountsChangedListener = (
  callback: (accounts: string[]) => void
) => {
  if (isMetaMaskInstalled()) {
    window.ethereum.removeListener("accountsChanged", callback);
  }
};
