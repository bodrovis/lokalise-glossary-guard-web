import { mkdir, rm, writeFile } from "node:fs/promises";
import AdmZip from "adm-zip";

const repo = "bodrovis/lokalise-glossary-guard";
const requestedVersion = process.env.GUARD_VERSION || "latest";

const githubHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "lokalise-glossary-guard-web",
};

if (process.env.GITHUB_TOKEN) {
  githubHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: githubHeaders });

  if (!res.ok) {
    throw new Error(`GitHub API request failed: ${res.status} ${res.statusText}\n${url}`);
  }

  return res.json();
}

async function resolveRelease(version) {
  if (version !== "latest") {
    const release = await fetchJSON(
      `https://api.github.com/repos/${repo}/releases/tags/${version}`,
    );

    return release;
  }

  // GitHub "latest" means latest non-draft, non-prerelease release.
  return fetchJSON(`https://api.github.com/repos/${repo}/releases/latest`);
}

const release = await resolveRelease(requestedVersion);
const version = release.tag_name;

const assetName =
  process.env.GUARD_ASSET ||
  `lokalise-glossary-guard_${version.replace(/^v/, "")}_wasm.zip`;

const asset = release.assets.find((a) => a.name === assetName);

if (!asset) {
  const available = release.assets.map((a) => `- ${a.name}`).join("\n");

  throw new Error(
    `Asset not found: ${assetName}\n` +
      `Release: ${version}\n` +
      `Available assets:\n${available || "(none)"}`,
  );
}

await mkdir("public/wasm", { recursive: true });

console.log(`Fetching ${asset.browser_download_url}`);

const res = await fetch(asset.browser_download_url);

if (!res.ok) {
  throw new Error(
    `Failed to fetch ${asset.name}: ${res.status} ${res.statusText}\n${asset.browser_download_url}`,
  );
}

const zipPath = `public/wasm/${asset.name}`;
await writeFile(zipPath, Buffer.from(await res.arrayBuffer()));

const zip = new AdmZip(zipPath);
zip.extractAllTo("public/wasm", true);

await rm(zipPath);

console.log(`WASM assets fetched and extracted from ${version}.`);