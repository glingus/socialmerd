# socialmerd

Userscript open source (GPL-3.0-or-later) che rende **Instagram web** e **YouTube** "senza dipendenza" su **iPhone Safari**, tramite l'app gratuita **Userscripts** (quoid).
- **Instagram:** niente reel (quelli ricevuti in DM si guardano uno alla volta), niente contenuti suggeriti né Esplora, feed solo seguiti con stop "Sei in pari".
- **YouTube:** niente Shorts.
- **Extra:** contatore tempo e statistiche.

Ispirato a SocialLite. Repo: `github.com/glingus/socialmerd` (pubblico; branch `main` stabile, `dev` sviluppo).

## Prima di fare qualsiasi cosa
1. Leggi **`docs/PIANO.md`**: è il piano approvato dall'utente e **vincolante** (decisioni, architettura, specifiche, fasi, test).
2. Guarda "Stato avanzamento" in cima a `docs/PIANO.md` e riparti dalla **prima fase non spuntata** (all'inizio è la **Fase 1 — Repo e scaffold**).
3. Per contesto e fonti: `docs/RICERCA.md`. Per le scoperte sul DOM reale: `docs/spike-findings.md` (lo crei nella Fase 2).

## Regole operative (vincolanti)
- Parla con l'utente **in italiano**. Codice, identificatori e commenti in inglese; stringhe UI solo via i18n (IT/EN).
- **Niente cambi di prodotto senza chiedere.** Se una decisione del piano è irrealizzabile o ambigua: fermati, spiega e chiedi all'utente (usa AskUserQuestion). Aggiorna le spunte in `docs/PIANO.md` a fine fase.
- **Mai** gestire credenziali: il login a Instagram/YouTube nel browser dell'harness (`npm run e2e:login`) lo fa **solo l'utente** a mano.
- **Mai** committare dati personali: `.auth/`, `tests/fixtures/raw/`, screenshot con DM o nomi reali, cookie. Solo fixture **sanificate**. Controlla `git diff` prima di ogni commit.
- Chiedi **conferma esplicita** prima di creare il repo GitHub e prima del primo push; poi chiedi se i push su `dev` possono essere automatici. Ogni push su `main` va annunciato (repo pubblico).
- **Test live** sul profilo principale dell'utente:
  - solo navigazione in lettura: mai like, follow, commenti, invii o pubblicazioni
  - `slowMo` circa 500 ms, 1 worker, al massimo una suite per sessione
  - nessun flag per nascondere l'automazione
  - **stop immediato** su checkpoint/challenge/login, avvisando l'utente
  - mai in CI
- Selettori e stringhe riconosciute **solo** in `src/platforms/*/selectors.ts` e `strings.ts`, con commento `// verified YYYY-MM-DD`. **Mai** classi CSS offuscate. Preferisci URL/rotte → href/ARIA/struttura → testo.
- Lo script gira nel **content world** (`@inject-into content`, `@run-at document-start`): non puoi agganciare `fetch` o `history` della pagina. Usa polling dell'URL, listener in cattura e un solo MutationObserver.
- **Nessuna richiesta di rete** dello script, tranne `update-check` (massimo 1 al giorno, solo varianti GitHub). Nessuna telemetria.
- Build **non minificata** (regola di Greasy Fork). `dist/` va committata (i link raw devono finire in `.user.js`).
- FocusGram (AGPL) e FeurStagram (GPL) sono solo riferimenti di tecnica: **non copiare il loro codice**.
- L'iPhone dell'utente ha **iOS 26**. Le prove reali su Safari le fa l'utente, seguendo `docs/TESTING-iphone.md`.

## Ambiente (Windows 11)
- **Disponibili:** Node 24, npm, Git, VS Code, Chrome ed Edge; gh CLI loggato come `glingus`.
- **Non servono:** Java e Android SDK.
- Shell disponibili: PowerShell e Git Bash.
