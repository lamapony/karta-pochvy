#!/usr/bin/env node
/** Resolve Wayback closest snapshots into desk.json. No npm packages. */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "desk.json");
const data = JSON.parse(readFileSync(path, "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ctrl(ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, done: () => clearTimeout(t) };
}

function snapshotUrl(ts, original) {
  return `https://web.archive.org/web/${ts}/${original}`;
}

async function cdx(url) {
  const q =
    "https://web.archive.org/cdx/search/cdx?url=" +
    encodeURIComponent(url) +
    "&output=json&fl=timestamp,original,statuscode&filter=statuscode:200&limit=1&fastLatest=true";
  const gate = ctrl(20000);
  try {
    const res = await fetch(q, {
      signal: gate.signal,
      headers: { "user-agent": "karta-pochvy-archive/1" }
    });
    gate.done();
    if (!res.ok) return { error: `cdx ${res.status}` };
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length < 2) return { error: "cdx empty" };
    const [ts, original] = rows[1];
    if (!ts) return { error: "cdx empty" };
    return { snap: snapshotUrl(ts, original || url), ts };
  } catch (e) {
    gate.done();
    return { error: (e.cause && e.cause.code) || e.message };
  }
}

async function available(url) {
  const q = "https://archive.org/wayback/available?url=" + encodeURIComponent(url);
  const gate = ctrl(20000);
  try {
    const res = await fetch(q, {
      signal: gate.signal,
      headers: { "user-agent": "karta-pochvy-archive/1" }
    });
    gate.done();
    if (!res.ok) return { error: `avail ${res.status}` };
    const j = await res.json();
    const closest = j.archived_snapshots && j.archived_snapshots.closest;
    if (closest && closest.url) return { snap: closest.url, ts: closest.timestamp || "" };
    return { error: "avail empty" };
  } catch (e) {
    gate.done();
    return { error: (e.cause && e.cause.code) || e.message };
  }
}

const rows = [];
for (const [id, doc] of Object.entries(data.docs || {})) {
  const url = (doc.url || "").trim();
  if (!url) {
    rows.push({ id, status: "empty" });
    continue;
  }
  let hit = await cdx(url);
  if (hit.error) {
    await sleep(800);
    hit = await available(url);
  }
  if (hit.snap) {
    doc.archive = hit.snap;
    rows.push({ id, status: "snap", ts: hit.ts || "", snap: hit.snap });
    console.log(id, "snap", hit.ts || "");
  } else {
    if (!doc.archive) doc.archive = "https://web.archive.org/web/" + url;
    rows.push({ id, status: hit.error || "none" });
    console.log(id, hit.error || "none");
  }
  await sleep(1200);
}

writeFileSync(path, JSON.stringify(data, null, 2) + "\n");

const md = [
  "# A1 · URL audit",
  "",
  `Date: ${data.issue.asOf}. Wayback CDX, then availability API. Lookup URLs replaced where a closest snapshot exists.`,
  "",
  "| id | status | timestamp | archive |",
  "|---|---|---|---|"
];
for (const r of rows) {
  md.push(`| ${r.id} | ${r.status} | ${r.ts || ""} | ${r.snap || ""} |`);
}
writeFileSync(join(root, "notes", "urls.md"), md.join("\n") + "\n");
const ok = rows.filter((r) => r.status === "snap").length;
console.log("wrote desk.json and notes/urls.md", ok, "snapshots /", rows.length);
