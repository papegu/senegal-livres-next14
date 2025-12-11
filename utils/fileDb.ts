// utils/fileDb.ts
import { promises as fs } from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "market.json");

export async function readDB(): Promise<any> {
  const raw = await fs.readFile(dbPath, "utf8");
  return JSON.parse(raw);
}

export async function writeDB(content: any): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(content, null, 2), "utf8");
}
