// Copy the starter markdown content (content/*) and default settings into MongoDB.
// Usage: npm run db:seed                 (keeps documents that already exist)
//        npm run db:seed -- --overwrite  (replaces them with the markdown versions)
// Reads MONGODB_URI / MONGODB_DB from the environment (.env.local via --env-file).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import dns from "node:dns";
import { MongoClient } from "mongodb";

if (process.env.MONGODB_DNS_SERVERS) dns.setServers(process.env.MONGODB_DNS_SERVERS.split(",").map((x) => x.trim()));

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local first.");
  process.exit(1);
}
const overwrite = process.argv.includes("--overwrite");
const toDate = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? ""));

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
await client.connect();
const db = client.db(process.env.MONGODB_DB || "southaven_roofers");
const docs = db.collection("docs");
await docs.createIndex({ collection: 1, slug: 1 }, { unique: true });
await docs.createIndex({ collection: 1, status: 1 });
await db.collection("events").createIndex({ createdAt: -1 });

let inserted = 0;
let updated = 0;
let skipped = 0;
const now = new Date();
for (const collection of ["services", "guides", "blog", "legal"]) {
  const dir = path.join(root, "content", collection);
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    const doc = {
      collection,
      slug: file.replace(/\.md$/, ""),
      status: "published",
      title: data.title,
      metaTitle: data.metaTitle,
      description: data.description,
      navLabel: data.navLabel ?? data.title,
      excerpt: data.excerpt ?? data.description,
      image: String(data.image ?? "roofer-nail-gun-shingles"),
      ...(data.icon && { icon: data.icon }),
      order: Number(data.order ?? 99),
      date: toDate(data.date ?? data.updated),
      updated: toDate(data.updated ?? data.date),
      ...(data.category && { category: data.category }),
      faqs: data.faqs ?? [],
      related: data.related ?? [],
      sources: data.sources ?? [],
      body: content.trim(),
    };
    const existing = await docs.findOne({ collection, slug: doc.slug }, { projection: { _id: 1 } });
    if (existing && !overwrite) {
      skipped++;
    } else if (existing) {
      await docs.updateOne({ _id: existing._id }, { $set: { ...doc, updatedAt: now } });
      updated++;
    } else {
      await docs.insertOne({ ...doc, createdAt: now, updatedAt: now });
      inserted++;
    }
  }
}

// Default settings from env (only if none saved yet).
const settings = db.collection("settings");
if (!(await settings.findOne({ _id: "site" }))) {
  await settings.insertOne({
    _id: "site",
    phoneNumber: process.env.NEXT_PUBLIC_PHONE_NUMBER ?? "",
    callHours: process.env.NEXT_PUBLIC_CALL_HOURS ?? "",
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
    updatedAt: now,
  });
  console.log("Created default settings from env.");
}

console.log(`Done: ${inserted} inserted, ${updated} updated, ${skipped} kept as-is.`);
await client.close();
