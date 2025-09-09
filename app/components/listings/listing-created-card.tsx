import { Listing } from "@/mongodb/models/listing";
import { CalendarIcon } from "lucide-react";

// TODO: Complete the component
export function CreatedListingCard(props: { listing: Listing }) {
  return (
    <div className="w-full flex flex-row gap-6 border rounded px-6 py-6">
      {/* Left part */}
      <div className="flex items-center justify-center border rounded-xl size-40 bg-accent">
        <p className="text-xl font-semibold text-accent-foreground">
          {props.listing.domain.name}
        </p>
      </div>
      {/* Right part */}
      <div className="flex-1">
        {/* Params */}
        <div className="flex flex-col gap-4">
          {/* Listed */}
          <div className="flex flex-row gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <CalendarIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Listed</p>
              <p className="text-sm">
                {new Date(props.listing.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
