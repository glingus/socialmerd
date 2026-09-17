# Spike findings — Fase 2

Risultati dello spike sul DOM reale di Instagram e YouTube mobile (docs/PIANO.md §5.2).
Una voce per punto: esito, selettori/URL osservati, data della verifica, screenshot
(sanificato, in `tests/fixtures/`) o riferimento al file raw locale (mai committato).

Come procedere: `npm run e2e:login` (fai login a mano), poi `npm run fixture:capture -- <url> [nome]`
per ogni pagina da ispezionare; controlla sempre `tests/fixtures/<nome>.html` prima di committare.

Stato: **quasi completo** — punti (a)(b)(c)(e)(f)(g)(h)(l)(m)(n)(p) verificati da desktop, (d) e (i) verificati parzialmente. Restano solo (j)(k)(o)(q)(r), che per definizione richiedono l'iPhone reale in Orion (pubblicazione Storia, switcher account, overlay di debug, sonda mondo-pagina, schema `orion://`) — da fare quando l'utente ha tempo di seguirli sul telefono. Il completamento pieno di (d) (swipe al reel successivo, fogli commenti/condivisione) conviene farlo insieme a quei punti, per lo stesso motivo (tap naturale su iPhone invece di Playwright desktop).

> **Nota su privacy delle fixture:** le catture su questo account reale mostrano contenuti personali (storie, notifiche, il proprio profilo, nomi di terzi non pubblici). Per questo, salvo dove specificato, le fixture sanificate **non sono state committate**: restano solo in locale (`tests/fixtures/raw/*.html`, già in `.gitignore`, e alcuni `tests/fixtures/*.html` sanificati ma non aggiunti a git). I risultati qui sotto riportano solo pattern strutturali (selettori, href, aria-label) mai testo libero riconducibile a persone reali. Fixture sanificate e minime per i test DOM automatici andranno scritte a mano nella Fase 3/4, non ricavate da queste catture.

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

- **Esito: confermato, supportato su mobile web.**
- Note: navigando a `/?variant=following` la testata cambia in un header dedicato — freccia indietro (`aria-label="Indietro"`, `href="/"`) + titolo **"Seguiti"** — al posto del titolo "Home". Il feed mostrato conteneva solo post di account seguiti, in ordine cronologico decrescente (`time[datetime]` decrescente), senza alcuna etichetta "Sponsorizzato"/"Suggerito". Non serve quindi la modalità di fallback "ranked" (§4.3) almeno per questo account: si può usare la modalità cronologica diretta. Non ho ancora osservato il comportamento se `variant=following` fosse assente o rifiutato (l'account testato lo accetta sempre).
- Data: 2026-09-17

## (b) Struttura del post (`article`, permalink, `time[datetime]`, sponsorizzato/suggerito, Segui)

- **Esito: confermato, con una correzione importante rispetto al piano.**
- Selettori/pattern osservati:
  - Ogni post è un `<article>` (3 su schermo iniziale prima di scroll).
  - `<time datetime="…Z" title="…">` presente su ogni post, formato ISO 8601 valido per `boundary`/`watermark`.
  - **Permalink nel feed è prefissato dallo username dell'autore**: `href="/<username>/p/<code>/"` per i post normali, `href="/<username>/reel/<code>/"` per i post-reel — **non** `/p/<code>/` bare come assumeva implicitamente il piano. La forma bare (`/p/<code>/`, `/reel/<code>/`) resta comunque valida se visitata direttamente (vedi punto e) e va normalizzata da `routes.ts` con o senza prefisso utente.
  - Nella griglia di **Esplora**, invece, i permalink SONO nella forma bare `href="/p/<code>/"` (nessun prefisso utente) — quindi `routes.ts`/i selettori del feed devono riconoscere entrambe le forme a seconda del contesto.
  - Nessun post sponsorizzato/suggerito è comparso nella prima schermata del feed "Seguiti"; non ho ancora trovato dal vivo l'etichetta esatta "Sponsorizzato" né un post con pulsante "Segui" dentro il feed — pattern da confermare quando ne comparirà uno (i selettori testuali IT/EN restano quelli pianificati, da verificare al primo caso reale).
- Data: 2026-09-17

## (c) Sentinel di caricamento / richieste di paginazione del feed

- **Esito: confermato — con una nota tecnica per §7.3.**
- Note: scrollando il feed "Seguiti", le richieste di paginazione sono POST verso endpoint GraphQL **generici** (`/api/graphql`, `/graphql/query`), usati anche per altre chiamate (badge, cookie, quick-promotion). L'identificatore stabile e specifico della paginazione feed è nel **corpo** della richiesta: `fb_api_req_friendly_name=PolarisFeedRootPaginationCachedQuery_subscribe` (doc_id osservato: `28438382802487766`). **Implicazione per il test live (§7.3):** l'asserzione "nessuna nuova richiesta di paginazione per 30s" deve filtrare per questo `friendly_name` nel post-data, non contare tutte le richieste `/graphql*` (altrimenti falsi positivi da badge/notifiche). Lo userscript stesso non può leggere questo dato (mondo isolato, §3.4) — resta rilevante solo per il test Playwright, non per `feed-limiter.ts`, che deve continuare a basarsi solo sul clip del DOM.
- Data: 2026-09-17

## (d) Reel aperto da un DM (URL, viewer, swipe al successivo, fogli commenti/condivisione)

- **Esito: parzialmente verificato** (thread indicato dall'utente; solo navigazione in lettura, nessun invio/risposta).
- Note: in un thread `/direct/t/<thread_id>/` (URL non collegato allo username, solo un ID numerico), un reel condiviso è renderizzato come **cover statica** (`<img>` verticale ~200×356) il cui URL del CDN contiene il marcatore `efg=…CLIPS…` (base64), sormontata da un'icona SVG con `aria-label`/`title="Clip"`. Sotto la cover compare il link al profilo dell'autore originale del reel (`href="/<username>/"`). **Non è avvolta da un `<a href>`**: l'apertura passa per forza da un handler React lato client, coerente con l'aspettativa del piano (rilevamento nel DOM, non instradabile via URL, §4.2).
  Non sono riuscito a riprodurre il tap sull'anteprima in una sessione successiva per catturare l'URL/viewer che si apre (il messaggio non era nella porzione già renderizzata della lista virtualizzata e lo scroll automatico non l'ha raggiunto in tempi ragionevoli) — **swipe al successivo, comportamento di uscita e fogli commenti/condivisione restano da verificare dal vivo**, ideale da fare insieme al test su iPhone reale (tap naturale, niente virtualizzazione da aggirare).
- Data: 2026-09-17

## (i) Viewer storie (sponsorizzate, pulsante avanti) — *seguito*

- Tentata una ricerca automatica di una storia sponsorizzata: aperta la story tray dalla home e avanzate 25 storie in sequenza (tap sul terzo destro dello schermo) cercando l'etichetta "Sponsorizzato/Sponsored" nel DOM ad ogni passo. **Nessuna storia sponsorizzata incontrata** in questa sessione — normale, la frequenza di inserimento non è garantita e dipende dal targeting pubblicitario dell'account. Non ha senso continuare a cercarla artificialmente: verrà osservata quando capiterà durante l'uso normale (anche nei test iPhone di Fase 7), oppure si può riconoscere lo stesso pattern testuale già usato per i post ("Sponsorizzato"/"Sponsored") come euristica in `stories-ads.ts`, da confermare alla prima occorrenza reale.

## (e) `/reel/<code>/` caricato direttamente

- **Esito: confermato.**
- Note: la pagina resta sull'URL bare `/reel/<code>/` (nessun redirect: `<link rel="canonical" href="https://www.instagram.com/reel/<code>/">`), mentre `og:url` riporta la forma con prefisso utente solo per i social preview. Il viewer è isolato: un solo `<video>` in pagina, controlli Mi piace/Commenta/Condividi/Salva, nessun elemento reel adiacente precaricato visibile nel markup iniziale. Compatibile con l'ipotesi del piano per `reel-lock.ts`.
- Data: 2026-09-17

## (f) Tab reel del profilo

- **Esito: confermato.**
- Note: sull'account personale (senza reel pubblicati) la tab è vuota; su un profilo pubblico con contenuti, la griglia usa `href="/<username>/reel/<code>/"` (stesso pattern del feed, prefissato). Tab del profilo osservate via `aria-label`: **"Post"**, **"Elementi salvati"**, **"Post in cui ti hanno taggato"** (la tab Reel non emette un proprio `aria-label` distinto nello screenshot catturato, va confermata a parte quando un profilo con reel è aperto sulla tab specifica). Trovata anche l'etichetta **"Account simili"** (aria-label) sui profili — corrisponde esattamente al blocco da nascondere per §4.4.
- Data: 2026-09-17

## (g) Barra di navigazione (link e altezza)

- **Esito: confermato.**
- Selettori osservati — barra inferiore, 5 icone via `aria-label`: **"Home"** (`href="/"`), **"Esplora"** (`href="/explore/"`), **"Reels"** (`href="/reels/"`), **"Messaggi"** (`href="/direct/inbox/"`), e il proprio avatar profilo (`href="/<username_loggato>/"`, `alt="Immagine del profilo di <username>"`). Su alcune pagine "Reels" è sostituito/affiancato da **"Notifiche"** (`href="/notifications/"`) nella stessa posizione — la composizione esatta della barra varia leggermente per pagina, da trattare come insieme di `aria-label` riconosciuti più che come 5 posizioni fisse.
- Data: 2026-09-17

## (h) `/explore/` e `/explore/search/`

- **Esito: confermato.**
- Note:
  - `/explore/`: campo di ricerca con `placeholder="Cerca"`/`aria-label="Cerca"`; griglia sotto con celle `aria-label="Reel"` o `aria-label="Carosello"`, permalink in forma **bare** `href="/p/<code>/"` (diversa dal feed, vedi punto b).
  - `/explore/search/` senza query: solo l'input, nessun risultato.
  - Con una query testuale generica digitata: risultati di tipo account (username + eventuale "Seguito da …") — nessun link a `/explore/tags|locations/` in questo caso.
  - Con query **`#hashtag`**: compaiono risultati raggruppati sotto l'etichetta **"Hashtag"**, con `href="/explore/tags/<tag>/"` — conferma il pattern del piano. Non ancora verificati luoghi (`/explore/locations/`) e audio (`/reels/audio/`), da controllare con una query di luogo/audio quando serve.
- Data: 2026-09-17

## (i) Viewer storie (sponsorizzate, pulsante avanti)

- **Esito: parzialmente verificato.**
- Note: navigare direttamente a `/stories/<username>/` mostra prima un **dialogo di conferma** ("Vuoi visualizzare come <tuo_username>? <account> potrà vedere che hai visualizzato la sua storia." + pulsante "Visualizza storia") — comportamento nuovo non previsto dal piano, probabilmente specifico alla navigazione diretta via URL (fuori dal normale tap sulla story tray in home, dove questo dialogo non compare). Dopo conferma, il viewer mostra i controlli attesi (`aria-label="Mi piace"`, `"Direct"`, `"Menu"`, `"Chiudi"`). Non ho trovato un `aria-label="Avanti"` esplicito: l'avanzamento sembra affidato solo al tap sulla metà destra dello schermo (coerente con il fallback già previsto in `stories-ads.ts`). **Non ancora verificato**: l'etichetta esatta di una storia sponsorizzata (serve incontrarne una dal vivo, non forzabile).
- Data: 2026-09-17

## (j) Pubblicazione Storia dal web mobile — *test sull'iPhone dell'utente, in Orion*

- Esito:
- Note:
- Data:

## (k) Switcher account su web mobile — *test sull'iPhone dell'utente*

- Esito:
- Note:
- Data:

## (l) Username loggato

- **Esito: confermato.**
- Selettore osservato: il link dell'avatar profilo nella barra di navigazione inferiore (`href="/<username>/"`, con `alt="Immagine del profilo di <username>"`) — è l'unico link della barra che punta a un profilo anziché a una rotta fissa, quindi identificabile per esclusione (non è uno degli `href` fissi di `/`, `/explore/`, `/reels/`, `/direct/inbox/`, `/notifications/`). Fallback `default` come da piano se non trovato.
- Data: 2026-09-17

## (m) Banner e interstiziali "app"

- **Esito: confermato, con una correzione di sicurezza importante.**
- Note: su più pagine (osservato su `/accounts/activity/`) compare un'interstiziale che copre il contenuto, con **due controlli distinti**: un'icona di chiusura (`aria-label="Chiudi"`, una X) e un pulsante primario **"Usa l'app"**. Il piano parlava genericamente di chiudere con "Non ora" — su questo account il testo del pulsante secondario/dismissivo non è "Non ora" ma la X. **Va da sé ma repetita iuvant:** `app-banners.ts` deve cliccare **solo** l'icona "Chiudi", mai il pulsante "Usa l'app" (che aprirebbe l'app nativa/store, l'opposto dell'obiettivo del progetto). Ho aggiunto questo comportamento anche allo script di spike (`scripts/capture-fixture.mjs`) per le catture successive.
- Data: 2026-09-17

## (n) Suggeriti in attività e profilo

- **Esito: confermato.**
- Note: su `/accounts/activity/` (dopo aver chiuso l'interstiziale del punto m) compare un blocco con intestazione `<h4>` e testo esatto **"Suggeriti per te"**, prima delle notifiche vere e proprie — corrisponde 1:1 al target del piano. Sui profili, l'etichetta osservata è **"Account simili"** (vedi punto f), non "Suggeriti per te" — due stringhe diverse da riconoscere in `strings.ts`, non un'unica etichetta condivisa.
- Data: 2026-09-17

## (o) Timing document-start, GM e navigation API — *test sull'iPhone dell'utente, overlay di debug*

- Esito:
- Note:
- Data:

## (p) m.youtube.com: selettori Shorts e redirect `/shorts` → `/watch`

- **Esito: confermato, con selettori aggiornati rispetto al piano** (YouTube ha cambiato markup dal design assunto in §4.5 — `ytm-reel-shelf-renderer` e `ytm-reel-item-renderer` **non esistono più** nella pagina attuale).
- Selettori osservati (mobile, 2026-09-17):
  - **Scaffale Shorts in home:** wrapper `<ytm-rich-section-renderer class="rich-section-single-column">` → `<grid-shelf-view-model class="ytGridShelfViewModelHost">`. Attenzione: `ytm-rich-section-renderer` è generico (usato per più tipi di scaffale, non solo Shorts) — va nascosto solo quando contiene almeno un `<ytm-shorts-lockup-view-model>` figlio, non incondizionatamente.
  - **Singola card Shorts** (in home, risultati ricerca, canale): tag `<ytm-shorts-lockup-view-model>` (16 istanze trovate in home) — questo selettore del piano è confermato e va tenuto.
  - **Tab Shorts nella barra inferiore:** `<ytm-pivot-bar-item-renderer>` con classe figlia `pivot-shorts` sul div del titolo — non è una classe offuscata (hash), è un nome semantico stabile di YouTube, coerente con la regola "mai classi offuscate".
  - `<ytm-reel-item-renderer>` e `<ytm-reel-shelf-renderer>` dal piano: **non trovati**, da rimuovere/sostituire in `selectors.ts` quando si scrive la Fase 5.
  - **Redirect `/shorts/<id>`:** confermato che **serve** il redirect esplicito — Instagram-style, nessun redirect automatico di YouTube. Navigando direttamente a `/shorts/<id>` la pagina resta su quell'URL (`<link rel="canonical" href=".../shorts/<id>">`) e monta `<ytm-shorts-gesture-overlay-controls>`. `location.replace('/watch?v=' + id)` va quindi implementato come da piano.
  - **Shorts sciolti fuori da uno scaffale dedicato:** nello scaffale misto "Ultime notizie" (`ytm-rich-section-renderer` > `ytm-rich-shelf-renderer`, stesso wrapper generico usato per gli scaffali Shorts ma qui pieno di card `/watch` normali) compaiono anche singole card `/shorts/<id>` nella forma `ytm-video-with-context-renderer > ytm-media-item.big-shorts-singleton > a[href^="/shorts/"]` — niente `ytm-shorts-lockup-view-model`. Vanno nascoste per singola card (`ytm-video-with-context-renderer` più vicino), **mai** l'intero scaffale misto, che contiene anche contenuti legittimi. Scoperta rianalizzando le fixture raw già catturate (`tests/fixtures/raw/yt-home.html`), scritta il 2026-09-18 in preparazione della Fase 5.
- Data: 2026-09-17

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
