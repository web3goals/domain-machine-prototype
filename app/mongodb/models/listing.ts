import { Domain } from "@/types/domain";
import { DomainScore } from "@/types/domain-score";
import { ObjectId } from "mongodb";

export class Listing {
  constructor(
    public createdAt: Date,
    public creatorAddress: string,
    public domain: Domain,
    public domainScore: DomainScore,
    public boughtAt?: Date,
    public buyerAddress?: string,
    public buyerOfferId?: string,
    public buyCompletedAt?: Date,
    public buyCompleteTxHash?: string,
    public treasurySharedAt?: Date,
    public treasuryShareValue?: string,
    public treasuryShareTxHash?: string,
    public _id?: ObjectId
  ) {}
}
