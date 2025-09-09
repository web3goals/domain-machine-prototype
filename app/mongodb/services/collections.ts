import { Collection, Document } from "mongodb";
import { mongodbConfig } from "../../config/mongodb";
import clientPromise from "../client";

export async function getCollection<T extends Document>(
  name: string
): Promise<Collection<T>> {
  const client = await clientPromise;
  const db = client.db(mongodbConfig.database);
  return db.collection<T>(name);
}
