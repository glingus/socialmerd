# Spike findings — Fase 2

Risultati dello spike sul DOM reale di Instagram e YouTube mobile (docs/PIANO.md §5.2).
Una voce per punto: esito, selettori/URL osservati, data della verifica, screenshot
(sanificato, in `tests/fixtures/`) o riferimento al file raw locale (mai committato).

Come procedere: `npm run e2e:login` (fai login a mano), poi `npm run fixture:capture -- <url> [nome]`
per ogni pagina da ispezionare; controlla sempre `tests/fixtures/<nome>.html` prima di committare.

Stato: **non ancora iniziato** — in attesa che l'utente completi il login (`npm run e2e:login`).

> **Contesto cambiato il 2026-09-17:** il bersaglio non è più Safari ma il browser **Orion** con **Tampermonkey** (vedi `PIANO.md` §0 e `RICERCA.md` §4.2). Orion è WebKit, quindi **tutto lo spike sul DOM resta valido**: Instagram e YouTube si comportano come in Safari. I punti marcati *"test sull'iPhone dell'utente"* vanno fatti in **Orion**, non in Safari.

## Fase 1 — già verificato sull'iPhone (2026-09-17, Orion + Tampermonkey)

| Cosa | Esito |
|---|---|
| Installazione dal link raw `.user.js` | ✅ Tampermonkey intercetta il link e mostra "Installing script" con `@grant`, `@match`, `@connect` letti correttamente |
| Badge su `instagram.com` | ✅ |
| Badge su `m.youtube.com` | ✅ |
| Persistenza `GM.setValue`/`GM.getValue` | ✅ contatore `visite` salito fino a 7 tra ricaricamenti |
| `@run-at document-start` prima del paint | ✅ parole dell'utente: "apre subitissimo" |

Restano aperti i punti (o), (q) e (r) qui sotto, che richiedono l'overlay di debug.

## (a) `?variant=following` su mobile

- Esito:
- Note:
- Data:

## (b) Struttura del post (`article`, permalink, `time[datetime]`, sponsorizzato/suggerito, Segui)

- Esito:
- Selettori osservati:
- Data:

## (c) Sentinel di caricamento / richieste di paginazione del feed

- Esito:
- Note:
- Data:

## (d) Reel aperto da un DM (URL, viewer, swipe al successivo, fogli commenti/condivisione)

- Esito:
- Note:
- Data:

## (e) `/reel/<code>/` caricato direttamente

- Esito:
- Note:
- Data:

## (f) Tab reel del profilo

- Esito:
- Note:
- Data:

## (g) Barra di navigazione (link e altezza)

- Esito:
- Note:
- Data:

## (h) `/explore/` e `/explore/search/`

- Esito:
- Note:
- Data:

## (i) Viewer storie (sponsorizzate, pulsante avanti)

- Esito:
- Note:
- Data:

## (j) Pubblicazione Storia dal web mobile — *test sull'iPhone dell'utente, in Orion*

- Esito:
- Note:
- Data:

## (k) Switcher account su web mobile — *test sull'iPhone dell'utente*

- Esito:
- Note:
- Data:

## (l) Username loggato

- Esito:
- Selettore osservato:
- Data:

## (m) Banner e interstiziali "app"

- Esito:
- Note:
- Data:

## (n) Suggeriti in attività e profilo

- Esito:
- Note:
- Data:

## (o) Timing document-start, GM e navigation API — *test sull'iPhone dell'utente, overlay di debug*

- Esito:
- Note:
- Data:

## (p) m.youtube.com: selettori Shorts e redirect `/shorts` → `/watch`

- Esito:
- Selettori osservati:
- Data:

## (q) Mondo pagina raggiungibile da Tampermonkey su Orion? — *test sull'iPhone, overlay di debug*

Sonda minima da mostrare nell'overlay:
1. `typeof unsafeWindow`
2. `unsafeWindow.fetch !== fetch` (se sono lo stesso oggetto, non siamo nel mondo pagina)
3. scrivere `unsafeWindow.__smd_probe = 1` e rileggerlo
4. build separata con `@grant none`: parte, o la CSP di Instagram la blocca? Riportare eventuali errori CSP.

**Esito atteso: negativo.** Se fosse positivo **non cambiare nulla adesso**: è materiale per una fase futura (`PIANO.md` §3.4), mai una dipendenza.

- Esito:
- Note:
- Data:

## (r) Lo schema `orion://open-url?url=…` funziona su iOS? — *test sull'iPhone*

Comando Rapido con azione "Apri URL" → `orion://open-url?url=https://www.instagram.com/?variant=following`.
Se apre Orion sulla pagina giusta → variante 1 di `PIANO.md` §4.8. Altrimenti → variante 2 (Orion come browser predefinito) e correggere §4.8 e il README.

- Esito:
- Note:
- Data:

---

## Decisioni di prodotto da confermare con l'utente (se qualcosa risulta irrealizzabile)

_(vuoto finora)_
