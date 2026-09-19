#!/usr/bin/env node
/** Small logic smoke without a browser. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "desk.json"), "utf8"));
const MATCH = data.matchers.map((m) => ({ re: new RegExp(m.re, "i"), folders: m.folders }));

function matchOwn(text) {
  const hit = MATCH.find((k) => k.re.test(text));
  return hit ? hit.folders : [];
}

const cases = [
  ["Никакой прибыли на геноциде", ["blockade", "word"]],
  ["Ingen profit på folkemord", ["blockade", "word"]],
  ["голод как оружие", ["famine", "blockade"]],
  ["абракадабра", []],
  ["right of return", ["return", "states", "unrwa"]],
  ["UNRWA", ["unrwa", "after", "proxy"]]
];
for (const [text, want] of cases) {
  const got = matchOwn(text);
  if (got.join() !== want.join()) {
    throw new Error(`matchOwn(${text}) => ${got} want ${want}`);
  }
}

const html = readFileSync(join(root, "index.html"), "utf8");
if (/fonts\.googleapis|fonts\.gstatic/.test(html)) throw new Error("index.html still loads Google Fonts");
if (/К тексту|Skip to text|Spring til teksten/.test(html)) throw new Error("skip link returned");
const js = readFileSync(join(root, "app.js"), "utf8");
if (/const KEYS/.test(js)) throw new Error("KEYS still in app.js");
if (/"means"/.test(js)) throw new Error("hardcoded folder id in app.js");

const css = readFileSync(join(root, "app.css"), "utf8");
if (!css.includes("@font-face")) throw new Error("app.css missing @font-face");
if (/fonts\.gstatic\.com/.test(css)) throw new Error("app.css still points at gstatic");

console.log("smoke ok", cases.length, "matchers", data.matchers.length);
