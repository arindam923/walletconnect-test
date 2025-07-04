import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export function useWalletRedirect() {
    const { isConnected } = useAccount();
    const router = useRouter();
  
    useEffect(() => {
      if (isConnected) {
        router.push("/swap");
      } else {
        router.push("/");
      }
    }, [isConnected, router]);
  }