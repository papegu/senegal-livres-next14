// utils/fileDb.ts
import { promises as fs } from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "market.json");

const defaultDb = {
  users: [],
  books: [],
  transactions: [],
  purchases: [],
  cart: [],
  submissions: [],
};

async function ensureFile(): Promise<void> {
  const dir = path.dirname(dbPath);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(defaultDb, null, 2), "utf8");
  }
}

export async function readDB(): Promise<any> {
  await ensureFile();
  const raw = await fs.readFile(dbPath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    // Reset to default if corrupted
    await fs.writeFile(dbPath, JSON.stringify(defaultDb, null, 2), "utf8");
    return { ...defaultDb };
  }
}

export async function writeDB(content: any): Promise<void> {
  await ensureFile();
  await fs.writeFile(dbPath, JSON.stringify(content, null, 2), "utf8");
}
