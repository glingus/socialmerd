# socialmerd — Piano di progetto v1

> Pianificato con Opus; il codice lo scrive Sonnet in una sessione successiva. Le decisioni qui sono **definitive**: se qualcosa risulta impossibile o ambiguo, Sonnet si ferma e chiede all'utente (in italiano).
> Piano approvato dall'utente il 2026-09-17. Ricerca e fonti in [`RICERCA.md`](RICERCA.md).

## Stato avanzamento (da aggiornare a ogni fase)
- [x] Fase 1 — Repo e scaffold (+ userscript "hello" verificato sull'iPhone) — **COMPLETATA il 2026-09-17**, non su Safari ma su **Orion (Kagi) + Tampermonkey** (vedi §0 e `docs/RICERCA.md` §4.2). Criteri d'uscita tutti verificati sull'iPhone dell'utente: badge su `instagram.com` **e** su `m.youtube.com`; `GM.setValue`/`GM.getValue` persistono tra i ricaricamenti (contatore `visite` salito fino a 7); CSS a document-start applicato prima del paint (parole dell'utente: "apre subitissimo"). **Nessuna riga di codice cambiata** rispetto alla build fatta per Safari
- [ ] Fase 2 — Spike sul DOM reale (`docs/spike-findings.md` completo) — **quasi completa**: punti (a)(b)(c)(e)(f)(g)(h)(l)(m)(n)(p) verificati da desktop, (d) e (i) parziali. Restano solo (j)(k)(o)(q)(r) e il completamento di (d) (swipe/uscita/fogli), tutti da fare a mano sull'iPhone in Orion — vedi `docs/spike-findings.md`
- [x] Fase 3 — Core — moduli generici (storage/migrazioni, url-watcher, dom-scheduler, i18n, log, silent-nav, blocks, host UI Shadow DOM), 51 test unitari verdi. Completata prima della Fase 2 perche' non dipende dai selettori reali di IG/YT; non ancora agganciata a `src/main.ts`
- [ ] Fase 4 — Instagram — **codice scritto, test unitari/DOM verdi** (routes, route-guard, nav-cleanup, app-banners, explore-search, feed-filter, feed-reels-placeholder, feed-limiter, stories-ads, reel-lock, account, `platforms/instagram/index.ts` agganciato a `main.ts`). Mancano solo gli **scenari live §7.3** (non ancora eseguiti) e la rifinitura di reel-lock.ts/stories-ads.ts sui punti ancora aperti dello spike (d, i) — vedi commenti `TODO` nei rispettivi file e `docs/spike-findings.md`
- [ ] Fase 5 — YouTube — **codice scritto, test unitari/DOM verdi** (routes, selectors, section, shorts-hider, `platforms/youtube/index.ts` agganciato a `main.ts`). Selettori aggiornati secondo `docs/spike-findings.md` punto (p) (`ytm-reel-shelf-renderer`/`ytm-reel-item-renderer` del piano originale non esistono più). Manca solo lo **scenario live YT di §7.3** (non ancora eseguito)
- [ ] Fase 6 — Statistiche e UI
- [ ] Fase 7 — Release v1.0.0 (+ Greasy Fork)
- [ ] Fase 8 — (prodotto fase 2) Layout desktop PC/iPad — NON in v1

## 0. Contesto
L'utente vuole ricreare l'esperienza di **SocialLite** (sociallite.app): Instagram usabile per DM, storie e post di chi segui, senza reel, contenuti suggeriti e scroll infinito; più YouTube senza Shorts.
Vincoli: **iPhone (iOS 26)**, **nessun account sviluppatore Apple**, progetto **pubblico su GitHub** (`glingus/socialmerd`) scaricabile da chiunque.
Soluzione: un **userscript** eseguito da **Tampermonkey** dentro il browser gratuito **Orion (Kagi)**: è "Instagram web modificato lato client", senza server, senza scadenze, senza costi.

> ## ⚠️ Aggiornamento 2026-09-17 (sera): via da Safari, si va su Orion
>
> **Il problema.** Il piano puntava a Safari + un'app che ospita userscript: prima **Userscripts** (quoid), poi — quando quella non si attivava — **Stay for Safari**. Non si attivava nemmeno quella. La diagnosi è finita con la prova decisiva: l'utente ha installato **Grammarly**, un'estensione Safari mainstream e sicuramente compatibile con iOS 26. **Non si attiva neanche quella.** Screen Time escluso, profilo VPN rimosso ed escluso, supporto Apple contattato senza esito.
> **Conclusione: su quel dispositivo il sottosistema estensioni di Safari è rotto.** Non è un bug di un'app: è il telefono. Safari esce dal piano.
>
> **La soluzione, verificata sul telefono dell'utente la sera del 2026-09-17.** **Orion (Kagi)** è l'unico browser iOS che esegue estensioni **Chrome e Firefox**, e lo fa con una **propria implementazione delle WebExtensions sopra WKWebView** — cioè non passa dal meccanismo estensioni di Safari, che è appunto il pezzo rotto. È gratis, sull'App Store, aggiornato di continuo (1.5.3 del 2026-09-14), e **Tampermonkey è nella loro galleria curata** di estensioni testate su mobile.
>
> **Esito del test:** Tampermonkey installato in Orion, `dist/socialmerd.user.js` dal link raw di `dev` installato senza errori, badge "hello" visibile su Instagram e YouTube, storage GM persistente, `document-start` rispettato. **Zero righe di codice cambiate.** Cambiano solo installazione, README e il modo di aprire Instagram (§4.8).
>
> **Cosa resta valido di tutto il piano:** tutto. Orion è WebKit, quindi Instagram e YouTube si comportano esattamente come in Safari: stessa CSP, stesso layout mobile, stessi selettori. Lo spike della Fase 2 e il codice della Fase 3 non vanno rifatti.
>
> **Rischio dichiarato, da tenere a mente:** Orion è closed source, di un singolo fornitore, e il supporto estensioni su iOS è dichiarato *beta*. È un punto singolo di fallimento. Le alternative citate in giro (Quetta, Lemur) sono state verificate e **non** supportano estensioni su iOS, solo su Android. La scala di fallback e le diagnosi Safari ancora non provate sono in `docs/RICERCA.md` §4.2.

Perché non una webapp/PWA (verificato): un sito non può leggere o modificare instagram.com (CORS), Instagram manda `X-Frame-Options: DENY`, la CSP con nonce blocca i bookmarklet, e l'API pubblica per feed/DM non esiste più. Un proxy farebbe passare le credenziali da un server ed è inaccettabile.

## 1. SocialLite vs socialmerd v1
| SocialLite | socialmerd v1 |
|---|---|
| Carica il web di IG/YT in un'app, nasconde le parti che creano dipendenza | Uguale, ma dentro il browser Orion tramite userscript |
| Niente tab Reel, reel nel feed, Esplora, suggeriti, ads | ✅ (i reel di chi segui diventano segnaposto, profili invariati) |
| Reel ricevuto in DM: lo guardi, niente scroll al successivo, torni in chat | ✅ (ritorno silenzioso) |
| YouTube senza Shorts (e ads) | ✅ solo Shorts (il resto invariato) |
| Multi-account (fino a 10) | ✅ tramite lo switcher di Instagram (max 5) |
| Contatore tempo, statistiche | ✅ pillola + pannello (tempo, sezioni, blocchi scattati) |
| Blocco app native (Screen Time/Accessibility), Post Mode | ❌ l'utente disinstalla le app ufficiali |
| Sleep mode, parental, VPN contenuti adulti, Pro, altri social | ❌ fuori scopo |
| Notifiche (neanche loro), chiamate, foto "visualizza una volta" | ❌ limiti del web |

## 2. Decisioni prese con l'utente
| Tema | Decisione |
|---|---|
| Forma | Userscript eseguito da **Tampermonkey dentro Orion (Kagi)** su iOS. Safari abbandonato il 2026-09-17 (estensioni non attivabili su quel dispositivo, vedi §0). Motore separato dal "delivery" per eventuali wrapper futuri |
| Gestore userscript | **Tampermonkey** è quello ufficiale (verificato funzionante su Orion/iOS 26 il 2026-09-17). Documentare come alternative, in quest'ordine, se un giorno smette: **Violentmonkey**, **ScriptCat** (entrambi su Firefox Add-ons), **OrangeMonkey** (solo Chrome Web Store) |
| Piattaforme v1 | iPhone, browser **Orion** (layout **mobile**). iPad = Orion + "Richiedi sito mobile" |
| Fase 2 (dopo v1) | Layout **desktop** per PC (Chrome/Firefox + Tampermonkey) e iPad |
| Social | Instagram + YouTube (solo Shorts) |
| Nome / licenza | `socialmerd` / **GPL-3.0-or-later** |
| Repo | `github.com/glingus/socialmerd`, **pubblico da subito**; branch `main` (stabile) e `dev` (sviluppo) |
| Distribuzione | GitHub (link raw) + **Greasy Fork** (alla v1) |
| Multi-account IG | Switcher nativo di Instagram web; lo stato del feed è salvato **per account** |
| Reel ricevuti in DM | Si guardano (audio, like, commenti ok); qualsiasi passaggio a un altro reel → **ritorno silenzioso** alla chat |
| Reel di chi segui nel feed | **Segnaposto con copertina statica** (avatar, nome, data, inizio didascalia, "Guarda reel") → tap = player isolato |
| Profili (anche non seguiti) | Invariati, **tab Reel inclusa**; ogni reel si apre nel player isolato |
| Feed Home | Solo account seguiti; stop "Sei in pari" ai post già visti o più vecchi di **1 giorno** |
| Esplora | Solo ricerca **account**; griglia Esplora nascosta; hashtag/luoghi/audio/"persone suggerite" bloccati |
| Storie | Normali; **storie sponsorizzate saltate** in automatico |
| Pubblicazione | Deve funzionare la pubblicazione di **Storie** dal web mobile in Orion (da verificare nello spike, punto (j)) |
| Notifiche | Nessuna; l'utente disinstalla le app IG/YT. I link da altre app devono aprirsi **in Orion**: per questo Orion va impostato come browser predefinito (§4.8) |
| Feedback ai blocchi | **Silenzioso**: nessun avviso, solo ritorno indietro |
| Impostazioni | **Blocchi base fissi nel codice**; configurabili solo gli extra (pillola, lingua, controllo aggiornamenti, azzera statistiche) |
| Extra | Contatore tempo: **pillola discreta + pannello** con tempo IG/YT (oggi + 7 giorni), **tempo per sezione**, **blocchi scattati** |
| Lingua | UI dello script **IT/EN automatica** (override nel pannello); README in inglese + sezione italiana |
| Test live | Sul **profilo principale** dell'utente, con i paletti di §7.3; il login lo fa **solo l'utente** a mano |

## 3. Architettura tecnica

### 3.1 Stack
- **TypeScript** strict, **esbuild** (bundle IIFE, **non minificato**, obbligatorio per Greasy Fork), target `safari16`.
- **Vitest + happy-dom** per i test unitari e DOM; **Playwright** (canale `chrome` già installato, profilo `devices['iPhone 15']`) per lo spike e i test live manuali.
- ESLint (typescript-eslint) + Prettier; GitHub Actions per la CI.
- Nessuna dipendenza runtime: la UI è in DOM/CSS puro dentro Shadow DOM.
- Ambiente PC: Node 24 ✅, Git ✅, gh CLI loggato come `glingus` ✅, Chrome ed Edge ✅. **Non servono** Java o Android SDK.

### 3.2 Build, varianti e canali
`scripts/build.mjs` genera il blocco metadati da `package.json` + `src/meta.ts` e produce:
| File | Uso | `@updateURL` / `@downloadURL` | Controllo aggiornamenti in-script |
|---|---|---|---|
| `dist/socialmerd.user.js` (+ `.meta.js`) su `main` | Stabile, link pubblico | `https://raw.githubusercontent.com/glingus/socialmerd/main/dist/socialmerd.{meta,user}.js` | Sì |
| `dist/socialmerd.user.js` su `dev` (versione `X.Y.Z.<build>`) | Build di sviluppo sull'iPhone dell'utente | stessi path ma sul branch `dev` | Sì |
| `dist/socialmerd.greasyfork.user.js` | Sync Greasy Fork | nessuno (li gestisce GF) | No |

- La cartella `dist/` è **committata**: il link raw deve finire in `.user.js`. Le Release GitHub fanno redirect e non vanno usate come link di installazione. **Verificato il 2026-09-17:** aprendo `https://raw.githubusercontent.com/glingus/socialmerd/dev/dist/socialmerd.user.js` dentro Orion, Tampermonkey intercetta il link e mostra la sua schermata "Installing script" con `@grant`, `@match` e `@connect` letti correttamente. Il flusso funziona senza modifiche.
- La CI verifica che `dist/` sia aggiornata (`build` + `git diff --exit-code`).
- Il raw di GitHub ha una cache di circa 5 minuti: va detto all'utente durante i test.

### 3.3 Metadati (base)
`@name socialmerd` · `@namespace https://github.com/glingus/socialmerd` · `@description` in inglese (+ `@description:it`) · `@license GPL-3.0-or-later` · `@match https://www.instagram.com/*`, `https://instagram.com/*`, `https://m.youtube.com/*`, `https://www.youtube.com/*`, `https://youtube.com/*` · `@run-at document-start` · `@inject-into content` · `@noframes` · `@grant GM.getValue, GM.setValue, GM.deleteValue, GM.listValues, GM.xmlHttpRequest` · `@connect raw.githubusercontent.com` · `@homepageURL`/`@supportURL` GitHub.

> **Dopo il pivot (2026-09-17):** il blocco resta **identico**, Tampermonkey lo accetta così com'è. `@inject-into content` è un tag di Userscripts/Violentmonkey: Tampermonkey lo ignora senza errori, quindi si tiene (serve a Violentmonkey, che è il primo fallback). **Unica cosa da correggere:** in `src/meta.ts` le due `@description` dicono ancora "in Safari su iPhone (tramite l'app Stay for Safari)" — vanno riscritte su Orion + Tampermonkey. È l'unico punto del codice toccato dal pivot (vedi §5.0).

### 3.4 Ambiente di esecuzione e regole di robustezza (vincolanti)
- Lo script gira nel **mondo isolato** (content world / sandbox di Tampermonkey). **Decisione vincolante:** si progetta come se `history.pushState` e `fetch` della pagina **non** fossero agganciabili, e questo non cambia neanche se lo spike punto (q) dovesse dire il contrario.
  - *Perché resta così anche su Orion:* Instagram manda una CSP con nonce e senza `unsafe-inline`, quindi l'iniezione di uno `<script>` in pagina è bloccata; `@grant none` / `@sandbox raw` / `unsafeWindow` su un'implementazione WebExtension non-Apple in beta sono un terreno non documentato. Legarci il filtro del feed significherebbe appendere il prodotto a un dettaglio non garantito di un browser di terze parti.
  - *Se lo spike (q) dicesse che il mondo pagina è raggiungibile*, diventa un'**ottimizzazione di una fase futura** (filtrare le risposte GraphQL invece del DOM, alla FocusGram), da attivare con un interruttore e con il percorso DOM sempre come fallback. **Mai** una dipendenza: ogni funzione deve restare corretta con il solo DOM.
  - Cambi di URL: polling ogni 250 ms + `popstate` + evento `navigation` `currententrychange` se disponibile.
  - Gesti: listener di cattura su `document` (funzionano tra i due mondi).
  - CSS: `<style>` iniettato su `documentElement` a document-start (la CSP lo consente).
- **Un solo** `MutationObserver` (`core/dom-scheduler`) con elaborazione a lotti throttled (rAF/100 ms). Processori **idempotenti** con marcatori `data-smd-*`.
- Ordine di affidabilità dei segnali: **URL/rotta → href/struttura/ARIA → testo** (dizionari IT/EN). **Mai** classi CSS offuscate.
- **Tutti** i selettori stanno in `platforms/*/selectors.ts` e **tutte** le stringhe riconosciute in `platforms/*/strings.ts`, ognuna con commento `// verified YYYY-MM-DD`.
- Ogni feature è in `try/catch` e non deve rompere la pagina.
  - **Fail-open** per l'interfaccia essenziale: composer DM, viewer storie, flusso Crea/Storia, login e impostazioni.
  - **Fail-closed** per le rotte feed-reel: redirect.
- **Nessuna richiesta di rete** dello script, tranne il controllo aggiornamenti giornaliero (§4.7). Nessuna telemetria.
- Accesso a `GM` solo tramite l'adattatore `core/gm.ts` (fallback su `localStorage` per test e harness).

### 3.5 Struttura del repository
```
src/
  main.ts                     # rileva sito e layout, avvia core + piattaforma
  meta.ts                     # dati metadati per la build
  core/  env.ts gm.ts storage.ts(schema versionato + migrazioni) url-watcher.ts dom-scheduler.ts styles.ts
         i18n/{index,it,en}.ts log.ts silent-nav.ts(stack di navigazione per tab, back/replace) blocks.ts
         ui/{host(shadow DOM),pill,panel,welcome,bars,debug-overlay}.ts
  features/ time-tracker.ts update-check.ts
  platforms/instagram/ index.ts routes.ts selectors.ts strings.ts account.ts section.ts route-guard.ts
         nav-cleanup.ts reel-lock.ts feed-filter.ts feed-reels-placeholder.ts feed-limiter.ts
         explore-search.ts stories-ads.ts app-banners.ts
  platforms/youtube/ index.ts routes.ts selectors.ts shorts-hider.ts section.ts
tests/ unit/  dom/  fixtures/(sanificati; raw/ ignorato da git)  e2e/live/
scripts/ build.mjs release.mjs e2e-login.mjs capture-fixture.mjs sanitize-fixture.mjs
docs/ PIANO.md RICERCA.md spike-findings.md TESTING-iphone.md
.github/workflows/ci.yml  .github/ISSUE_TEMPLATE/selettore-rotto.md
README.md (EN + sezione IT)  LICENSE (GPL-3.0)  CHANGELOG.md  CLAUDE.md
```

## 4. Specifica funzionale (criteri di accettazione)

### 4.1 Instagram: tabella delle rotte (`routes.ts` è una funzione pura, coperta da test)
| Rotta | Comportamento |
|---|---|
| `/` senza `variant` | `location.replace('/?variant=following')` (se lo spike conferma il supporto mobile; altrimenti modalità "ranked", §4.3) |
| `/?variant=following`, `/?variant=favorites` | Feed attivo: segnaposto reel, filtri, limitatore |
| `/reels/`, `/reels/*` (inclusa `/reels/audio/*`) | **Bloccata** → ritorno silenzioso |
| `/reel/<code>/` | Consentita solo come **player isolato** (§4.2) |
| `/<user>/`, `/<user>/reels/`, `/<user>/tagged/`, `/p/<code>/` | Consentite; nascondere solo i blocchi "Suggeriti" |
| `/explore/` | Griglia nascosta, resta solo la ricerca (fallback: redirect a `/explore/search/`) |
| `/explore/search/` | Consentita; nei risultati nascondere hashtag/luoghi/audio |
| `/explore/tags/*`, `/explore/locations/*`, `/explore/people/*` | **Bloccate** → ritorno silenzioso |
| `/direct/*` | Consentite; reel nei thread → player isolato |
| `/stories/*` | Consentite; salto delle sponsorizzate |
| `/accounts/activity/` | Consentita; sezione "Suggeriti per te" nascosta |
| `/accounts/*`, `/create/*`, `/challenge/*` | **Nessun intervento** (solo contatore tempo) |

**Ritorno silenzioso** (`core/silent-nav.ts`):
- Stack degli URL consentiti per tab, salvato in `sessionStorage`.
- Se la voce precedente è quella consentita si usa `history.back()`, altrimenti `location.replace(ultimo consentito || '/?variant=following')`.
- Rotta bloccata al caricamento iniziale: redirect a document-start, prima del paint.
- Rotta bloccata raggiunta via SPA: `html[data-smd-blocking]` nasconde subito il body, poi ritorno.
- Ogni blocco incrementa `blocks.<tipo>` (§4.6).

### 4.2 Player isolato (`reel-lock.ts`)
- **Attivazione:** URL `/reel/<code>/`, oppure viewer reel rilevato nel DOM dentro `/direct/*` (struttura dallo spike). Salvare `lockedReel` e `origin` (URL precedente; se manca → Home).
- **Durante il lock:**
  - Bloccare `touchmove` verticale, `wheel` e i tasti freccia/PagSu/PagGiù/spazio in cattura.
  - **Eccezioni:** foglio commenti, foglio condivisione, menu, input/textarea.
  - `overscroll-behavior:none` e `overflow:hidden` sullo scroller dei reel.
  - Nascondere gli elementi reel **adiacenti** già precaricati.
- **Uscita:**
  - Se l'URL diventa `/reel/<altro>/` (swipe o autoplay) → ritorno silenzioso all'`origin`, `blocks.reel_next++`.
  - Se diventa `/reels/*` → ci pensa il route guard.
  - Chiudere o tornare indietro in modo normale → sblocco.
- **Accettazione:** reel aperto da DM, da segnaposto, da profilo o da link esterno → nessun modo di vedere un secondo reel; like/commenti/audio funzionano.

### 4.3 Feed Home
- **Filtri (`feed-filter.ts`):**
  - Nascondere i post "Sponsorizzato/Sponsored", **non** le "Partnership pubblicizzate" di account seguiti.
  - Nascondere i post di account non seguiti (etichetta "Suggeriti per te"/"Suggested for you" o bottone Segui/Follow nell'header).
  - Nascondere i carousel/blocchi di account suggeriti e i reel suggeriti.
- **Segnaposto (`feed-reels-placeholder.ts`):**
  - Un post-reel (permalink `/reel/`) → articolo originale nascosto e tutti i suoi `video` in pausa e muti (anche se ripartono).
  - Al suo posto una card con avatar, @nome, data, **copertina statica** (`video[poster]` o prima `img`), prime 100 lettere della didascalia e pulsante "Guarda reel" → `/reel/<code>/` (player isolato, `origin` = feed).
- **Limitatore (`feed-limiter.ts`)**, stato per account `ig:<account>:feed = { watermark, lastCaughtUpAt }`:
  - `boundary = max(watermark ?? 0, now − 24h)`. Timestamp da `time[datetime]` del post; i post senza timestamp non fermano mai.
  - **Modalità cronologica** (feed "Seguiti"): al primo post con `t ≤ boundary` inserire la card **"Sei in pari ✓"**, nascondere quel post e tutti i successivi.
  - **Modalità "ranked"** (se `variant=following` non funziona su mobile): nascondere i singoli post ≤ boundary e mostrare la card dopo 5 post consecutivi ≤ boundary oppure dopo 50 post elaborati.
  - **Nessun post nuovo:** la card compare subito sotto la barra storie.
  - **Card visibile ≥ 50%** (IntersectionObserver): `watermark = max(watermark, post più recente mostrato nella sessione)`, `blocks.feed_end++` (una volta per sessione).
  - **Stop ai caricamenti:** clip del contenitore del feed (`max-height` fino alla card + `overflow:hidden`) **e** sentinel/spinner nascosti. **Accettazione:** nel test live, dopo lo stop, nessuna nuova richiesta di paginazione del feed per 30 s di scroll.
  - La card non ha pulsanti per vedere post più vecchi (blocco fisso). Le logiche di decisione sono **funzioni pure** testate a parte.

### 4.4 Esplora, profili, attività, storie, banner
- **`nav-cleanup.ts`:** nasconde ovunque i link di navigazione verso `/reels/`. Icona Esplora: resta e porta alla ricerca.
- **`explore-search.ts`:** su `/explore/` nasconde la griglia (link `/p/` e `/reel/` nel main) e lascia solo il campo di ricerca; su `/explore/search/` nasconde le voci che puntano a `/explore/tags|locations/` o `/reels/audio/`.
- **Profili:** nessuna modifica, tranne nascondere "Suggeriti per te" e "Account simili".
- **`stories-ads.ts`:** storia con etichetta sponsorizzata → "avanti" (pulsante Next/Avanti o tap sul terzo destro). Massimo 3 tentativi per storia, niente loop.
- **`app-banners.ts`:** nasconde i banner "Apri l'app / Usa l'app" e chiude le interstiziali ("Non ora").
- **`account.ts`:** username loggato dal link profilo nella navigazione (dallo spike); fallback `default`.
- Il flusso **Crea → Storia** non va mai toccato.

### 4.5 YouTube (layout mobile `m.youtube.com`)
- **Redirect:** `/shorts/<id>` → `location.replace('/watch?v=<id>')` (spike: nessun rimbalzo).
- **CSS/processori (`selectors.ts`):**
  - Scaffali Shorts (`ytm-reel-shelf-renderer` e sezioni che li contengono).
  - Elementi `ytm-shorts-lockup-view-model*` e `ytm-reel-item-renderer`.
  - Tab Shorts nella barra in basso.
  - Chip/filtri "Shorts" e tab Shorts dei canali.
  - Qualsiasi elemento video il cui link inizia con `/shorts/`.
- Nient'altro cambia (home, autoplay, correlati restano come sono).

### 4.6 Statistiche, pillola, pannello
- **`time-tracker.ts`:** tick ogni secondo se la pagina è visibile **e** (interazione negli ultimi 60 s **o** un video in riproduzione).
  - Chiave `smd:v1:stats:<YYYY-MM-DD>` = `{ ig:{feed,dm,stories,profile,reel,search,other}, yt:{video,browse}, blocks:{reel_next,blocked_route,feed_end} }`.
  - Salvataggio ogni 10 s e su `visibilitychange`/`pagehide`. Conservazione 35 giorni.
- **UI in Shadow DOM** (host fuori dalla root React):
  - **Pillola:** minuti di oggi del sito corrente, in basso a destra sopra la barra di navigazione (posizione dallo spike). Nascosta in `/direct/t/*`, `/stories/*`, `/reel/*`, `/create/*`, `/accounts/*` e sul video YouTube a schermo intero. Pallino se c'è un aggiornamento.
  - **Pannello** (foglio dal basso), sezioni:
    - Oggi: IG, YT e ripartizione per sezione.
    - Ultimi 7 giorni: barre IG/YT.
    - Blocchi scattati: oggi e 7 giorni.
    - Impostazioni extra: pillola on/off, lingua Auto/IT/EN, controllo aggiornamenti on/off, azzera statistiche con conferma.
    - Info: versione e canale, link GitHub, nota "i blocchi base non sono disattivabili".
  - Tema chiaro/scuro con `prefers-color-scheme`; aria-label su tutti i controlli.
- **Benvenuto (primo avvio):** cosa viene bloccato + i consigli di §4.8 (disinstallare le app ufficiali IG/YT, creare l'icona sulla Home con il Comando Rapido, mettere Orion come browser predefinito, controllare che socialmerd risulti attivo in Tampermonkey). **Niente riferimenti a Safari, a estensioni Safari o ad "Apri come web app": non c'entrano più nulla.**
- **Overlay di debug:** si attiva con 5 tap sulla versione nel pannello. Mostra le ultime 50 righe di log, le feature disponibili (GM, navigation API) e i contatori dei selettori trovati. Serve per il debug su iPhone senza Web Inspector.

### 4.7 Aggiornamenti e lingue
- **`update-check.ts`** (solo varianti GitHub; non ci si affida all'auto-update dell'app che ospita l'estensione, qualunque essa sia): **massimo 1 volta al giorno** `GM.xmlHttpRequest` sul `.meta.js` del proprio canale e confronto di `@version`. Se c'è una versione nuova: pallino sulla pillola e link di installazione nel pannello. Dichiarato nel README.
- **i18n:** lingua da `navigator.language` (`it*` → it, altrimenti en), con override nel pannello. Dizionari di riconoscimento IG/YT con IT + EN, estendibili.

### 4.8 Come si apre Instagram ogni giorno (sostituisce l'icona web app di Safari)

Il piano prevedeva un'icona sulla schermata Home creata da Safari, con "Apri come web app" disattivato. **Con Orion non è possibile:** mettere icone sulla Home è una funzione riservata a Safari, i browser di terze parti non ce l'hanno. (Dal 2024 la DMA obbliga Apple ad aprire anche questo in UE, ma **solo ai browser con motore proprio**: Orion usa WebKit, quindi non rientra. E a settembre 2026 nessun browser con motore proprio è mai stato rilasciato su iOS.)

**Soluzione: un Comando Rapido con icona sulla Home.** L'app Comandi Rapidi *può* mettere un'icona sulla schermata Home, con nome e immagine scelti dall'utente, e quell'icona può aprire Orion direttamente su un URL preciso. È **meglio** dell'originale, perché punta già al feed cronologico invece che alla home di Instagram.

Due varianti, in ordine di preferenza:

1. **Schema URL di Orion** — non tocca il browser predefinito:
   - Comandi Rapidi → nuovo comando → azione **Apri URL** → `orion://open-url?url=https://www.instagram.com/?variant=following`
   - menu condivisione del comando → **Aggiungi alla schermata Home** → nome "Instagram", icona a scelta
   - ⚠️ **Da verificare sul telefono**, spike punto (r): lo schema `orion://open-url?url=…` è documentato dalla community per iOS/iPadOS, ma non dalla documentazione ufficiale Kagi (dove il tema risulta "Planned" e riferito a macOS). Se non funziona → variante 2.
2. **Orion come browser predefinito** — garantita:
   - Impostazioni → App → Orion → **App browser di default**
   - stesso Comando Rapido, ma con **Apri URL** → `https://www.instagram.com/?variant=following` (senza schema)
   - **vantaggio che vale da solo:** ogni link a Instagram o YouTube toccato dentro un'altra app (WhatsApp, Telegram, mail) si apre in Orion, quindi **con socialmerd attivo**. Senza questo, quei link finiscono in Safari, dove non c'è nessun blocco: è il buco più grosso del pivot, e questa impostazione lo chiude.

**Da NON fare:** se Orion offre un suo "Aggiungi alla schermata Home", non usarlo per Instagram. Su Safari le estensioni non girano nelle web app della Home, e non c'è ragione di aspettarsi che Orion si comporti diversamente: si rischia un'icona che apre Instagram **senza** socialmerd, cioè il peggio possibile (sembra protetto e non lo è). L'icona deve passare dal Comando Rapido, che apre il browser vero.

Stessa cosa per YouTube: secondo Comando Rapido su `https://m.youtube.com/`.

## 5. Fasi di lavoro per Sonnet (in ordine, ognuna con criterio di uscita)

### 5.0 Debito tecnico lasciato dal pivot a Orion — **CHIUSO il 2026-09-17**
Il pivot **non tocca la logica**, solo i testi che nominano Safari.
1. ~~`src/meta.ts`~~ — **fatto**: le due `@description` (EN e IT) riscritte su Orion + Tampermonkey; `npm run build:dev` rilanciata e `dist/` ricommittata (commit `ceee77d`).
2. ~~`README.md`~~ — **già fatto** il 2026-09-17: installazione riscritta su Orion + Tampermonkey, con l'avviso sul Chrome Web Store e i passi del Comando Rapido, in inglese e in italiano.
3. `docs/TESTING-iphone.md`: non esiste ancora (si crea nella Fase 7). Quando lo crei, i passi sono quelli di Orion + Tampermonkey, **non** Impostazioni › Safari › Estensioni.
4. ~~`CHANGELOG.md`~~ — **già fatto** il 2026-09-17 (voce "Changed" sul passaggio a Orion).
5. Spuntare la Fase 1 è **già fatto** in questo documento: non rifare il test del badge.
1. **Repo e scaffold.**
   - `git init`, `.gitignore` (`node_modules`, `.auth/`, `tests/fixtures/raw/`, `test-results/`, `playwright-report/`).
   - `package.json` con script: `build`, `build:dev`, `watch`, `test`, `lint`, `typecheck`, `e2e:login`, `e2e:live`, `fixture:capture`, `release`.
   - tsconfig, build esbuild con le 3 varianti, vitest, eslint/prettier, LICENSE GPL-3.0, README e CHANGELOG di base, CI.
   - **Chiedere conferma all'utente** prima di `gh repo create glingus/socialmerd --public` e del primo push; poi creare il branch `dev`.
   - Userscript "hello" con badge di debug, installato dall'utente sull'iPhone dal link raw `dev`.
   - *Uscita:* l'utente conferma che su iOS 26 il badge appare su instagram.com e m.youtube.com, che GM storage persiste e che il CSS a document-start si applica prima del paint.
   - ✅ **FATTA il 2026-09-17, su Orion + Tampermonkey.** Badge su entrambi i siti, contatore `visite` salito a 7 tra un ricaricamento e l'altro (storage GM confermato), comparsa immediata (document-start confermato). **Non ripetere questo test.**
2. **Spike sul DOM reale** (`docs/spike-findings.md`, una voce per punto con esito, selettori, data e screenshot).
   - `npm run e2e:login` apre Chrome con emulazione iPhone e profilo persistente `.auth/`: il login lo fa **l'utente**.
   - `npm run fixture:capture -- <url>` salva HTML **sanificato** (nomi, testi, URL media sostituiti, script e JSON rimossi) più uno screenshot; gli originali vanno in `raw/`.
   - Punti da verificare:
     - (a) `?variant=following` su mobile e riconoscimento della modalità.
     - (b) Struttura del post: `article`, permalink `/p/` o `/reel/`, `time[datetime]`, header sponsorizzato/suggerito, bottone Segui.
     - (c) Sentinel di caricamento e nomi delle richieste di paginazione; verificare che il clip le fermi.
     - (d) Reel aperto da un DM: URL, viewer, come avviene lo swipe al successivo, fogli commenti/condivisione.
     - (e) `/reel/<code>/` caricato direttamente.
     - (f) Tab reel del profilo.
     - (g) Barra di navigazione, link e altezza.
     - (h) `/explore/` e `/explore/search/` con la struttura dei risultati.
     - (i) Viewer storie: sponsorizzate e pulsante avanti.
     - (j) *(test sull'iPhone dell'utente, in Orion)* pubblicare una Storia dal web mobile, con script attivo e disattivo.
     - (k) *(iPhone)* switcher account su web mobile.
     - (l) Username loggato.
     - (m) Banner e interstiziali "app".
     - (n) Suggeriti in attività e profilo.
     - (o) *(iPhone)* timing document-start, GM e navigation API nel content world, tramite l'overlay di debug.
     - (p) m.youtube.com: selettori Shorts e redirect `/shorts` → `/watch`.
     - (q) *(iPhone, aggiunto dopo il pivot)* **Il mondo pagina è raggiungibile da Tampermonkey su Orion?** Sonda minima, da mostrare nell'overlay di debug: (1) `typeof unsafeWindow`; (2) `unsafeWindow.fetch !== fetch`; (3) scrivere `unsafeWindow.__smd_probe = 1` e rileggerlo; (4) una build separata con `@grant none` — parte o la CSP di Instagram la blocca? Riportare anche eventuali errori CSP in console. **Esito atteso: negativo.** Se fosse positivo, **non cambiare nulla adesso**: annotarlo e basta, è materiale per una fase futura (vedi §3.4).
     - (r) *(iPhone, aggiunto dopo il pivot)* **Lo schema `orion://open-url?url=…` funziona?** Provare un Comando Rapido "Apri URL" con `orion://open-url?url=https://www.instagram.com/?variant=following`. Se apre Orion sulla pagina giusta → variante 1 di §4.8. Altrimenti → variante 2 (browser predefinito), e correggere §4.8 e il README.
   - *Uscita:* tutti i punti documentati. **Se una decisione di prodotto risulta irrealizzabile → fermarsi e chiedere all'utente.**
3. **Core:** `gm`, `storage` + migrazioni, `url-watcher`, `dom-scheduler`, `styles`, `i18n`, `log`, `silent-nav`, `blocks`, host UI. *Uscita:* test unitari verdi.
4. **Instagram:** `routes` (con test a tabella), `route-guard`, `nav-cleanup`, `app-banners`, `explore-search`, `reel-lock`, `feed-filter`, `feed-reels-placeholder`, `feed-limiter`, `stories-ads`, `account`. *Uscita:* test DOM sulle fixture verdi e scenari live §7.3 superati.
5. **YouTube Shorts.** *Uscita:* test DOM + scenari live YT.
6. **Statistiche e UI:** `time-tracker`, pillola, pannello, benvenuto, overlay di debug, `update-check`, stringhe IT/EN. *Uscita:* test con timer finti; verifica visiva su emulatore e su iPhone.
7. **Release v1.0.0:**
   - README EN + IT, installazione passo-passo su iOS 26 (flusso verificato il 2026-09-17):
     1. App Store → **Orion Browser by Kagi** (gratis; le estensioni non sono dietro Orion+).
     2. In Orion: **•••** in basso a destra → **Extensions** → **+** → installare **Tampermonkey**. In alternativa, link diretto a Firefox Add-ons (`addons.mozilla.org/it/firefox/addon/tampermonkey/`), che da mobile funziona. **Il Chrome Web Store no: da iPhone risponde "disponibile solo da computer"**, a meno di attivare la modalità desktop di Orion — dirlo esplicitamente nel README, è il primo scoglio in cui si inciampa.
     3. Aprire in Orion il link raw `.user.js` → Tampermonkey mostra "Installing script" → **Install**.
     4. Icona sulla schermata Home con il Comando Rapido e Orion come browser predefinito (§4.8).
     5. Disinstallare le app ufficiali Instagram e YouTube.
     + aggiornamento, privacy, limitazioni (§9), segnalazione selettori rotti.
     - Alternative al gestore, se Tampermonkey desse problemi: **Violentmonkey**, **ScriptCat** (Firefox Add-ons), **OrangeMonkey** (Chrome Web Store).
   - `docs/TESTING-iphone.md` eseguito dall'utente; tag `v1.0.0`, Release GitHub, merge `dev` → `main`.
   - **Greasy Fork:** istruzioni per l'utente (crea lui l'account e imposta la sincronizzazione dal raw di `socialmerd.greasyfork.user.js`; Sonnet non crea account).
8. **Fase 2 del prodotto (non in v1):** adattatore desktop (`platforms/*/layouts/desktop`) per PC e iPad, lock dei reel nelle modali desktop, documentazione per Tampermonkey su Chrome (toggle "Allow User Scripts").

## 6. File critici
`src/platforms/instagram/{routes,selectors,strings,reel-lock,feed-limiter}.ts`, `src/core/{silent-nav,dom-scheduler,url-watcher,storage}.ts`, `scripts/build.mjs`, `README.md`, `docs/spike-findings.md`.
Riferimenti studiati (solo ispirazione, **non copiare codice**: FocusGram è AGPL, FeurStagram GPL): FocusGram `lib/scripts/content_disabling.dart` (lock scroll dei reel nei DM), `assets/scripts/content_hider.js` (hook SPA e rimozione dal DOM contro i buchi nel feed); NoReel `Injector.js` (`?variant=following`, `/explore/search/`).

## 7. Verifica e test
### 7.1 Unit (Vitest)
Classificazione delle rotte (tabella completa §4.1), decisione di stop del feed (cronologica e ranked, casi limite: nessun timestamp, zero post nuovi, watermark nel futuro), ritorno silenzioso, time tracker con timer finti, migrazioni storage, confronto versioni, scelta lingua.
### 7.2 DOM (Vitest + happy-dom su fixture sanificate)
Nascondimento reel tab/griglia Esplora, card segnaposto con copertina, card "Sei in pari" e clip, filtri sponsorizzati/suggeriti, Shorts nascosti. Le parti che dipendono dal layout (IntersectionObserver, misure) sono iniettabili e mockate.
### 7.3 Live (Playwright, **solo manuale**, mai in CI)
- **Setup:** Chrome con `devices['iPhone 15']`, profilo persistente `.auth/` loggato a mano dall'utente; script iniettato con `addInitScript` + shim GM.
- **Paletti (account principale):**
  - Solo navigazione in lettura: mai like, follow, commenti, invii o pubblicazioni.
  - `slowMo` 500 ms, un worker, al massimo una suite per sessione.
  - Nessun flag per nascondere l'automazione.
  - **Stop immediato** su pagine checkpoint/challenge/login, avvisando l'utente.
- **Scenari:**
  - `/` → following.
  - Nessun link Reel.
  - Segnaposto con copertina → tap → player isolato → tentativo swipe/rotella → ritorno all'origine.
  - `/reels/` → ritorno.
  - `/explore/` solo ricerca; `/explore/tags/x` → ritorno.
  - Thread DM con un reel condiviso (l'utente ne indica uno) → lock.
  - Card fine feed + nessuna paginazione successiva (asserzione sulla rete).
  - m.youtube.com senza Shorts; `/shorts/<id>` → `/watch`.
### 7.4 iPhone (utente, a ogni release candidate)
Checklist `docs/TESTING-iphone.md`: gli stessi scenari + pubblicazione Storia + cambio account + pillola/pannello/statistiche + avviso aggiornamento + permessi dell'estensione.
### 7.5 CI (GitHub Actions)
typecheck, lint, test unit+DOM, build, `dist/` aggiornata.

## 8. Regole operative per Sonnet (andranno in `CLAUDE.md`)
- Parlare con l'utente **in italiano**; codice, identificatori e commenti in inglese; stringhe UI solo via i18n.
- Il piano è vincolante: niente cambi di prodotto senza chiedere. Aggiornare le spunte delle fasi in `docs/PIANO.md` e le scoperte in `docs/spike-findings.md`.
- **Mai** gestire le credenziali dell'utente: il login lo fa lui nel browser aperto dall'harness.
- **Mai** committare dati personali: `.auth/`, fixture non sanificate, screenshot con DM o nomi reali. Controllare `git diff` prima di ogni commit.
- Chiedere conferma prima di creare il repo e prima del primo push; poi chiedere se i push su `dev` possono essere automatici. Il push su `main` va sempre annunciato (repo pubblico).
- Selettori e stringhe **solo** nei file `selectors.ts`/`strings.ts`, con data di verifica. Niente classi offuscate. Nessuna rete tranne `update-check`.
- Rispettare i paletti dei test live (§7.3).

## 9. Limitazioni note (da scrivere nel README)
- Funziona **solo dentro Orion**, in una scheda normale del browser. Non funziona in Safari (dove serve un'app di userscript, che sul dispositivo dell'utente non parte) né in icone "web app" della schermata Home. Se apri Instagram da qualsiasi altra parte, non c'è nessun blocco: per questo §4.8 mette Orion come browser predefinito.
- Orion è closed source ed è di un solo fornitore, e il suo supporto alle estensioni su iOS è dichiarato in beta: se Kagi lo rompesse, socialmerd si ferma finché non torna. Lo script però è uno userscript standard, quindi si sposta su qualunque altro ospite compatibile senza riscritture.
- Niente notifiche, niente chiamate, pubblicazione limitata a quello che permette il web (niente musica, adesivi ridotti).
- Instagram e YouTube cambiano spesso il web: servono aggiornamenti; avviso in-script.
- L'estensione si può sempre disattivare da Impostazioni: i blocchi sono attrito, non una gabbia.
- Modifica solo la visualizzazione nel tuo browser (come un adblock): nessuna automazione, nessuna API privata, nessun dato raccolto. Rischio basso ma non nullo rispetto ai termini d'uso di Meta e Google; uso a proprio rischio.

## 10. Salvataggio dopo l'approvazione (lo fa Opus, **nessun codice**)
Nella cartella `C:\Users\Raffa\Desktop\socialmerd\`:
- `CLAUDE.md`: sintesi del progetto + regole §8 + "leggi `docs/PIANO.md` prima di tutto; inizia dalla Fase 1". Viene caricato automaticamente da Sonnet dopo il `/clear`.
- `docs/PIANO.md`: questo piano completo.
- `docs/RICERCA.md`: ricerca con fonti (SocialLite: funzioni, limiti e recensioni; FocusGram, NoReel e FeurStagram; CSP e header di IG; Userscripts iOS -> abbandonata, Stay for Safari; Safari/iOS 26; Greasy Fork; approccio SideStore scartato).
- Memoria persistente: preferenza di lavoro dell'utente (Opus pianifica e fa domande, Sonnet scrive il codice) e puntatore al progetto.
