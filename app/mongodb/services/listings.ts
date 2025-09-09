import { mongodbConfig } from "@/config/mongodb";
import { Listing } from "../models/listing";
import { getCollection } from "./collections";

export async function insertListing(listing: Listing): Promise<void> {
  console.log("Inserting listing...");
  const collection = await getCollection<Listing>(
    mongodbConfig.collections.listings
  );
  await collection.insertOne(listing);
}

export async function findListings(args?: {
  creatorAddress?: string;
}): Promise<Listing[]> {
  console.log("Finding listings...");
  const collection = await getCollection<Listing>(
    mongodbConfig.collections.listings
  );
  const listings = await collection
    .find({
      ...(args?.creatorAddress !== undefined && {
        creatorAddress: args.creatorAddress,
      }),
    })
    .sort({ createdAt: -1 })
    .toArray();
  return listings;
}
