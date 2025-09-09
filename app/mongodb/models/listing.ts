import { Domain } from "@/types/domain";
import { DomainScore } from "@/types/domain-score";
import { ObjectId } from "mongodb";

export class Listing {
  constructor(
    public createdAt: Date,
    public creatorAddress: string,
    public domain: Domain,
    public domainScore: DomainScore,
    public _id?: ObjectId
  ) {}
}
