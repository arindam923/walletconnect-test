"use client";

import EmailForm from "@/components/EmailForm";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("@/components/Header"), { ssr: false });
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, racing, spicy } from "@/lib/utils";
import { calculateRarityPoints, getRarityLabel } from "@/utils/rarity";
import { Star } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useRef, useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { getUserNFTs, preloadImages, NFT } from "@/utils/nft";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { checkUserTermsAgreement } from "@/utils/checkUserAgreedAt";
import { transferNFTToBurnAddress } from "@/utils/transferNftToAddress";

// NFT Skeleton Loader
const NFTSkeleton = () => (
  <Card className="border-2 border-black bg-gradient-to-b from-gray-300 to-gray-400 shadow-neo rounded-none p-0 h-80 md:h-80 lg:h-96 xl:h-96 w-full animate-pulse">
    <CardContent className="relative p-1 h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-black font-bold text-xl">Loading...</div>
      </div>
    </CardContent>
  </Card>
);

// NFT Card
const NFTCard = ({
  nft,
  onSwap,
  burningNft,
}: {
  nft: NFT;
  onSwap: (nft: NFT) => void;
  burningNft: string | null;
}) => (
  <Card
    key={`${nft.contractAddress}-${nft.tokenId}`}
    className="border-2 border-black bg-gradient-to-b from-yellow-400 to-orange-400 shadow-neo rounded-none p-0 h-96 md:h-96 lg:h-[28rem] xl:h-[30rem] w-full hover:scale-105 transition-all duration-300"
  >
    <CardContent className="relative p-0 h-full flex flex-col overflow-hidden">
      <div className="absolute top-3 right-3 z-10">
        <Star className="fill-black stroke-black size-6" />
      </div>
      <div className="relative h-[70%] border-b-2 border-black">
        {nft.image ? (
          <Image
            src={nft.image}
            alt={nft.name ? `NFT image for ${nft.name}` : "NFT image"}
            fill
            className="object-cover"
            priority={true}
            loading="eager"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-orange-300 flex items-center justify-center">
            <span className="text-black font-bold text-2xl opacity-50">
              NFT
            </span>
          </div>
        )}
      </div>
      <div className="lg:h-[30%] h-[34%] flex relative">
        <div className="w-10 border-r-2 border-black flex items-center justify-center relative">
          <div className="absolute transform -rotate-90 whitespace-nowrap text-sm md:text-sm lg:text-base font-bold text-black tracking-tight">
            {nft.name.length > 12
              ? nft.name.substring(0, 12) + "..."
              : nft.name}
          </div>
        </div>
        <div className="flex-1 p-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm md:text-sm lg:text-base font-bold text-black tracking-tight">
              TOKEN: #{nft.tokenId}
            </p>
            <p className="text-sm font-medium text-black tracking-tight mt-1">
              RARITY:{" "}
              <span className="font">
                {getRarityLabel(nft.tokenId, nft.contractAddress)}
              </span>
            </p>
          </div>
          <div className="border-t border-black ">
            <div className="flex flex-col items-end space-y-1">
              <p className="text-sm md:text-sm lg:text-base font-medium text-black tracking-tight">
                POINTS:{" "}
                {calculateRarityPoints(nft.tokenId, nft.contractAddress)}
              </p>
              <Button
                className="bg-white hover:bg-gray-100 text-black border-2 border-black font-bold text-sm md:text-sm lg:text-base md:py-2 md:px-6 h-10 rounded-md shadow-neo"
                onClick={() => onSwap(nft)}
                disabled={
                  burningNft === `${nft.contractAddress}-${nft.tokenId}`
                }
              >
                {burningNft === `${nft.contractAddress}-${nft.tokenId}`
                  ? "SWAPPING..."
                  : "SWAP"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// NFT Grid
const NFTGrid = ({
  loading,
  nfts,
  onSwap,
  burningNft,
}: {
  loading: boolean;
  nfts: NFT[];
  onSwap: (nft: NFT) => void;
  burningNft: string | null;
}) => {
  if (loading) {
    return (
      <>
        {Array.from({ length: 6 }, (_, i) => (
          <NFTSkeleton key={i} />
        ))}
      </>
    );
  }
  if (nfts.length === 0) {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-black text-xl font-bold">
          No NFTs found from the specified collections
        </p>
        <p className="text-black text-base mt-2">
          Make sure you own NFTs from Ridiculous Dragons or Nomaimai collections
        </p>
      </div>
    );
  }
  return (
    <>
      {nfts.map((nft) => (
        <NFTCard
          key={`${nft.contractAddress}-${nft.tokenId}`}
          nft={nft}
          onSwap={onSwap}
          burningNft={burningNft}
        />
      ))}
    </>
  );
};

const SwaPage = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingSwapNft, setPendingSwapNft] = useState<NFT | null>(null);
  const [displayedNfts, setDisplayedNfts] = useState<NFT[]>([]);
  const [hasMoreNfts, setHasMoreNfts] = useState(false);
  const [burningNft, setBurningNft] = useState<string | null>(null);

  const { isConnected, address } = useAccount();

  const { data: nftsData = [], isLoading: loading } = useQuery({
    queryKey: ["nfts", address],
    queryFn: () => (isConnected && address ? getUserNFTs(address) : []),
    enabled: !!isConnected && !!address,
    staleTime: 1000 * 60, // 1 minute
  });

  const queryClient = useQueryClient();

  const { refetch: refetchAgreement } = useQuery({
    queryKey: ["userTermsAgreement", address],
    queryFn: () =>
      address ? checkUserTermsAgreement(address) : Promise.resolve(false),
    enabled: false,
  });

  useEffect(() => {
    const initialNfts = nftsData.slice(0, 6);
    setDisplayedNfts(initialNfts);
    setHasMoreNfts(nftsData.length > 6);
    preloadImages(initialNfts);
  }, [nftsData]);

  // View More handler
  const handleViewMore = useCallback(() => {
    setDisplayedNfts((prev) => {
      const nextNfts = nftsData.slice(prev.length, prev.length + 6);
      const updated = [...prev, ...nextNfts];
      setHasMoreNfts(updated.length < nftsData.length);
      preloadImages(nextNfts);
      return updated;
    });
  }, [nftsData]);

  const processSwapNFT = useCallback(
    async (nft: NFT, userEmail?: string) => {
      if (!address) {
        toast.error("Please connect your wallet");
        return;
      }
      setBurningNft(`${nft.contractAddress}-${nft.tokenId}`);
      try {
        const pointsReceived = calculateRarityPoints(
          nft.tokenId,
          nft.contractAddress
        );
        const result = await transferNFTToBurnAddress(
          nft.contractAddress,
          nft.tokenId,
          address
        );
        if (result.success) {
          const requestBody: {
            walletAddress: string;
            nftDetails: {
              contractAddress: string;
              tokenId: string;
              name: string;
              media?: string;
            };
            pointsReceived: number;
            email?: string;
            termsAgreed?: boolean;
          } = {
            walletAddress: address,
            nftDetails: {
              contractAddress: nft.contractAddress,
              tokenId: nft.tokenId,
              name: nft.name,
              media: nft.image,
            },
            pointsReceived,
          };
          if (userEmail) {
            requestBody.email = userEmail;
            requestBody.termsAgreed = true;
          }
          const response = await fetch("/api/swap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });
          if (response.ok) {
            await queryClient.invalidateQueries({ queryKey: ["nfts"] });
            setDisplayedNfts((prev) =>
              prev.filter(
                (item) =>
                  !(
                    item.contractAddress === nft.contractAddress &&
                    item.tokenId === nft.tokenId
                  )
              )
            );
            setHasMoreNfts((prev) => prev || nftsData.length - 1 > 6);
            toast.success(
              `Successfully swapped NFT and received ${pointsReceived} points!`
            );
          } else {
            const errorData: unknown = await response.json();
            if (
              typeof errorData === "object" &&
              errorData !== null &&
              "error" in errorData
            ) {
              toast.error(
                `Failed to save swap record: ${
                  (errorData as { error: string }).error
                }`
              );
            } else {
              toast.error(`Failed to save swap record: Unknown error`);
            }
          }
        } else {
          toast.error(`Failed to swap NFT: ${result.error}`);
        }
      } catch (error) {
        console.error("Error swapping NFT:", error);
        toast.error("An error occurred while swapping the NFT");
      } finally {
        setBurningNft(null);
        setPendingSwapNft(null);
      }
    },
    [address, queryClient, nftsData]
  );

  const handleSwapNFT = useCallback(
    async (nft: NFT) => {
      setPendingSwapNft(nft);
      const { data: agreed } = await refetchAgreement();
      if (agreed) {
        processSwapNFT(nft);
      } else {
        setShowEmailForm(true);
      }
    },
    [refetchAgreement, processSwapNFT]
  );

  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !termsAgreed || !pendingSwapNft || !address) {
        toast.error("Please fill all required fields and agree to terms");
        return;
      }
      try {
        const response = await fetch("/api/users/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: address,
            email,
            termsAgreed: true,
          }),
        });
        if (response.ok) {
          setShowEmailForm(false);
          processSwapNFT(pendingSwapNft, email);
        } else {
          const errorData = await response.json();
          toast.error(`Failed to save user data: ${errorData.error}`);
        }
      } catch (error) {
        console.error("Error saving user data:", error);
        toast.error("An error occurred while saving your information");
      }
    },
    [email, termsAgreed, pendingSwapNft, address, processSwapNFT]
  );

  return (
    <>
      <Header />
      {showEmailForm && (
        <EmailForm
          key="email-form"
          email={email}
          setEmail={setEmail}
          termsAgreed={termsAgreed}
          setTermsAgreed={setTermsAgreed}
          onCancel={() => {
            setShowEmailForm(false);
            setPendingSwapNft(null);
          }}
          onSubmit={handleEmailSubmit}
          emailInputRef={emailInputRef}
        />
      )}
      <Image
        src={"/bg2.png"}
        alt="Background gradient"
        width={600}
        height={100}
        className="absolute -top-20 left-0 w-full object-cover"
        loading="lazy"
      />
      <div className="relative z-10 p-6 pb-20 lg:p-8 xl:p-12">
        <div className="flex justify-center items-center relative mb-8 lg:mb-10 xl:mb-12">
          <Image
            src={"/5 7.png"}
            alt="Decorative right dragon"
            width={400}
            height={600}
            className="absolute top-[80%] -right-2 w-24 h-auto lg:w-48 xl:w-64 lg:top-0 xl:top-0 lg:right-0"
            loading="lazy"
          />
          <div className="text-center mx-auto max-w-3xl px-4 z-10">
            <p className="text-black text-base mb-3 lg:text-xl xl:text-3xl">
              CASH OUT
            </p>
            <h1
              className={cn(
                "text-5xl leading-10 font-black text-black mb-4 lg:text-6xl xl:text-8xl lg:leading-tight xl:leading-tight",
                racing.className
              )}
            >
              swap <span>NFT</span>s
            </h1>
            <p
              className={cn(
                "text-base text-black mb-5 lg:text-xl xl:text-2xl",
                spicy.className
              )}
            >
              Swap Your Ridiculous Dragons And Nomaimai
              <br />
              NFTs For Gululu Points
            </p>
          </div>
          <Image
            src={"/4 851118.png"}
            alt="Decorative left dragon"
            width={800}
            height={600}
            className="absolute top-[80%] -left-2 w-24 h-auto lg:w-48 xl:w-64 lg:top-0 xl:top-0 lg:left-0"
            loading="lazy"
          />
        </div>
        <div className="relative mt-20 pb-10 pt-4 border-2 border-black shadow-neo px-2 bg-[#ffd6a0] lg:mt-24 xl:mt-32 lg:pb-12 xl:pb-16 lg:pt-6 xl:pt-8 lg:px-4 xl:px-6">
          <h2
            className={cn(
              "text-2xl text-center font-bold text-black mb-6 italic lg:text-3xl xl:text-4xl lg:mb-8 xl:mb-10",
              racing.className
            )}
          >
            Explore inventory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 xl:gap-10 mb-8 px-4 lg:px-6 xl:px-8">
            <NFTGrid
              loading={loading}
              nfts={displayedNfts}
              onSwap={handleSwapNFT}
              burningNft={burningNft}
            />
          </div>
          {hasMoreNfts && (
            <div className="text-center pt-6 lg:pt-8 xl:pt-10">
              <Button
                className="bg-[#FBAC82] hover:bg-[#ffbb97] h-12 lg:h-14 xl:h-16 rounded-full shadow-neo border-2 border-black px-8 lg:px-10 xl:px-12"
                onClick={handleViewMore}
              >
                <span className="mr-3">
                  <Star className="inline-block w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 fill-black stroke-black" />
                </span>
                <span
                  className={cn(
                    "text-2xl lg:text-3xl xl:text-4xl text-black",
                    racing.className
                  )}
                >
                  VIEW MORE
                </span>
                <span className="ml-3">
                  <Star className="inline-block w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 fill-black stroke-black" />
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SwaPage;
