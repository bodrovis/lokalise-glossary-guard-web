import { mkdir, rm, writeFile } from "node:fs/promises";
import AdmZip from "adm-zip";

const repo = "bodrovis/lokalise-glossary-guard";
const version = process.env.GUARD_VERSION || "latest";

if (version === "latest") {
  throw new Error(
    "latest with versioned zip name is ambiguous; set GUARD_VERSION=v1.3.0-beta",
  );
}

const base = `https://github.com/${repo}/releases/download/${version}`;
const asset =
  process.env.GUARD_ASSET ||
  `lokalise-glossary-guard_${version.replace(/^v/, "")}_wasm.zip`;

await mkdir("public/wasm", { recursive: true });

const url = `${base}/${asset}`;
console.log(`Fetching ${url}`);

const res = await fetch(url);
if (!res.ok) {
  throw new Error(`Failed to fetch ${asset}: ${res.status} ${res.statusText}\n${url}`);
}

const zipPath = `public/wasm/${asset}`;
await writeFile(zipPath, Buffer.from(await res.arrayBuffer()));

const zip = new AdmZip(zipPath);
zip.extractAllTo("public/wasm", true);

await rm(zipPath);

console.log("WASM assets fetched and extracted.");
