import { ethers } from 'ethers';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export const CONTRACT_ABI = [
  "function createEvent(string,string,uint256,uint256,uint256) returns (uint256)",
  "function buyTicket(uint256) payable returns (uint256)",
  "function useTicket(uint256)",
  "function getTotalEvents() view returns (uint256)",
  "function getUserTickets(address) view returns (uint256[])",
  "function getTicket(uint256) view returns (tuple(uint256 eventId,bool isUsed,uint256 purchaseTime,address originalBuyer))",
  "function isTicketValid(uint256) view returns (bool)",
  "function events(uint256) view returns (string,string,uint256,uint256,uint256,uint256,bool)",
];

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert('MetaMask not found. Please install MetaMask.');
    return null;
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });

  // Force Sepolia network
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
    });
  } catch (err) {
    console.error('Network switch failed:', err);
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
};

export const getProvider = () => {
  if (typeof window === 'undefined') return null;
  if (!window.ethereum) return null;
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getContract = (signerOrProvider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
};