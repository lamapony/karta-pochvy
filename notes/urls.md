# A1 · URL audit

Date: 2026-09-20. HEAD then GET. Wayback availability API returned 429 (rate limit) for the whole batch — closest snapshots were not confirmed. `docs[id].archive` is still a Wayback lookup URL.

Interpretation:

- 44 URLs answered 200 to an automated fetch.
- `wsj` answered 401 — marked `paywall: true`. NBC sits next to it on the same strip.
- Seven official locators answered 403 even with a browser UA from this host (datacenter IP): `genocide-conv`, `unga302`, `ipc-2024-03`, `ipc-2025-08`, `law-of-return`, `icc-2024-11`, `mfa-faq`. Marked `botBlock: true`. They stay in the desk; `check.mjs --urls` skips them. A person should open each once from a home IP.
- `after-note` has no URL: it is a marginal note, not a source.
- `icj-wall` is attached to `settlements`.

| id | status | paywall | wayback closest | url |
|---|---|---|---|---|
| aquinas | 200 |  |  | https://www.newadvent.org/summa/3040.htm |
| walzer | 200 |  |  | https://archive.org/details/justunjustwarsmo00walz |
| api51 | 200 |  |  | https://ihl-databases.icrc.org/en/ihl-treaties/api-1977/article-51 |
| ihl14 | 200 |  |  | https://ihl-databases.icrc.org/en/customary-ihl/v1/rule14 |
| patten | 200 |  |  | https://www.un.org/sexualviolenceinconflict/wp-content/uploads/2024/03/report/mission-report-official-visit-of-the-office-of-the-srsg-svc-to-israel-and-the-occupied-west-bank-29-january-14-february-2024/20240304-Israel-oWB-CRSV-report.pdf |
| hrw-oct7 | 200 |  |  | https://www.hrw.org/report/2024/07/17/i-cant-erase-all-the-blood-from-my-mind/palestinian-armed-groups-october-7 |
| charter | 200 |  |  | https://avalon.law.yale.edu/20th_century/hamas.asp |
| icj | 200 |  |  | https://www.icj-cij.org/case/192 |
| wsj | 401 |  |  | https://www.wsj.com/world/middle-east/hamas-fighters-trained-in-iran-before-oct-7-attacks-e2a8dbb9 |
| nbc-iran | 200 |  |  | https://www.nbcnews.com/news/investigations/us-intelligence-indicates-iranian-leaders-surprised-hamas-attack-rcna119946 |
| cicero | 200 |  |  | https://www.thelatinlibrary.com/cicero/off3.shtml |
| cogat | 200 |  |  | https://gisha.org/en/red-lines/ |
| jaspers | 200 |  |  | https://archive.org/details/questionofgerman0000jasp |
| after-note | empty |  |  |  |
| un-51 | 200 |  |  | https://www.un.org/en/about-us/un-charter/chapter-7 |
| api57 | 200 |  |  | https://ihl-databases.icrc.org/en/ihl-treaties/api-1977/article-57 |
| genocide-conv | 403 |  |  | https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-prevention-and-punishment-crime-genocide |
| gc33 | 200 |  |  | https://ihl-databases.icrc.org/en/ihl-treaties/gciv-1949/article-33 |
| gc34 | 200 |  |  | https://ihl-databases.icrc.org/en/ihl-treaties/gciv-1949/article-34 |
| gc49 | 200 |  |  | https://ihl-databases.icrc.org/en/ihl-treaties/gciv-1949/article-49 |
| api54 | 200 |  |  | https://ihl-databases.icrc.org/en/ihl-treaties/api-1977/article-54 |
| ihl97 | 200 |  |  | https://ihl-databases.icrc.org/en/customary-ihl/v1/rule97 |
| unga194 | 200 |  |  | https://docs.un.org/en/A/RES/194(III) |
| api-beirut | 200 |  |  | https://unsco.unmissions.org/sites/default/files/api.pdf |
| unsc242 | 200 |  |  | https://www.un.org/unispal/document/auto-insert-184858/ |
| unsc2334 | 200 |  |  | https://www.un.org/webcast/pdfs/SRES2334-2016.pdf |
| oslo | 200 |  |  | https://unsco.unmissions.org/sites/default/files/declaration_of_principles_on_interim_self-government_arrangements.pdf |
| icj-wall | 200 |  |  | https://www.icj-cij.org/case/131 |
| icj-2024-ao | 200 |  |  | https://www.icj-cij.org/case/186 |
| levy-2012 | 200 |  |  | https://www.un.org/unispal/document/auto-insert-206325/ |
| unga302 | 403 |  |  | https://www.unrwa.org/content/resolution-302 |
| colonna | 200 |  |  | https://www.un.org/sites/un2.un.org/files/2024/04/unrwa_independent_review_on_neutrality.pdf |
| oios-unrwa | 200 |  |  | https://www.un.org/unispal/document/unrwa-investigation-statement-05aug24/ |
| ipc-2024-03 | 403 |  |  | https://www.ipcinfo.org/ipcinfo-website/alerts-archive/issue-97/en/ |
| ipc-2025-08 | 403 |  |  | https://www.ipcinfo.org/ipcinfo-website/frc/ |
| palmer | 200 |  |  | https://www.un.org/unispal/document/auto-insert-205969/ |
| hamas-2017 | 200 |  |  | https://www.palquest.org/en/historictext/24219/islamic-resistance-movement-hamas-document-general-principles-and-policies |
| abraham-decl | 200 |  |  | https://2017-2021.state.gov/the-abraham-accords/ |
| uae-israel | 200 |  |  | https://trumpwhitehouse.archives.gov/briefings-statements/abraham-accords-peace-agreement-treaty-of-peace-diplomatic-relations-and-full-normalization-between-the-united-arab-emirates-and-the-state-of-israel/ |
| law-of-return | 403 |  |  | https://www.refworld.org/legal/legislation/natlegbod/1950/en/20612 |
| euco-2023-10 | 200 |  |  | https://data.consilium.europa.eu/doc/document/ST-14-2023-INIT/en/pdf |
| eeas-icj | 200 |  |  | https://www.eeas.europa.eu/eeas/icj-joint-statement-high-representative-and-european-commission_en |
| icc-2024-11 | 403 |  |  | https://www.icc-cpi.int/news/situation-state-palestine-icc-pre-trial-chamber-i-rejects-state-israels-challenges |
| who-2025-08 | 200 |  |  | https://www.who.int/news/item/22-08-2025-famine-confirmed-for-first-time-in-gaza |
| s-2023-742 | 200 |  |  | https://www.un.org/unispal/document/attack-against-israel-perpetrated-by-hamas-letter-from-israel/ |
| ft-b84 | 200 |  |  | https://www.folketingstidende.dk/samling/20231/beslutningsforslag/B84/index.htm |
| ft-b165 | 200 |  |  | https://www.folketingstidende.dk/samling/20231/beslutningsforslag/B165/index.htm |
| lindekilde | 200 |  |  | https://doi.org/10.1007/s10610-012-9178-y |
| mfa-faq | 403 |  |  | https://www.gov.il/en/pages/swords-of-iron-faq-6-dec-2023 |
| hamas-narrative | 200 |  |  | https://www.palestinechronicle.com/wp-content/uploads/2024/01/PDF.pdf |
| arbejderen-2026-08 | 200 |  |  | https://arbejderen.dk/indland/blokade-af-vaabentransport-fra-maersk-til-israel-blev-punktum-i-to-ugers-protestlejr/ |
| ritzau-2026-08 | 200 |  |  | https://via.ritzau.dk/pressemeddelelse/15105639/lige-nu-aktivister-blokerer-pa-ny-maersks-hovedkontorer-i-kobenhavn?lang=da&publisherId=13561235 |
| amnesty-2024-12 | 200 |  |  | https://www.amnesty.org/en/documents/mde15/8668/2024/en/ |
