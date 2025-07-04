import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { bsc } from "viem/chains";
import { http } from "viem";

const projectId =
  (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string) ||
  "b56e18d47c72ab683b10814fe9495694";

export const config = getDefaultConfig({
  appName: "Gululu NFT",
  projectId,
  chains: [bsc],
  transports: {
    [bsc.id]: http(),
  },
  ssr: true,
});
