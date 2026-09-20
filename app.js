let DATA = null;
let MATCH = [];

const state = {
  lang: null,
  phraseId: null,
  phraseText: null,
  openIds: [],
  unknown: false,
  guessed: false,
  guessOk: null,
  guessChoice: null,
  docId: null,
  seen: { folders: [], docs: [] },
  returnTo: null,
  phraseOrder: [],
  seed: 0,
  morePhrases: false
};

const app = document.getElementById("app");

const langs = () => DATA.defaults.langs;
const langLabel = () => DATA.defaults.langLabel;
const fallbackId = () => DATA.defaults.fallbackFolder;

const t = (field) => {
  if (field == null) return "";
  if (typeof field === "string") return field;
  return field[state.lang] || field.ru || "";
};

function U(key) {
  return DATA.ui[state.lang][key];
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paras(text) {
  return String(text)
    .split(/\n\n+/)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
}

function folderById(id) {
  return DATA.folders.find((f) => f.id === id);
}

function matchOwn(text) {
  const hit = MATCH.find((k) => k.re.test(text));
  return hit ? hit.folders : [];
}

function openFolders(ids) {
  return (ids || []).filter((id) => folderById(id));
}

function go(hash) {
  location.hash = hash;
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const parts = raw.split("/").filter(Boolean);
  if (!parts.length) return { screen: "lang" };
  if (parts[0] === "method") return { screen: "method", lang: state.lang || "ru" };
  const lang = langs().includes(parts[0]) ? parts[0] : null;
  if (!lang) return { screen: "lang" };
  if (parts.length === 1 || parts[1] === "phrase") return { screen: "phrase", lang };
  if (parts[1] === "guess") return { screen: "guess", lang };
  if (parts[1] === "soil") return { screen: "soil", lang };
  if (parts[1] === "protocol") return { screen: "protocol", lang };
  if (parts[1] === "method") return { screen: "method", lang };
  if (parts[1] === "doc" && parts[2]) return { screen: "doc", lang, docId: parts[2] };
  const folder = folderById(parts[1]);
  if (!folder) return { screen: "phrase", lang };
  if (parts[2] && DATA.docs[parts[2]]) return { screen: "doc", lang, docId: parts[2] };
  return { screen: "folder", lang, folder };
}

function persist() {
  sessionStorage.setItem("pochva", JSON.stringify({
    lang: state.lang,
    phraseId: state.phraseId,
    phraseText: state.phraseText,
    openIds: state.openIds,
    unknown: state.unknown,
    guessed: state.guessed,
    guessOk: state.guessOk,
    guessChoice: state.guessChoice,
    seen: state.seen,
    returnTo: state.returnTo,
    phraseOrder: state.phraseOrder,
    seed: state.seed,
    morePhrases: state.morePhrases
  }));
}

function restore() {
  try {
    const saved = JSON.parse(sessionStorage.getItem("pochva") || "null");
    if (saved) Object.assign(state, saved);
    if (!state.seen || !Array.isArray(state.seen.folders)) {
      state.seen = { folders: [], docs: [] };
    }
  } catch (_) {}
}

function markSeen(type, id) {
  if (!id || !state.seen[type]) return;
  if (!state.seen[type].includes(id)) state.seen[type].push(id);
}

function ring() {
  const ids = [];
  for (const id of state.openIds || []) if (!ids.includes(id)) ids.push(id);
  for (const f of DATA.folders) if (!ids.includes(f.id)) ids.push(f.id);
  return ids;
}

function docStep(folder, docId) {
  if (!folder) return null;
  const unread = folder.docs.filter((id) => id !== docId && !state.seen.docs.includes(id));
  if (!unread[0]) return null;
  const d = DATA.docs[unread[0]];
  const label = unread[0] === folder.docs[0] ? t(folder.cite) : t(d.title);
  return { href: `#/${state.lang}/doc/${unread[0]}`, label };
}

function otherArgs(folder) {
  const open = (state.openIds || []).filter((id) => folderById(id));
  const ids = open.length ? open : ring();
  const short = ids.length > 4;
  const steps = ids
    .filter((id) => !folder || id !== folder.id)
    .map((id) => {
      const f = folderById(id);
      return { href: `#/${state.lang}/${id}`, label: t(short ? f.title : f.headline) };
    });
  const openDone = !open.length || open.every((id) => state.seen.folders.includes(id));
  if (openDone) {
    const extra = ring().find((id) => !open.includes(id) && !state.seen.folders.includes(id));
    if (extra && !steps.some((s) => s.href === `#/${state.lang}/${extra}`)) {
      const f = folderById(extra);
      steps.push({ href: `#/${state.lang}/${extra}`, label: t(f.headline) });
    } else if (!steps.length) {
      steps.push({ href: `#/${state.lang}/phrase`, label: U("again") });
    }
  }
  if (state.seen.folders.length >= 2) {
    const href = `#/${state.lang}/protocol`;
    if (!steps.some((s) => s.href === href)) {
      steps.push({ href, label: U("protocol") });
    }
  }
  return steps;
}

function fallHtml(steps, kicker) {
  const list = (Array.isArray(steps) ? steps : [steps]).filter(Boolean);
  if (!list.length) return "";
  const head = kicker ? `<p class="fall-kicker">${escapeHtml(kicker)}</p>` : "";
  return `<div class="fall">${head}${list.map((step) => `<p><a href="${step.href}">${escapeHtml(step.label)}</a></p>`).join("")}</div>`;
}

function colophon(label) {
  return `<p class="colophon"><a href="#/${state.lang || "ru"}/method">${escapeHtml(label)}</a></p>`;
}

function setDocTitle(extra) {
  const base = (state.lang && DATA.ui[state.lang] && DATA.ui[state.lang].title) || DATA.ui.ru.title;
  document.title = extra ? `${extra} · ${base}` : base;
}

function setLang(lang) {
  state.lang = lang;
  document.documentElement.lang = lang === "da" ? "da" : lang;
  setDocTitle();
  if (state.phraseId && state.phraseId !== "own") {
    const p = DATA.phrases.find((x) => x.id === state.phraseId);
    if (p) state.phraseText = t(p.text);
  }
  persist();
}

function afterGuessDest() {
  const dest = state.returnTo || `#/${state.lang}/${landingFolder().id}`;
  state.returnTo = null;
  persist();
  go(dest);
}

function choosePhrase(p, unknown) {
  state.phraseId = p.id;
  state.phraseText = typeof p.text === "string" ? p.text : t(p.text);
  state.unknown = !!unknown;
  state.guessed = false;
  state.guessOk = null;
  state.guessChoice = null;
  if (unknown) {
    state.openIds = [];
    persist();
    go(`#/${state.lang}/soil`);
    return;
  }
  let ids = openFolders(p.folders);
  if (state.returnTo) {
    const parts = state.returnTo.replace(/^#\//, "").split("/");
    let prefer = parts[1];
    if (prefer === "doc") {
      const from = DATA.folders.find((f) => f.docs.includes(parts[2]));
      prefer = from && from.id;
    }
    if (prefer && ids.includes(prefer)) {
      ids = [prefer, ...ids.filter((id) => id !== prefer)];
    }
  }
  state.openIds = ids;
  persist();
  go(`#/${state.lang}/guess`);
}

function phraseOrder() {
  const all = DATA.phrases.map((p) => p.id);
  if (state.phraseOrder && state.phraseOrder.length === all.length) return state.phraseOrder;
  let s = state.seed || (state.seed = Date.now());
  const ids = all.slice();
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = ids[i];
    ids[i] = ids[j];
    ids[j] = tmp;
  }
  state.phraseOrder = ids;
  persist();
  return ids;
}

function bindPhrases(root) {
  root.querySelectorAll(".choice").forEach((btn) => {
    btn.onclick = () => choosePhrase(DATA.phrases.find((p) => p.id === btn.dataset.id));
  });
}

function ownFormHtml() {
  return `
    <button type="button" class="own-toggle" id="own-toggle">${escapeHtml(U("own"))}</button>
    <form class="own" id="own" hidden>
      <label class="sr" for="own-q">${escapeHtml(U("ownLabel"))}</label>
      <input id="own-q" name="q" maxlength="180" autocomplete="off" placeholder="${escapeHtml(U("own"))}" />
      <button class="sr" type="submit">${escapeHtml(U("own"))}</button>
    </form>`;
}

function bindOwn() {
  const form = document.getElementById("own");
  const toggle = document.getElementById("own-toggle");
  if (!form || !toggle) return;
  toggle.onclick = () => {
    form.hidden = !form.hidden;
    if (!form.hidden) document.getElementById("own-q").focus();
  };
  form.onsubmit = (e) => {
    e.preventDefault();
    const text = new FormData(form).get("q").toString().trim();
    if (!text) return;
    const folders = matchOwn(text);
    choosePhrase({ id: "own", text, folders }, !folders.length);
  };
}

function renderLang() {
  setDocTitle();
  app.innerHTML = `
    <div class="stage lang">
      <h1 class="house">${escapeHtml(DATA.ui.ru.houseTri)}</h1>
      <p class="dek series">${escapeHtml(DATA.ui.ru.seriesTri)}</p>
      <p class="kicker">${escapeHtml(DATA.ui.ru.langKicker)}</p>
      <div class="lang-list">
        ${langs().map((l) => `<button type="button" data-lang="${l}">${escapeHtml(langLabel()[l])}</button>`).join("")}
      </div>
      <p class="colophon"><a href="#/method">${escapeHtml(DATA.ui.ru.methodTri)}</a></p>
    </div>`;
  app.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.onclick = () => {
      setLang(btn.dataset.lang);
      go(`#/${btn.dataset.lang}/phrase`);
    };
  });
}

function renderPhrase() {
  const order = phraseOrder();
  const show = DATA.defaults.phraseShow || 7;
  const visible = state.morePhrases ? order : order.slice(0, show);
  const hidden = order.length - visible.length;
  const buttons = visible.map((id) => {
    const p = DATA.phrases.find((x) => x.id === id);
    return `<button type="button" class="choice" data-id="${p.id}">${escapeHtml(t(p.text))}</button>`;
  }).join("");
  const more = hidden > 0
    ? `<button type="button" class="own-toggle" id="more-phrases">${escapeHtml(U("morePhrases"))}</button>`
    : "";
  app.innerHTML = `
    <div class="stage phrase">
      <h1 class="headline">${escapeHtml(U("phraseQ"))}</h1>
      <div class="phrases">
        ${buttons}
        ${more}
        ${ownFormHtml()}
      </div>
    </div>`;
  setDocTitle(U("phraseQ"));
  bindPhrases(app);
  bindOwn();
  const moreBtn = document.getElementById("more-phrases");
  if (moreBtn) {
    moreBtn.onclick = () => {
      state.morePhrases = true;
      persist();
      renderPhrase();
      focusApp();
    };
  }
}

function landingFolder() {
  return folderById((state.openIds && state.openIds[0]) || fallbackId()) || DATA.folders[0];
}

function currentGuess() {
  const folder = landingFolder();
  if (folder && folder.guess && folder.guess.q) return folder.guess;
  const fb = folderById(fallbackId());
  return (fb && fb.guess) || null;
}

function renderGuess() {
  const g = currentGuess();
  if (!g) {
    afterGuessDest();
    return;
  }
  app.innerHTML = `
    <div class="stage guess">
      <p class="kicker">${escapeHtml(U("guessKicker"))}</p>
      <h1 class="headline">${escapeHtml(t(g.q))}</h1>
      <div class="opts">
        ${g.options.map((o) => `<button type="button" data-id="${o.id}">${escapeHtml(t(o.text))}</button>`).join("")}
      </div>
      <p class="wait">${escapeHtml(U("guessWait"))}</p>
    </div>`;
  setDocTitle(t(g.q));
  app.querySelectorAll(".opts button").forEach((btn) => {
    btn.onclick = () => {
      state.guessed = true;
      state.guessChoice = btn.dataset.id;
      state.guessOk = btn.dataset.id === g.correct;
      persist();
      afterGuessDest();
    };
  });
}

function renderSoil() {
  app.innerHTML = `
    <div class="stage soil">
      <p class="kicker">${escapeHtml(state.phraseText || U("own"))}</p>
      <h1 class="headline">${escapeHtml(U("soilQ"))}</h1>
      <div class="opts">
        ${DATA.folders.map((f) => `<button type="button" data-id="${f.id}">${escapeHtml(t(f.title))}</button>`).join("")}
      </div>
    </div>`;
  setDocTitle(U("soilQ"));
  app.querySelectorAll(".opts button").forEach((btn) => {
    btn.onclick = () => {
      state.openIds = [btn.dataset.id];
      persist();
      go(`#/${state.lang}/guess`);
    };
  });
}

function phrasesForFolder(folder) {
  if (!folder) return DATA.phrases;
  return DATA.phrases.filter((p) => p.folders.includes(folder.id));
}

function renderGate(folder, docId) {
  const target = folder || DATA.folders[0];
  const list = phrasesForFolder(target);
  const buttons = (list.length ? list : DATA.phrases).map((p) => (
    `<button type="button" class="choice" data-id="${p.id}">${escapeHtml(t(p.text))}</button>`
  )).join("");
  app.innerHTML = `
    <div class="stage gate">
      <h1 class="headline">${escapeHtml(U("gateQ"))}</h1>
      <div class="phrases">
        ${buttons}
        ${ownFormHtml()}
      </div>
    </div>`;
  setDocTitle(U("gateQ"));
  state.returnTo = docId
    ? `#/${state.lang}/doc/${docId}`
    : `#/${state.lang}/${target.id}`;
  persist();
  bindPhrases(app);
  bindOwn();
}

function spreadHead(folder) {
  const display = folder.display;
  if (display && display.kind === "word") {
    return `
      <h1 class="word">${escapeHtml(t(display.word))}</h1>
      <p class="others">${escapeHtml(t(display.others))}</p>
      <p class="false">${escapeHtml(t(display.falseReading))}</p>
      <p class="display-head">${escapeHtml(t(folder.headline))}</p>`;
  }
  if (display && display.kind === "number") {
    return `
      <h1 class="number">${escapeHtml(display.number)}</h1>
      <p class="unit">${escapeHtml(t(display.unit))}</p>
      <p class="display-head">${escapeHtml(t(folder.headline))}</p>`;
  }
  return `<h1 class="headline">${escapeHtml(t(folder.headline))}</h1>`;
}

function printDocs(folder) {
  if (!folder) return "";
  const items = folder.docs.map((id) => {
    const d = DATA.docs[id];
    const url = d.url ? ` (${escapeHtml(d.url)})` : "";
    return `<li>${escapeHtml(t(d.title))}${url}</li>`;
  }).join("");
  return `<div class="print-docs"><p class="fall-kicker">${escapeHtml(U("docK"))}</p><ul>${items}</ul></div>`;
}

function renderFolder(folder) {
  markSeen("folders", folder.id);
  persist();
  const kicker = state.phraseText || t(folder.title);
  const notes = [];
  if (state.unknown) notes.push(U("unknown"));
  if (state.guessed && folder.id === landingFolder().id) {
    const g = currentGuess();
    notes.push(t(state.guessOk ? g.ok : g.bad) || U(state.guessOk ? "guessOk" : "guessBad"));
  } else if (!state.unknown) {
    notes.push(t(folder.note));
  }
  const note = notes.filter(Boolean).join(" ");
  const steel = folder.display
    ? ""
    : `<p class="block-kicker">${escapeHtml(U("steelK"))}</p><p class="steel">${escapeHtml(t(folder.steel))}</p>`;

  app.innerHTML = `
    <div class="stage spread">
      <p class="kicker">${escapeHtml(kicker)}</p>
      ${spreadHead(folder)}
      <p class="dek">${escapeHtml(t(folder.dek))}</p>
      ${steel}
      <p class="block-kicker">${escapeHtml(U("docK"))}</p>
      <div class="cite-block">
        <a class="cite" href="#/${state.lang}/doc/${folder.docs[0]}">${escapeHtml(t(folder.cite))}</a>
        ${folder.display ? "" : `<p class="cite-note">${escapeHtml(t(folder.citeNote))}</p>`}
      </div>
    </div>
    <div class="essay">
      <div class="prose">${paras(t(folder.body))}</div>
      <p class="block-kicker">${escapeHtml(U("crackK"))}</p>
      <div class="prose">${paras(t(folder.crack))}</div>
      ${note ? `<p class="note">${escapeHtml(note)}</p>` : ""}
      ${printDocs(folder)}
      ${fallHtml(otherArgs(folder), U("more"))}
    </div>`;
  setDocTitle(t(folder.title));
}

function renderDoc(id) {
  const d = DATA.docs[id];
  if (!d) {
    go(`#/${state.lang}/phrase`);
    return;
  }
  markSeen("docs", id);
  persist();
  let table = "";
  if (d.table) {
    table = `<table>${d.table.map((row) => `<tr><th scope="row">${escapeHtml(t(row.k))}</th><td>${escapeHtml(t(row.v))}</td></tr>`).join("")}</table>`;
  }
  const from = DATA.folders.find((f) => f.docs.includes(id));
  const quote = d.quote
    ? `<p class="quote">${escapeHtml(d.quote)}${d.quoteLang ? " · " + escapeHtml(d.quoteLang) : ""}</p>`
    : "";
  app.innerHTML = `
    <div class="stage doc">
      <article class="doc-page">
        <p class="kicker">${escapeHtml(t(d.kind))}${d.date ? " · " + escapeHtml(d.date) : ""}</p>
        <h1 class="headline">${escapeHtml(t(d.title))}</h1>
        ${d.why ? `<p>${escapeHtml(t(d.why))}</p>` : ""}
        ${d.url ? `<p><a href="${escapeHtml(d.url)}" rel="noopener">${escapeHtml(d.url)}</a></p>` : ""}
        ${d.archive && d.url ? `<p><a href="${escapeHtml(d.archive)}" rel="noopener">${escapeHtml(d.archive)}</a></p>` : ""}
        ${quote}
        ${table}
        ${paras(t(d.body))}
        ${fallHtml(docStep(from, id))}
        ${fallHtml(otherArgs(from), U("more"))}
      </article>
    </div>`;
  setDocTitle(t(d.title));
}

function chosenOptionText() {
  const g = currentGuess();
  if (!g || !state.guessChoice) return "";
  const o = g.options.find((x) => x.id === state.guessChoice);
  return o ? t(o.text) : "";
}

function correctOptionText() {
  const g = currentGuess();
  if (!g) return "";
  const o = g.options.find((x) => x.id === g.correct);
  return o ? t(o.text) : "";
}

function protocolText() {
  const issue = DATA.issue;
  const lines = [
    `${DATA.ui[state.lang].title} · ${U("issueWord")} ${issue.roman} · ${t(issue.title)}`,
    `${issue.asOf} · ${U("protocolLang")}: ${langLabel()[state.lang]}`,
    "",
    U("protocolPhrase"),
    `  ${state.phraseText || ""}`,
    "",
    U("protocolNamed"),
    `  ${chosenOptionText()}`,
    "",
    U("protocolNorm"),
    `  ${correctOptionText()}`,
    ""
  ];
  const opened = (state.seen.folders || []).map((id) => folderById(id)).filter(Boolean);
  if (opened.length) {
    lines.push(U("protocolDist"));
    for (const f of opened) lines.push(`  ${t(f.headline)}`);
    lines.push("");
  }
  const docs = (state.seen.docs || []).map((id) => ({ id, d: DATA.docs[id] })).filter((x) => x.d);
  if (docs.length) {
    lines.push(U("protocolDocs"));
    for (const { d } of docs) {
      lines.push(`  ${t(d.title)}`);
      if (d.url) lines.push(`  ${d.url}`);
    }
  }
  return lines.join("\n");
}

function renderProtocol() {
  app.innerHTML = `
    <div class="stage method">
      <article class="doc-page">
        <p class="kicker">${escapeHtml(U("protocol"))}</p>
        <h1 class="headline">${escapeHtml(U("protocol"))}</h1>
        <pre class="protocol">${escapeHtml(protocolText())}</pre>
        ${colophon(U("methodLine"))}
      </article>
    </div>`;
  setDocTitle(U("protocol"));
}

function renderMethod() {
  const log = (DATA.changelog || []).map((row) => (
    `<li><time datetime="${escapeHtml(row.date)}">${escapeHtml(row.date)}</time>${escapeHtml(t(row.text))}</li>`
  )).join("");
  app.innerHTML = `
    <div class="stage method">
      <article class="doc-page">
        <p class="kicker">${escapeHtml(U("methodLine"))}</p>
        <h1 class="headline">${escapeHtml(U("method"))}</h1>
        ${paras(t(DATA.pages.method))}
        ${log ? `<ol class="changelog">${log}</ol>` : ""}
      </article>
    </div>`;
  setDocTitle(U("method"));
}

function focusApp() {
  if (app && typeof app.focus === "function") app.focus({ preventScroll: true });
}

function paint() {
  if (!DATA) return;
  const r = parseHash();
  if (r.lang) setLang(r.lang);
  state.docId = r.docId || null;
  if (r.screen === "lang") {
    renderLang();
    return focusApp();
  }
  if (r.screen === "method") {
    if (!state.lang) setLang(r.lang || "ru");
    renderMethod();
    return focusApp();
  }
  if (!state.lang) {
    go("#");
    return;
  }
  if (r.screen === "phrase") {
    renderPhrase();
    return focusApp();
  }
  if (r.screen === "soil") {
    if (!state.phraseId || !state.unknown) {
      go(`#/${state.lang}/phrase`);
      return;
    }
    if (state.openIds && state.openIds.length) {
      go(`#/${state.lang}/guess`);
      return;
    }
    renderSoil();
    return focusApp();
  }
  if (!state.phraseId) {
    if (r.screen === "folder" || r.screen === "doc") {
      const folder = r.folder || DATA.folders.find((f) => f.docs.includes(r.docId));
      renderGate(folder, r.docId);
      return focusApp();
    }
    go(`#/${state.lang}/phrase`);
    return;
  }
  if (r.screen === "guess") {
    if (state.guessed) {
      afterGuessDest();
      return;
    }
    if (state.unknown && !(state.openIds && state.openIds.length)) {
      go(`#/${state.lang}/soil`);
      return;
    }
    renderGuess();
    return focusApp();
  }
  if (!state.guessed) {
    if (state.unknown && !(state.openIds && state.openIds.length)) {
      go(`#/${state.lang}/soil`);
      return;
    }
    go(`#/${state.lang}/guess`);
    return;
  }
  if (r.screen === "protocol") {
    renderProtocol();
    return focusApp();
  }
  if (r.screen === "doc") {
    renderDoc(r.docId);
    return focusApp();
  }
  renderFolder(r.folder);
  focusApp();
}

function runtimeGuard(data) {
  if (!data.folders || !data.phrases || !data.docs || !data.ui || !data.matchers || !data.defaults) {
    throw new Error("desk.json incomplete");
  }
}

function probeSiblings(data) {
  const saved = { lang: state.lang, openIds: state.openIds, seen: state.seen };
  const probe = data.phrases.find((p) => p.folders.length >= 3) || data.phrases[0];
  state.lang = "ru";
  state.openIds = probe.folders.slice();
  state.seen = { folders: [probe.folders[0]], docs: [] };
  const sibs = otherArgs(folderById(probe.folders[0])).map((s) => s.href);
  Object.assign(state, saved);
  const rest = probe.folders.slice(1);
  if (!rest.every((id) => sibs.some((h) => h.endsWith("/" + id)))) {
    throw new Error("otherArgs must list the other matched arguments");
  }
}

window.addEventListener("hashchange", paint);

fetch("desk.json")
  .then((r) => r.json())
  .then((data) => {
    runtimeGuard(data);
    DATA = data;
    MATCH = (data.matchers || []).map((m) => ({
      re: new RegExp(m.re, "i"),
      folders: m.folders
    }));
    probeSiblings(data);
    restore();
    paint();
  });
