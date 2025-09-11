import { mongodbConfig } from "@/config/mongodb";
import { ObjectId, UpdateResult } from "mongodb";
import { Listing } from "../models/listing";
import { getCollection } from "./collections";

export async function upsertListing(
  listing: Listing
): Promise<UpdateResult<Listing>> {
  console.log("Upserting listing...");
  const collection = await getCollection<Listing>(
    mongodbConfig.collections.listings
  );
  const updateResult = await collection.replaceOne(
    { _id: listing._id },
    listing,
    { upsert: true }
  );
  return updateResult;
}

export async function findListings(args?: {
  id?: string;
  domainName?: string;
  creatorAddress?: string;
  buyerAddress?: string;
}): Promise<Listing[]> {
  console.log("Finding listings...");
  const collection = await getCollection<Listing>(
    mongodbConfig.collections.listings
  );
  const listings = await collection
    .find({
      ...(args?.id !== undefined && { _id: new ObjectId(args.id) }),
      ...(args?.creatorAddress !== undefined && {
        creatorAddress: args.creatorAddress,
      }),
      ...(args?.domainName !== undefined && { "domain.name": args.domainName }),
      ...(args?.buyerAddress !== undefined && {
        buyerAddress: args.buyerAddress,
      }),
    })
    .sort({ createdAt: -1 })
    .toArray();
  return listings;
}
