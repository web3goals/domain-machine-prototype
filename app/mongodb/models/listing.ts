import { Domain } from "@/types/domain";
import { DomainScore } from "@/types/domain-score";
import { ObjectId } from "mongodb";

export class Listing {
  constructor(
    public createdAt: Date,
    public creatorAddress: string,
    public domain: Domain,
    public domainScore: DomainScore,
    public buyValue: string, // Amount of tokens to buy the domain
    public boughtAt?: Date,
    public buyerAddress?: string,
    public buyerOfferId?: string,
    public buyCompletedAt?: Date,
    public buyCompleteTxHash?: string,
    public treasurySharedAt?: Date,
    public treasuryShareValue?: string, // Amount of tokens received from treasury
    public treasuryShareTxHash?: string,
    public _id?: ObjectId
  ) {}
}
