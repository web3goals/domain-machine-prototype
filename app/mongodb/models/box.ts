import { ObjectId } from "mongodb";

export class Box {
  constructor(
    public createdAt: Date,
    public creatorAddress: string,
    public buyTxHash: string,
    public listingId: ObjectId,
    public _id?: ObjectId
  ) {}
}
