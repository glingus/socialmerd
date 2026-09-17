# Spike findings — Fase 2

Risultati dello spike sul DOM reale di Instagram e YouTube mobile (docs/PIANO.md §5.2).
Una voce per punto: esito, selettori/URL osservati, data della verifica, screenshot
(sanificato, in `tests/fixtures/`) o riferimento al file raw locale (mai committato).

Come procedere: `npm run e2e:login` (fai login a mano), poi `npm run fixture:capture -- <url> [nome]`
per ogni pagina da ispezionare; controlla sempre `tests/fixtures/<nome>.html` prima di committare.

Stato: **non ancora iniziato** — in attesa che l'utente completi il login (`npm run e2e:login`).

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

## (j) Pubblicazione Storia da Safari — *test sull'iPhone dell'utente*

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

---

## Decisioni di prodotto da confermare con l'utente (se qualcosa risulta irrealizzabile)

_(vuoto finora)_
