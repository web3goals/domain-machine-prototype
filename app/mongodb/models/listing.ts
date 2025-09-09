import { Domain } from "@/types/domain";
import { ObjectId } from "mongodb";

export class Listing {
  constructor(
    public createdAt: Date,
    public creatorAddress: string,
    public domain: Domain,
    public _id?: ObjectId
  ) {}
}
