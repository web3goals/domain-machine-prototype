import { chainConfig } from "@/config/chain";
import useError from "@/hooks/use-error";
import { Listing } from "@/mongodb/models/listing";
import { Seaport } from "@opensea/seaport-js";
import { ItemType } from "@opensea/seaport-js/lib/constants";
import { useWallets } from "@privy-io/react-auth";
import axios from "axios";
import { ethers } from "ethers";
import {
  CheckIcon,
  DollarSignIcon,
  GlobeIcon,
  Loader2Icon,
  StarIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import {
  Address,
  createPublicClient,
  createWalletClient,
  custom,
  erc20Abi,
  formatEther,
  http,
} from "viem";
import { Button } from "../ui/button";

export default function BoxBuyListingBuy(props: {
  listing: Listing;
  onBuyListing: () => void;
  onSkipListing: () => void;
}) {
  const { wallets } = useWallets();
  const { handleError } = useError();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  async function handleBuyListing() {
    try {
      console.log("Buying listing...");
      setIsProcessing(true);

      // Check wallet
      const wallet = wallets[0];
      if (!wallet) {
        throw new Error("Wallet undefined");
      }
      if (
        wallet.chainId.replace("eip155:", "") !==
        chainConfig.chain.id.toString()
      ) {
        throw new Error("Wrong chain");
      }

      // Create provider, clients
      const provider = await wallet.getEthereumProvider();
      const publicClient = createPublicClient({
        chain: chainConfig.chain,
        transport: http(),
      });
      const walletClient = createWalletClient({
        chain: chainConfig.chain,
        transport: custom(provider),
      });

      // Create signer, seaport
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const seaport = new Seaport(signer, {
        overrides: {
          contractAddress: chainConfig.seaportContractAddress,
          seaportVersion: chainConfig.seaportVersion,
        },
      });

      // Check buy token allowance
      console.log("Checking buy token allowance...");
      const allowance = await publicClient.readContract({
        address: chainConfig.buyTokenAddress as Address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [
          wallet.address as Address,
          chainConfig.seaportContractAddress as Address,
        ],
      });

      // Approve buy token if allowance is zero
      if (allowance === 0n) {
        console.log("Approving buy token...");
        const { request } = await publicClient.simulateContract({
          address: chainConfig.buyTokenAddress as Address,
          abi: erc20Abi,
          functionName: "approve",
          args: [
            chainConfig.seaportContractAddress as Address,
            2n ** 256n - 1n,
          ],
          account: wallet.address as Address,
        });
        await walletClient.writeContract(request);
      }

      // Create an offer for Doma marketplace
      console.log("Creating offer...");
      const startTime = Math.floor(new Date().getTime() / 1000);
      const endTime = Math.floor(
        new Date(Date.now() + 24 * 60 * 60 * 1000).getTime() / 1000
      );
      const offer = await seaport.createOrder({
        offer: [
          {
            token: chainConfig.buyTokenAddress,
            amount: chainConfig.buyDomainValue.toString(),
          },
        ],
        consideration: [
          {
            itemType: ItemType.ERC721,
            token: props.listing.domain.tokenAddress,
            identifier: props.listing.domain.tokenId,
            recipient: wallet.address,
          },
          {
            token: chainConfig.buyTokenAddress,
            amount: chainConfig.buyFees.domaProtocolFee.amount.toString(),
            recipient: chainConfig.buyFees.domaProtocolFee.recipient,
          },
          {
            token: chainConfig.buyTokenAddress,
            amount: chainConfig.buyFees.nameTokenRoyalties.amount.toString(),
            recipient: chainConfig.buyFees.nameTokenRoyalties.recipient,
          },
        ],
        restrictedByZone: true,
        zone: chainConfig.buyZone,
        startTime: startTime.toString(),
        endTime: endTime.toString(),
      });
      const executedOrder = await offer.executeAllActions();

      // Send offer to Doma marketplace
      console.log("Sending offer to Doma marketplace...");
      const { data } = await axios.post(
        "https://api-testnet.doma.xyz/v1/orderbook/offer",
        {
          orderbook: "DOMA",
          chainId: `eip155:${chainConfig.chain.id}`,
          parameters: executedOrder.parameters,
          signature: executedOrder.signature,
        },
        {
          headers: {
            "API-Key": process.env.NEXT_PUBLIC_DOMA_API_KEY,
          },
        }
      );
      const offerId = data.orderId;

      // Update listing
      console.log("Updating listing...");
      await axios.patch(`/api/listings/${props.listing._id}`, {
        buyerAddress: wallet.address,
        buyerOfferId: offerId,
      });

      props.onBuyListing();
    } catch (error) {
      handleError(error, "Failed to buy a listing, try again later");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSkipListing() {
    console.log("Skipping listing...");
    props.onSkipListing();
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 lg:min-h-[64vh]">
        {/* Left part */}
        <div className="lg:max-w-xl">
          <Image
            src="/images/box-opened.png"
            alt="Opened box"
            priority={false}
            width="100"
            height="100"
            sizes="100vw"
            className="w-full rounded-xl"
          />
        </div>
        {/* Right part */}
        <div className="lg:max-w-md">
          {/* Title, subtitle */}
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter">
            Mystery box is open!
          </h1>
          <p className="font-medium tracking-tight text-muted-foreground mt-2">
            See the domain and its score, then choose whether to buy it
          </p>
          {/* Name */}
          <div className="flex flex-row gap-3 mt-4">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <GlobeIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Domain</p>
              <p className="text-sm">{props.listing.domain.name}</p>
            </div>
          </div>
          {/* Score */}
          <div className="flex flex-row gap-3 mt-4">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <StarIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-sm">{props.listing.domainScore.average}</p>
              <p className="text-sm text-muted-foreground">
                Moz DA = {props.listing.domainScore.mozDa}
              </p>
              <p className="text-sm text-muted-foreground">
                Ahrefs DR = {props.listing.domainScore.ahrefsDr}
              </p>
              <p className="text-sm text-muted-foreground">
                Semrush Authority = {props.listing.domainScore.semrushAuthority}
              </p>
            </div>
          </div>
          {/* Price */}
          <div className="flex flex-row gap-3 mt-4">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <DollarSignIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-sm">
                {formatEther(chainConfig.buyDomainValue)}{" "}
                {chainConfig.buyTokenSymbol}
              </p>
            </div>
          </div>
          {/* Actions */}
          <div className="flex flex-row gap-2 mt-8">
            <Button disabled={isProcessing} onClick={handleBuyListing}>
              {isProcessing ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <CheckIcon />
              )}{" "}
              Buy Domain
            </Button>
            <Button
              variant="secondary"
              disabled={isProcessing}
              onClick={handleSkipListing}
            >
              {isProcessing ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <XIcon />
              )}{" "}
              Skip Domain
            </Button>
          </div>
        </div>
      </div>
      <Confetti
        width={document.body.clientWidth}
        height={document.body.scrollHeight}
        recycle={false}
      />
    </div>
  );
}
