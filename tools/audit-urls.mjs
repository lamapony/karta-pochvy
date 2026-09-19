#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "desk.json"), "utf8"));

function ctrl(ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, done: () => clearTimeout(t) };
}

async function once(url, method) {
  const gate = ctrl(15000);
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: gate.signal,
      headers: { "user-agent": "karta-pochvy-check/1" }
    });
    gate.done();
    return { status: res.status, ok: res.ok, final: res.url };
  } catch (e) {
    gate.done();
    return { status: 0, ok: false, error: (e.cause && e.cause.code) || e.message };
  }
}

const rows = [];
for (const [id, doc] of Object.entries(data.docs)) {
  const url = (doc.url || "").trim();
  if (!url) {
    rows.push({ id, url: "", status: "empty", archive: doc.archive || "", paywall: !!doc.paywall });
    continue;
  }
  let r = await once(url, "HEAD");
  if (r.status === 405 || r.status === 501 || r.status === 0) r = await once(url, "GET");
  let snap = "";
  try {
    const gate = ctrl(12000);
    const avail = await fetch(
      "https://archive.org/wayback/available?url=" + encodeURIComponent(url),
      { signal: gate.signal, headers: { "user-agent": "karta-pochvy-check/1" } }
    );
    gate.done();
    if (avail.ok) {
      const j = await avail.json();
      snap = (j.archived_snapshots && j.archived_snapshots.closest && j.archived_snapshots.closest.url) || "";
    }
  } catch (_) {}
  rows.push({
    id,
    url,
    status: r.error || String(r.status),
    archive: doc.archive || "",
    snap,
    paywall: !!doc.paywall
  });
  console.log(id, r.error || r.status, snap ? "snap" : "no-snap");
}

const md = [
  "# A1 · URL audit",
  "",
  `Date: ${data.issue.asOf}. HEAD then GET. Wayback availability API.`,
  "",
  "| id | status | paywall | wayback closest | url |",
  "|---|---|---|---|---|"
];
for (const r of rows) {
  md.push(`| ${r.id} | ${r.status} | ${r.paywall ? "yes" : ""} | ${r.snap ? "yes" : ""} | ${r.url} |`);
}
writeFileSync(join(root, "notes", "urls.md"), md.join("\n") + "\n");
console.log("wrote notes/urls.md", rows.length);
