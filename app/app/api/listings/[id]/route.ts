import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { findListings, upsertListing } from "@/mongodb/services/listings";
import { NextRequest } from "next/server";
import { z } from "zod";

const patchRequestBodySchema = z.object({
  buyerAddress: z.string().optional(),
  buyerOfferId: z.string().optional(),
  buyCompletedTxHash: z.string().optional(),
});

export async function PATCH(request: NextRequest, params: { id: string }) {
  try {
    console.log("Patching a listing...");

    // Get listing ID from params
    const id = params.id;

    // Get and parse request data
    const body = await request.json();
    const bodyParseResult = patchRequestBodySchema.safeParse(body);
    if (!bodyParseResult.success) {
      return createFailedApiResponse(
        {
          message: `Request body invalid: ${JSON.stringify(bodyParseResult)}`,
        },
        400
      );
    }

    // Find the listing
    const listings = await findListings({ id });
    const listing = listings[0];
    if (!listing) {
      return createFailedApiResponse({ message: `Listing not found` }, 404);
    }

    // Update the listing if bought
    if (
      bodyParseResult.data.buyerAddress &&
      bodyParseResult.data.buyerOfferId
    ) {
      listing.boughtAt = new Date();
      listing.buyerAddress = bodyParseResult.data.buyerAddress;
      listing.buyerOfferId = bodyParseResult.data.buyerOfferId;
    }

    // Update the listing if buy completed
    if (bodyParseResult.data.buyCompletedTxHash) {
      listing.buyCompletedAt = new Date();
      listing.buyCompleteTxHash = bodyParseResult.data.buyCompletedTxHash;
    }

    // Save the updated or not updated listing
    await upsertListing(listing);

    return createSuccessApiResponse({ listing });
  } catch (error) {
    console.error("Failed to patch a listing:", error);
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500
    );
  }
}
