#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "desk.json"), "utf8"));
const host = (data.issue && data.issue.canonical) || "";
const href = (p) => (host ? host.replace(/\/$/, "") + p : p);

function xml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const entries = (data.changelog || []).map((row, i) => {
  const title = (row.text && (row.text.en || row.text.ru)) || row.date;
  return `  <entry>
    <id>urn:pochva:${row.date}:${i}</id>
    <title>${xml(title)}</title>
    <updated>${xml(row.date)}T00:00:00Z</updated>
    <content type="text">${xml((row.text && row.text.ru) || title)}</content>
  </entry>`;
});

const updated = (data.changelog[0] && data.changelog[0].date) || data.issue.asOf;
const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${xml(data.ui.ru.title)} · ${xml(data.ui.ru.issueWord)} ${xml(data.issue.roman)} · ${xml(data.issue.title.ru)}</title>
  <id>urn:pochva:issue-${data.issue.number}</id>
  <updated>${xml(updated)}T00:00:00Z</updated>
  <link href="${xml(href("/"))}"/>
  <link rel="self" href="${xml(href("/feed.xml"))}"/>
${entries.join("\n")}
</feed>
`;
writeFileSync(join(root, "feed.xml"), feed);
console.log("wrote feed.xml", (data.changelog || []).length, "entries");
