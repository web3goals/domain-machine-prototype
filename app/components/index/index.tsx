import { CoinsIcon, GiftIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export default function Index() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 lg:min-h-[64vh]">
        <div className="lg:max-w-xl">
          <Image
            src="/images/hero.png"
            alt="Hero"
            priority={false}
            width="100"
            height="100"
            sizes="100vw"
            className="w-full rounded-xl"
          />
        </div>
        <div className="lg:max-w-md">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter">
            Gamified Domain Trading with Mystery Boxes
          </h1>
          <p className="font-medium tracking-tight text-muted-foreground mt-2">
            A platform built on Doma Protocol that gamifies domain trading with
            fixed-price mystery boxes, offering random domains scored from 0-100
            and driving higher engagement for sellers
          </p>
          <div className="flex flex-row gap-2 mt-4">
            {/* TODO: Define icon, link */}
            <Link href="/listings/boxes/buy">
              <Button>
                <GiftIcon /> Buy Mystery Box
              </Button>
            </Link>
            {/* TODO: Define icon, link */}
            <Link href="/listings/created">
              <Button variant="secondary">
                <CoinsIcon /> Sell Domains
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
