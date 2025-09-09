import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { Listing } from "@/mongodb/models/listing";
import { findListings, insertListing } from "@/mongodb/services/listings";
import { DomainScore } from "@/types/domain-score";
import { NextRequest } from "next/server";
import { z } from "zod";

const postRequestBodySchema = z.object({
  creatorAddress: z.string(),
  domain: z.object({
    name: z.string(),
    tokenId: z.string(),
    tokenAddress: z.string(),
    ownerAddress: z.string(),
    networkId: z.string(),
  }),
});

export async function GET(request: NextRequest) {
  try {
    console.log("Getting listings...");

    // Extract creatorAddress query parameter
    const searchParams = request.nextUrl.searchParams;
    const creatorAddress = searchParams.get("creatorAddress");

    // Check if creatorAddress is provided
    if (!creatorAddress) {
      return createFailedApiResponse(
        { message: "creatorAddress query parameter is required" },
        400
      );
    }

    // Fetch listings with filter
    const listings = await findListings({ creatorAddress });

    return createSuccessApiResponse({ listings });
  } catch (error) {
    console.error("Failed to get listings:", error);
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500
    );
  }
}

// TODO: Check that the domain is not already listed
export async function POST(request: NextRequest) {
  try {
    console.log("Creating a listing...");

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

    // Define random domain score
    const mozDa = Math.floor(Math.random() * 101);
    const ahrefsDr = Math.floor(Math.random() * 101);
    const semrushAuthority = Math.floor(Math.random() * 101);
    const average = Math.floor((mozDa + ahrefsDr + semrushAuthority) / 3);
    const domainScore: DomainScore = {
      average: average,
      mozDa: mozDa,
      ahrefsDr: ahrefsDr,
      semrushAuthority: semrushAuthority,
    };

    // Create and insert the listing
    const listing: Listing = {
      createdAt: new Date(),
      creatorAddress: bodyParseResult.data.creatorAddress,
      domain: bodyParseResult.data.domain,
      domainScore: domainScore,
    };
    const listingId = await insertListing(listing);

    return createSuccessApiResponse({
      listing: { ...listing, _id: listingId },
    });
  } catch (error) {
    console.error("Failed to create a listing:", error);
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500
    );
  }
}
