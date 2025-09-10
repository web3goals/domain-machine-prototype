import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { Box } from "@/mongodb/models/box";
import { insertBox } from "@/mongodb/services/boxes";
import { findListings } from "@/mongodb/services/listings";
import { NextRequest } from "next/server";
import z from "zod";

const postRequestBodySchema = z.object({
  creatorAddress: z.string(),
  buyTxHash: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    console.log("Creating a box...");

    // Get and parse request data
    const body = await request.json();
    const bodyParseResult = postRequestBodySchema.safeParse(body);
    if (!bodyParseResult.success) {
      return createFailedApiResponse(
        {
          message: `Request body invalid: ${JSON.stringify(bodyParseResult)}`,
        },
        400
      );
    }

    // TODO: Find only not bought listings
    // Get a random listing for the box
    const listings = await findListings();
    if (listings.length === 0) {
      throw new Error("No listings available to create a box");
    }
    const listing = listings[Math.floor(Math.random() * listings.length)];

    // Create a box
    const box: Box = {
      createdAt: new Date(),
      creatorAddress: bodyParseResult.data.creatorAddress,
      buyTxHash: bodyParseResult.data.buyTxHash,
      listingId: listing._id!,
    };
    const boxId = await insertBox(box);

    return createSuccessApiResponse({
      box: { ...box, _id: boxId },
      listing: listing,
    });
  } catch (error) {
    console.error("Failed to create a box:", error);
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500
    );
  }
}
