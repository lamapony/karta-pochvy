#!/usr/bin/env python3
"""One-shot corpus patch for the release path. Idempotent enough to re-run."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "desk.json"
d = json.loads(path.read_text(encoding="utf-8"))

UI = {
    "ru": {
        "steelK": "Сталь",
        "crackK": "Трещина",
        "docK": "Документ",
        "morePhrases": "другие фразы",
        "soilQ": "Какое различение ваша фраза склеивает",
        "protocol": "Протокол чтения",
        "method": "Метод",
        "methodTri": "Метод · Method · Metode",
        "methodLine": "Метод · Выпуск I · Газа",
        "gateQ": "Эту страницу читают после фразы",
        "issueWord": "Выпуск",
        "protocolPhrase": "Фраза",
        "protocolNamed": "Норма, которую назвали",
        "protocolNorm": "Норма в статье",
        "protocolDist": "Различение",
        "protocolDocs": "Документы",
        "protocolLang": "Язык",
        "noscript": "Карта почвы — статическая полоса чтения. Включите JavaScript.",
    },
    "en": {
        "steelK": "Steel",
        "crackK": "Crack",
        "docK": "Document",
        "morePhrases": "other sentences",
        "soilQ": "Which distinction does your sentence glue together",
        "protocol": "Reading protocol",
        "method": "Method",
        "methodTri": "Метод · Method · Metode",
        "methodLine": "Method · Issue I · Gaza",
        "gateQ": "This page is read after a sentence",
        "issueWord": "Issue",
        "protocolPhrase": "Sentence",
        "protocolNamed": "The norm you named",
        "protocolNorm": "The norm in the article",
        "protocolDist": "Distinction",
        "protocolDocs": "Documents",
        "protocolLang": "Language",
        "noscript": "A map of the soil is a static reading strip. Enable JavaScript.",
    },
    "da": {
        "steelK": "Stål",
        "crackK": "Sprække",
        "docK": "Dokument",
        "morePhrases": "andre sætninger",
        "soilQ": "Hvilken skelnen limer din sætning sammen",
        "protocol": "Læseprotokol",
        "method": "Metode",
        "methodTri": "Метод · Method · Metode",
        "methodLine": "Metode · Udgave I · Gaza",
        "gateQ": "Denne side læses efter en sætning",
        "issueWord": "Udgave",
        "protocolPhrase": "Sætning",
        "protocolNamed": "Normen, du nævnte",
        "protocolNorm": "Normen i artiklen",
        "protocolDist": "Skelnen",
        "protocolDocs": "Dokumenter",
        "protocolLang": "Sprog",
        "noscript": "Et kort over jorden er en statisk læsestribe. Slå JavaScript til.",
    },
}

for lang, extra in UI.items():
    d["ui"][lang].update(extra)

d["defaults"] = {
    "langs": ["da", "en", "ru"],
    "langLabel": {"da": "Dansk", "en": "English", "ru": "Русский"},
    "fallbackFolder": "means",
    "phraseShow": 7,
}

d["issue"] = {
    "number": 1,
    "roman": "I",
    "title": {"ru": "Газа", "en": "Gaza", "da": "Gaza"},
    "asOf": "2026-09-20",
    "corrections": "",
}

d["matchers"] = [
    {"re": r"никакой прибыли на геноцид|нет прибыли на геноцид|no profit (on|from) genocide|ingen profit på folkemord", "folders": ["blockade", "word"]},
    {"re": r"немедленно и без условий|immediately and unconditionally|uden betingelser|without any precondition", "folders": ["hostages", "intent"]},
    {"re": r"дом семьи 1948|family.?s 1948|familiens hus fra 1948", "folders": ["return", "after"]},
    {"re": r"незаконны и убивают|illegal and they kill|ulovlige og slår", "folders": ["settlements", "after"]},
    {"re": r"единственная школа|only school and clinic|eneste skole og klinik|нельзя трогать|must not be touched|må ikke røres", "folders": ["unrwa", "blockade", "after"]},
    {"re": r"прячется за нами|hides behind us|gemmer sig bag os", "folders": ["shields", "means"]},
    {"re": r"голод как оружие|starvation as a weapon|sult som våben", "folders": ["famine", "blockade"]},
    {"re": r"другого мира нет|no other peace|ingen anden fred", "folders": ["states", "after"]},
    {"re": r"палестинского вето|palestinian veto|palæstinensisk veto", "folders": ["accords", "after", "proxy"]},
    {"re": r"заложн|hostage|gidsel|gidsl", "folders": ["hostages", "intent", "after"]},
    {"re": r"возвращ|вернут|right (of|to) return|retten til at vende|vende hjem|ret til at vende|репатри", "folders": ["return", "states", "unrwa"]},
    {"re": r"поселен|settlement|bosætt", "folders": ["settlements", "states", "after"]},
    {"re": r"unrwa|анрва", "folders": ["unrwa", "after", "proxy"]},
    {"re": r"щит|пряч|hide[s]? behind|gemmer sig bag|human shield|menneskeligt skjold|skjold", "folders": ["shields", "means", "guilt"]},
    {"re": r"голод|famine|starv|hungersnød|\bsult", "folders": ["famine", "blockade", "means"]},
    {"re": r"два государств|two[- ]state|tostat|to stater", "folders": ["states", "settlements", "after"]},
    {"re": r"авраам|abraham|нормализ|normalis", "folders": ["accords", "states", "proxy"]},
    {"re": r"реки до моря|river to the sea|floden til havet", "folders": ["word", "return", "states"]},
    {"re": r"гибнут дет|children are dying|børn dør|уже не самооборон|no longer self-defen|ikke længere selvforsvar", "folders": ["means", "intent", "blockade"]},
    {"re": r"самооборон|self-defen|selvforsvar|defend itself|forsvare sig|право на само", "folders": ["violence", "means", "intent"]},
    {"re": r"октябр|контекст|оккупац|ум[ыи]сел|резн|october|occupation|intent|massacre|oktober|besætt|forsæt|massakre|sammenhæng", "folders": ["intent", "word", "blockade"]},
    {"re": r"дет|соразмер|жертв|газ[аеуы]|children|gaza|proportional|børn|dør|dying", "folders": ["means", "intent", "blockade"]},
    {"re": r"хамас|уничтож|переговор|разговарив|марионет|hamas|destroy|talking|udslette|marionet|proxy", "folders": ["proxy", "guilt", "after"]},
    {"re": r"геноцид|genocide|folkedrab", "folders": ["word", "intent"]},
    {"re": r"блокад|калор|грузовик|blockade|calorie|truck|blokade|kalor|lastbil", "folders": ["blockade", "means"]},
    {"re": r"вин[аыу]|народ|мирн|guilt|people|civilian|skyld|folk|uskyld", "folders": ["guilt", "violence"]},
    {"re": r"учебник|после|воспитан|институт|textbook|after|educat|lærebog|institution|undervis", "folders": ["after", "proxy"]},
    {"re": r"насил|violen|vold|just war|retfærdig krig", "folders": ["violence", "means"]},
]

d["pages"] = {
    "method": {
        "ru": (
            "Карта почвы — издание различений. Выпуск I — Газа.\n\n"
            "Вы говорите фразу. Мы показываем статью, на которой она стоит, и место, где она трещит.\n\n"
            "Это не фактчек: сайт не ставит «правда» или «ложь». Это не дебаты: нет двух колонок. Это стол читателя. "
            "Лозунг кладут на норму и смотрят, что он склеил.\n\n"
            "Сталь — сильная версия позиций, которые лозунг склеивает. Трещина — место, где лозунг рвётся о норму или о документ. "
            "Документ — первичный текст с датой, адресом и одной фразой, зачем он здесь.\n\n"
            "«Не приговор» — правило, не оговорка. Голос сайта не говорит, был ли геноцид и кто виновен. "
            "Он показывает, что говорит норма, что говорит документ, и где лозунг склеил разное.\n\n"
            "Как выбираются документы. Сначала норма или первичный акт. Потом именной доклад, решение, статут. "
            "Отчёт НПО кладётся на вторую чашу, не вместо статьи. У каждого документа есть дата, URL и зачем он здесь. "
            "Где первоисточник стоит за платой, это помечено.\n\n"
            "Сайт ничего не отправляет. Нет кук, нет аналитики, нет внешних запросов при чтении. "
            "Состояние живёт в sessionStorage этого браузера и исчезает с вкладкой.\n\n"
            "Протокол чтения — простой текст того, что вы сказали, какую норму назвали и какие документы открыли. "
            "Его можно скопировать. Кнопок «поделиться» нет.\n\n"
            "Исправления пишите, когда в колофоне появится адрес. Журнал правок — ниже. "
            "Срез источников этого выпуска: 20 сентября 2026."
        ),
        "en": (
            "A map of the soil is an issue of distinctions. Issue I — Gaza.\n\n"
            "You say a sentence. We show the article it stands on, and the place where it cracks.\n\n"
            "This is not fact-checking: the site does not mark “true” or “false”. It is not a debate: there are no two columns. "
            "It is a reader’s desk. A slogan is laid on a norm to see what it glued together.\n\n"
            "Steel is the strong form of the positions a slogan glues. The crack is where the slogan breaks on a norm or a document. "
            "A document is a primary text with a date, an address, and one sentence on why it is here.\n\n"
            "“Not a verdict” is a rule, not a hedge. The site’s voice does not say whether genocide occurred or who is guilty. "
            "It shows what the norm says, what the document says, and where the slogan glued different things.\n\n"
            "How documents are chosen. First the norm or the primary act. Then a named report, a judgment, a statute. "
            "An NGO report sits on the second pan, not in place of the article. Every document has a date, a URL, and a why. "
            "Where the source sits behind a paywall, that is marked.\n\n"
            "The site sends nothing. No cookies, no analytics, no third-party requests while you read. "
            "State lives in this browser’s sessionStorage and dies with the tab.\n\n"
            "The reading protocol is plain text of what you said, which norm you named, and which documents you opened. "
            "You can copy it. There is no share button.\n\n"
            "Write corrections when an address appears in the colophon. The changelog is below. "
            "Source cut-off for this issue: 20 September 2026."
        ),
        "da": (
            "Et kort over jorden er et hæfte af skelner. Udgave I — Gaza.\n\n"
            "Du siger en sætning. Vi viser artiklen, den står på, og stedet, hvor den sprækker.\n\n"
            "Det er ikke fact-checking: siden sætter ikke «sandt» eller «falsk». Det er ikke en debat: der er ingen to kolonner. "
            "Det er et læsebord. Et slogan lægges på en norm for at se, hvad det har limet sammen.\n\n"
            "Stål er den stærke form af de positioner, et slogan limer. Sprækken er dér, sloganet brister på en norm eller et dokument. "
            "Et dokument er en primær tekst med dato, adresse og én sætning om, hvorfor det er her.\n\n"
            "«Ikke en dom» er en regel, ikke en undvigelse. Sidens stemme siger ikke, om der var folkedrab, eller hvem der er skyldig. "
            "Den viser, hvad normen siger, hvad dokumentet siger, og hvor sloganet limede forskellige ting.\n\n"
            "Sådan vælges dokumenter. Først normen eller den primære akt. Derefter en navngiven rapport, en dom, en statut. "
            "En NGO-rapport ligger i den anden vægtskål, ikke i stedet for artiklen. Hvert dokument har dato, URL og et hvorfor. "
            "Hvor kilden ligger bag betalingsmur, er det markeret.\n\n"
            "Siden sender intet. Ingen cookies, ingen analyse, ingen tredjeparts-kald mens du læser. "
            "Tilstanden lever i denne browsers sessionStorage og dør med fanen.\n\n"
            "Læseprotokollen er almindelig tekst om, hvad du sagde, hvilken norm du nævnte, og hvilke dokumenter du åbnede. "
            "Den kan kopieres. Der er ingen knap til at dele.\n\n"
            "Skriv rettelser, når en adresse står i kolofonen. Rettelseslisten er nedenfor. "
            "Kildernes skæringsdato for denne udgave: 20. september 2026."
        ),
    }
}

d["changelog"] = [
    {
        "date": "2026-09-20",
        "text": {
            "ru": "Ворота: вопрос о норме берётся из открытого аргумента; после полосы видны другие аргументы той же фразы.",
            "en": "Gate: the norm question comes from the opened argument; after the strip, the phrase’s other arguments are listed.",
            "da": "Port: spørgsmålet om normen kommer fra det åbnede argument; efter striben vises frasens øvrige argumenter.",
        },
    },
    {
        "date": "2026-09-20",
        "text": {
            "ru": "Выпуск I назван. Добавлены сталь/трещина/документ как видимые части полосы, протокол чтения, метод, ворота на глубокой ссылке. Корпус вынесен из кода.",
            "en": "Issue I is named. Steel/crack/document become visible parts of the strip; reading protocol, method, and a gate on deep links. The corpus leaves the code.",
            "da": "Udgave I er navngivet. Stål/sprække/dokument bliver synlige dele af striben; læseprotokol, metode og en port på dybe links. Korpusset forlader koden.",
        },
    },
]

# A1: attach orphan icj-wall to settlements, chronologically after 49(6).
for f in d["folders"]:
    if f["id"] == "settlements":
        docs = f["docs"]
        if "icj-wall" not in docs:
            if "gc49" in docs:
                i = docs.index("gc49") + 1
                docs.insert(i, "icj-wall")
            else:
                docs.append("icj-wall")

QUOTES = {
    "api51": "an attack which may be expected to cause incidental loss of civilian life, injury to civilians, damage to civilian objects, or a combination thereof, which would be excessive in relation to the concrete and direct military advantage anticipated",
    "ihl14": "Launching an attack which may be expected to cause incidental loss of civilian life, injury to civilians, damage to civilian objects, or a combination thereof, which would be excessive in relation to the concrete and direct military advantage anticipated, is prohibited.",
    "un-51": "Nothing in the present Charter shall impair the inherent right of individual or collective self-defence if an armed attack occurs against a Member of the United Nations, until the Security Council has taken measures necessary to maintain international peace and security.",
    "api57": "In the conduct of military operations, constant care shall be taken to spare the civilian population, civilians and civilian objects.",
    "genocide-conv": "In the present Convention, genocide means any of the following acts committed with intent to destroy, in whole or in part, a national, ethnical, racial or religious group, as such",
    "gc33": "No protected person may be punished for an offence he or she has not personally committed. Collective penalties and likewise all measures of intimidation or of terrorism are prohibited.",
    "gc34": "The taking of hostages is prohibited.",
    "gc49": "The Occupying Power shall not deport or transfer parts of its own civilian population into the territory it occupies.",
    "api54": "Starvation of civilians as a method of warfare is prohibited.",
    "ihl97": "The use of human shields is prohibited.",
    "unga194": "refugees wishing to return to their homes and live at peace with their neighbours should be permitted to do so at the earliest practicable date",
    "unsc242": "Withdrawal of Israel armed forces from territories occupied in the recent conflict",
    "unsc2334": "has no legal validity and constitutes a flagrant violation under international law and a major obstacle to the achievement of the two-State solution",
    "unga302": "to prevent conditions of starvation and distress among Palestine refugees and to further conditions of peace and stability",
}

for id_, quote in QUOTES.items():
    if id_ in d["docs"]:
        d["docs"][id_]["quote"] = quote
        d["docs"][id_]["quoteLang"] = "en"

# A1: archive URL for every document that has a source URL.
# after-note is a marginal note, not a source — no archive.
for id_, doc in d["docs"].items():
    url = (doc.get("url") or "").strip()
    if not url:
        doc.setdefault("archive", "")
        continue
    doc["archive"] = "https://web.archive.org/web/" + url

# A2: wrap a few still-unquoted EN lead sentences that are verbatim-ish.
# Bodies already use «» in RU for the core norms. Leave running text as-is
# where it is paraphrase; quote field carries the original.

path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("patched", path)
print("folders", len(d["folders"]), "phrases", len(d["phrases"]), "docs", len(d["docs"]))
print("settlements docs", next(f["docs"] for f in d["folders"] if f["id"] == "settlements"))
