export const getRarityLabel = (tokenId: string, contractAddress: string): string => {
    const tokenNumber = parseInt(tokenId);
  
    // Collection 1: 0x521B674F91d818f7786F784dCCa2fc2b3121A6Bb (Ridi)
    if (
      contractAddress.toLowerCase() ===
      "0x521B674F91d818f7786F784dCCa2fc2b3121A6Bb".toLowerCase()
    ) {
      if (tokenNumber >= 1 && tokenNumber <= 5000) {
        return "Common";
      } else if (tokenNumber >= 5001 && tokenNumber <= 8000) {
        return "Rare";
      } else if (tokenNumber >= 8001 && tokenNumber <= 9500) {
        return "Epic";
      } else if (tokenNumber >= 9501 && tokenNumber <= 10000) {
        return "Legendary";
      }
    }
  
    // Collection 2: 0x5099d14FBdc58039D68dB2eb4Fa3fa939da668B1 (NMM)
    if (
      contractAddress.toLowerCase() ===
      "0x5099d14FBdc58039D68dB2eb4Fa3fa939da668B1".toLowerCase()
    ) {
      if (tokenNumber >= 1 && tokenNumber <= 3600) {
        return "Normal";
      } else if (tokenNumber >= 3601 && tokenNumber <= 4000) {
        return "Animated";
      }
    }
  
    return "Unknown";
  };

  export const calculateRarityPoints = (
    tokenId: string,
    contractAddress: string
  ): number => {
    const tokenNumber = parseInt(tokenId);
  
    // Collection 1: 0x521B674F91d818f7786F784dCCa2fc2b3121A6Bb (Ridi)
    if (
      contractAddress.toLowerCase() ===
      "0x521B674F91d818f7786F784dCCa2fc2b3121A6Bb".toLowerCase()
    ) {
      if (tokenNumber >= 1 && tokenNumber <= 5000) {
        return 2940; // Ridi - Common
      } else if (tokenNumber >= 5001 && tokenNumber <= 8000) {
        return 5080; // Ridi - Rare
      } else if (tokenNumber >= 8001 && tokenNumber <= 9500) {
        return 7120; // Ridi - Epic
      } else if (tokenNumber >= 9501 && tokenNumber <= 10000) {
        return 16000; // Ridi - Legendary
      }
    }
  
    // Collection 2: 0x5099d14FBdc58039D68dB2eb4Fa3fa939da668B1 (NMM)
    if (
      contractAddress.toLowerCase() ===
      "0x5099d14FBdc58039D68dB2eb4Fa3fa939da668B1".toLowerCase()
    ) {
      if (tokenNumber >= 1 && tokenNumber <= 3600) {
        return 6050; // NMM - Normal
      } else if (tokenNumber >= 3601 && tokenNumber <= 4000) {
        return 24000; // NMM - Animated
      }
    }
  
    return 0; // Default to 0 if not matching any type
  };