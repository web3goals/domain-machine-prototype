import { BoxesIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import Confetti from "react-confetti";
import { Button } from "../ui/button";

export default function BoxBuyListingBought() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 lg:min-h-[64vh]">
        {/* Left part */}
        <div className="lg:max-w-xl">
          <Image
            src="/images/box-pending.png"
            alt="Pending box"
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
            Buying pending...
          </h1>
          <p className="font-medium tracking-tight text-muted-foreground mt-2">
            Please wait for the seller to complete the sale, you can track its
            status on your bought domains page
          </p>
          {/* Actions */}
          <div className="flex flex-row gap-2 mt-8">
            <Link href="/listings/bought">
              <Button>
                <BoxesIcon />
                Go To Bought Domains
              </Button>
            </Link>
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
