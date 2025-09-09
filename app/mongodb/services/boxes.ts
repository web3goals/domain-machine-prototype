import { mongodbConfig } from "@/config/mongodb";
import { ObjectId } from "mongodb";
import { Box } from "../models/box";
import { getCollection } from "./collections";

export async function insertBox(box: Box): Promise<ObjectId> {
  console.log("Inserting box...");
  const collection = await getCollection<Box>(mongodbConfig.collections.boxes);
  const insertOneResult = await collection.insertOne(box);
  return insertOneResult.insertedId;
}
