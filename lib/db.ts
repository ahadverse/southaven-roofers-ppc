import "server-only";
import dns from "node:dns";
import { MongoClient, type Db } from "mongodb";

// Some local networks/DNS proxies can't answer the SRV lookup that "mongodb+srv://" needs
// (error: querySrv ECONNREFUSED). Set MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1 locally to work around it.
// Leave it unset on Vercel.
if (process.env.MONGODB_DNS_SERVERS) {
  dns.setServers(process.env.MONGODB_DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean));
}

// One MongoClient per server instance (reused across requests and hot reloads).
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export const isDbConfigured = () => Boolean(process.env.MONGODB_URI);

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local / Vercel environment variables.");
  if (!globalThis._mongoClientPromise) {
    globalThis._mongoClientPromise = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 })
      .connect()
      .catch((err) => {
        globalThis._mongoClientPromise = undefined; // allow a retry on the next request
        throw err;
      });
  }
  const client = await globalThis._mongoClientPromise;
  return client.db(process.env.MONGODB_DB || "southaven_roofers");
}

/** Collection names in one place. */
export const COLLECTIONS = {
  docs: "docs",
  settings: "settings",
  events: "events",
} as const;
