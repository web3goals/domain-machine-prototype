import { ObjectId } from "mongodb";

export class Box {
  constructor(
    public createdAt: Date,
    public creatorAddress: string,
    public txHash: string,
    public listingId: ObjectId,
    public _id?: ObjectId
  ) {}
}
