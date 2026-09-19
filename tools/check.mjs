#!/usr/bin/env node
/** Corpus check. No dependencies. Exit ≠ 0 on any error. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "desk.json"), "utf8"));
const urls = process.argv.includes("--urls");
const errors = [];
const langs = (data.defaults && data.defaults.langs) || ["ru", "en", "da"];

function err(msg) {
  errors.push(msg);
}

function hasLang(field, L) {
  return field && typeof field === "object" && typeof field[L] === "string" && field[L].length;
}

if (!data.ui || !data.phrases || !data.folders || !data.docs) err("missing top-level keys");
if (!data.defaults || !data.defaults.fallbackFolder) err("missing defaults.fallbackFolder");
if (!data.issue || !data.issue.asOf || !data.issue.number) err("missing issue.asOf/number");
if (!Array.isArray(data.changelog)) err("missing changelog");
if (!data.pages || !data.pages.method) err("missing pages.method");
if (!Array.isArray(data.matchers) || data.matchers.length < 1) err("missing matchers");

const uiKeys = data.ui && data.ui.ru ? Object.keys(data.ui.ru).sort() : [];
for (const L of langs) {
  if (!data.ui[L]) {
    err(`missing ui.${L}`);
    continue;
  }
  const keys = Object.keys(data.ui[L]).sort();
  if (keys.join() !== uiKeys.join()) err(`ui.${L} keys differ from ui.ru`);
  if (!data.ui[L].more) err(`missing ui.${L}.more`);
  if (!data.pages.method[L]) err(`missing pages.method.${L}`);
}

const folderIds = new Set((data.folders || []).map((f) => f.id));
if (data.defaults && !folderIds.has(data.defaults.fallbackFolder)) {
  err(`defaults.fallbackFolder unknown: ${data.defaults.fallbackFolder}`);
}

const need = ["headline", "dek", "steel", "cite", "citeNote", "body", "crack", "title", "note"];
for (const f of data.folders || []) {
  for (const k of need) {
    for (const L of langs) {
      if (!hasLang(f[k], L)) err(`missing ${f.id}.${k}.${L}`);
    }
  }
  for (const id of f.docs || []) {
    if (!data.docs[id]) err(`folder ${f.id} missing doc ${id}`);
  }
  const g = f.guess;
  if (!g || !g.correct || !g.q || !g.ok || !g.bad || !g.options) err(`folder ${f.id} missing guess`);
  else {
    if (!g.options.some((o) => o.id === g.correct)) err(`folder ${f.id} guess.correct missing`);
    for (const L of langs) {
      if (!hasLang(g.q, L) || !hasLang(g.ok, L) || !hasLang(g.bad, L)) err(`folder ${f.id} guess lang ${L}`);
      for (const o of g.options) {
        if (!hasLang(o.text, L)) err(`folder ${f.id} option ${o.id}.${L}`);
      }
    }
  }
}

const guessQs = (data.folders || []).map((f) => f.guess && f.guess.q && f.guess.q.ru);
if (new Set(guessQs).size !== guessQs.length) err("guess questions must differ by argument");

const opened = new Set();
for (const p of data.phrases || []) {
  for (const L of langs) {
    if (!hasLang(p.text, L)) err(`missing phrase ${p.id}.${L}`);
  }
  if (!p.folders || p.folders.length < 2) err(`phrase ${p.id} opens fewer than two arguments`);
  for (const id of p.folders || []) {
    if (!folderIds.has(id)) err(`phrase ${p.id} unknown folder ${id}`);
    opened.add(id);
  }
}
for (const id of folderIds) {
  if (!opened.has(id)) err(`folder ${id} opened by no phrase`);
}

const used = new Set((data.folders || []).flatMap((f) => f.docs));
for (const id of Object.keys(data.docs || {})) {
  const doc = data.docs[id];
  for (const L of langs) {
    if (!hasLang(doc.body, L)) err(`missing doc ${id}.body.${L}`);
    if (!hasLang(doc.why, L)) err(`missing doc ${id}.why.${L}`);
    if (!hasLang(doc.title, L) && typeof doc.title !== "string") err(`missing doc ${id}.title.${L}`);
    if (!hasLang(doc.kind, L) && typeof doc.kind !== "string") err(`missing doc ${id}.kind.${L}`);
  }
  if (doc.date == null) err(`missing doc ${id}.date`);
  if (doc.url == null) err(`missing doc ${id}.url`);
  if (!used.has(id)) err(`orphan doc ${id}`);
  const kindRu = (doc.kind && doc.kind.ru) || doc.kind;
  if ((kindRu === "норма" || kindRu === "резолюция") && !doc.quote) {
    err(`doc ${id} (${kindRu}) missing quote`);
  }
  const url = (doc.url || "").trim();
  if (url && !doc.paywall && !doc.archive) err(`doc ${id} missing archive`);
}

for (const m of data.matchers || []) {
  if (!m.re) {
    err("matcher missing re");
    continue;
  }
  try {
    new RegExp(m.re, "i");
  } catch (e) {
    err(`matcher re failed: ${m.re} (${e.message})`);
  }
  for (const id of m.folders || []) {
    if (!folderIds.has(id)) err(`matcher unknown folder ${id}`);
  }
}

function unique(label, list) {
  if (new Set(list).size !== list.length) err(`duplicate ${label} id`);
}
unique("folder", (data.folders || []).map((f) => f.id));
unique("phrase", (data.phrases || []).map((p) => p.id));
unique("doc", Object.keys(data.docs || {}));

async function checkUrls() {
  const ctrl = (ms) => {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), ms);
    return { signal: c.signal, done: () => clearTimeout(t) };
  };
  for (const [id, doc] of Object.entries(data.docs || {})) {
    const url = (doc.url || "").trim();
    if (!url || doc.paywall || doc.botBlock) continue;
    const gate = ctrl(15000);
    try {
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: gate.signal,
        headers: { "user-agent": "karta-pochvy-check/1" }
      });
      gate.done();
      if (res.status === 405 || res.status === 501) {
        const gate2 = ctrl(15000);
        const res2 = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: gate2.signal,
          headers: { "user-agent": "karta-pochvy-check/1" }
        });
        gate2.done();
        if (res2.status >= 400) err(`doc ${id} GET ${res2.status} ${url}`);
      } else if (res.status >= 400) {
        err(`doc ${id} HEAD ${res.status} ${url}`);
      }
    } catch (e) {
      gate.done();
      err(`doc ${id} fetch ${e.cause && e.cause.code ? e.cause.code : e.message} ${url}`);
    }
  }
}

if (urls) await checkUrls();

if (errors.length) {
  for (const e of errors) console.error(e);
  console.error(`${errors.length} error(s)`);
  process.exit(1);
}
console.log(
  `ok ${data.folders.length} folders, ${data.phrases.length} phrases, ${Object.keys(data.docs).length} docs` +
    (urls ? ", urls checked" : "")
);
