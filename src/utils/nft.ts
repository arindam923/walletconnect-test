import { initializeMoralis } from "@/lib/moralis";
import Moralis from "moralis";

export interface NFT {
  tokenId: string;
  name: string;
  image?: string;
  contractAddress: string;
  metadata?: unknown;
}


export const NFT_COLLECTIONS = {
    collection1: '0x521B674F91d818f7786F784dCCa2fc2b3121A6Bb',
    collection2: '0x5099d14FBdc58039D68dB2eb4Fa3fa939da668B1',
  };

/**
 * Fetches NFTs for a given wallet address from a public API or returns mock data in development.
 * @param address Wallet address
 * @returns Array of NFT objects
 */
export async function getUserNFTs(address: string): Promise<NFT[]> {
  
    try {
        await initializeMoralis();
        const nfts = [];
        for (const collectionAddress of Object.values(NFT_COLLECTIONS)) {
          const response = await Moralis.EvmApi.nft.getWalletNFTs({
            address: address,
            chain: '0x38', 
            tokenAddresses: [collectionAddress],
          });
          
          nfts.push(...response.result);
        }
        
        return nfts.map((nft) => {
          
          let imageUrl = null;
          
          
          if (nft.media?.mediaCollection?.high?.url) {
            imageUrl = nft.media.mediaCollection.high.url;
          } else if (nft.media?.originalMediaUrl) {
            imageUrl = nft.media.originalMediaUrl;
          } 
          
          
           if (!imageUrl && nft.metadata) {
             try {
               const metadata = typeof nft.metadata === 'string' ? JSON.parse(nft.metadata) : nft.metadata;
               imageUrl = metadata?.image || metadata?.image_url || metadata?.imageUrl;
             } catch (e) {
               console.log('Error parsing metadata:', e);
             }
           }
           
           
           if (imageUrl && imageUrl.startsWith('ipfs://')) {
             imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
           }
           
           console.log('Final image URL for token', nft.tokenId, ':', imageUrl);
          
          return {
            tokenId: String(nft.tokenId),
            name: nft.name || 'Unknown NFT',
            image: imageUrl,
            contractAddress: nft.tokenAddress.lowercase,
            metadata: nft.metadata,
          };
        });
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        return [];
      }
}

/**
 * Preloads images for a list of NFTs to improve perceived performance.
 * @param nfts Array of NFT objects
 */
export function preloadImages(nfts: NFT[]): void {
  nfts.forEach((nft) => {
    if (nft.image) {
      const img = new window.Image();
      img.src = nft.image;
    }
  });
} 