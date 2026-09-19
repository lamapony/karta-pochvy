#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "desk.json"), "utf8"));

function pack(L) {
  const out = [];
  out.push(`# Legal pack · ${L} · as of ${data.issue.asOf}`);
  out.push("");
  out.push("Questions for counsel:");
  out.push("1. Is proportionality correctly stated as expected civilian harm against the concrete and direct military advantage of that attack (AP I 51(5)(b)), not a body-count?");
  out.push("2. Is the reading of 51(8) correct: a shield breach does not release the attacker from precautions?");
  out.push("3. Is art. 51 of the Charter correctly limited: after an armed attack, not a blank sheet for means?");
  out.push("4. Is the Genocide Convention II quote (acts + specific intent to destroy a group as such) complete enough?");
  out.push("5. Is GC IV 34 correctly treated as an absolute ban, not a bargaining chip?");
  out.push("6. Is UNGA 194 §11 correctly read as wish/permission, without the word “right”?");
  out.push("7. Is 242 correctly held as withdrawal and recognition together, including the English/French article dispute?");
  out.push("8. Is 49(6) vs Levy presented as a dispute about the norm, not as a settled fact?");
  out.push("9. Is AP I 54 correctly split from an IPC phase?");
  out.push("10. Are ICJ 2024 provisional measures correctly limited to plausible rights, not a finding of genocide?");
  out.push("");
  for (const f of data.folders) {
    out.push(`## ${f.id} · ${f.title[L]}`);
    out.push("");
    out.push(f.headline[L]);
    out.push("");
    out.push("Steel");
    out.push(f.steel[L]);
    out.push("");
    out.push(`Cite: ${f.cite[L]}`);
    out.push(f.citeNote[L]);
    out.push("");
    out.push(`Guess: ${f.guess.q[L]}`);
    for (const o of f.guess.options) {
      out.push(`- [${o.id === f.guess.correct ? "x" : " "}] ${o.text[L]}`);
    }
    out.push(`ok: ${f.guess.ok[L]}`);
    out.push(`bad: ${f.guess.bad[L]}`);
    out.push("");
    out.push("Crack");
    out.push(f.crack[L]);
    out.push("");
    for (const id of f.docs) {
      const d = data.docs[id];
      out.push(`### ${id} · ${d.title[L] || d.title}`);
      out.push(`${d.kind[L] || d.kind} · ${d.date} · ${d.url || "—"}`);
      out.push(d.why[L]);
      if (d.quote) out.push(`QUOTE (${d.quoteLang || "?"}): ${d.quote}`);
      out.push(d.body[L]);
      out.push("");
    }
  }
  return out.join("\n");
}

const text = pack("ru") + "\n\n----\n\n" + pack("en") + "\n";
const dest = join(root, "notes", "legal-pack.md");
writeFileSync(dest, text);
console.log("wrote", dest, text.length);
