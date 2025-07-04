export  const checkUserTermsAgreement = async (
    walletAddress: string
  ): Promise<boolean> => {
    if (!walletAddress) return false;

    try {
      const response = await fetch(
        `/api/users/update?walletAddress=${walletAddress}`
      );
      if (response.ok) {
        const data: { success: boolean; data?: { termsAgreed?: boolean } } =
          await response.json();
        if (data.success && data.data && data.data.termsAgreed) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking user terms agreement:", error);
      return false;
    }
  };