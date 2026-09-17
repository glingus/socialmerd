# socialmerd — Ricerca (2026-09-17)

Ricerca fatta da Opus prima della pianificazione. Serve come contesto per chi sviluppa: **le decisioni vincolanti sono in [`PIANO.md`](PIANO.md)**. Fonti in fondo a ogni sezione.

---

## 1. SocialLite (il prodotto da cui prendiamo ispirazione)

**Cos'è:** app iOS e Android (Sociallite LLC) con oltre 1 milione di utenti dichiarati, rating 4.8 su App Store e 4.1 su Play Store. Gratis con abbonamento Pro a circa 3,99 $/mese.

**Come funziona (dalle loro FAQ):** usa le **versioni web** dei social e nasconde gli elementi che creano dipendenza (Reels, Shorts, Esplora). Non modifica le app installate. Il login resta nei cookie sul dispositivo.

**Cosa rimuove:**
- tab Reels e feed Reels
- reel mescolati nel feed
- contenuti algoritmici di Esplora
- post e account suggeriti
- pubblicità e post sponsorizzati
- dirette e shopping
- notifiche di "reel suggeriti"

**Cosa mantiene:**
- DM, gruppi e richieste di messaggi
- post di chi segui e storie
- profili visitati intenzionalmente
- ricerca
- contenuti che gli amici mandano direttamente
- pubblicazione (limitata)

**Reel ricevuti in DM:** si guarda solo quel video, senza poter passare al successivo. Una recensione racconta che tentando di scorrere si viene riportati subito in chat.

**Funzioni iOS:**
- Instagram "pulito" con home solo dei seguiti
- fino a 10 account
- blocco delle app native tramite Screen Time, con "Post Mode" che sblocca l'app ufficiale per 5 minuti
- nav bar nativa a 5 tab (v2.1.0)
- Sleep Mode, contatore del tempo in app e schermata iniziale con il tempo speso
- dalla v3.1.0 (lug 2026): Reddit, haptics, multi-account, funzioni di posting

**Funzioni Android:** Accessibility Service per rilevare l'app in primo piano e applicare i limiti; blocco opzionale dei contenuti per adulti tramite VPN.

**Piattaforme:** Instagram e YouTube complete; Snapchat, TikTok, Facebook, X, LinkedIn e Reddit in beta.

**Modalità genitori:** codice di collegamento, dashboard, limiti impostati dal telefono del genitore.

**Limitazioni dichiarate** (pagina Limitations):
- nessuna notifica
- DM: niente foto "visualizza una volta" e niente invio di video
- niente sondaggi nelle storie
- musica non supportata
- niente chiamate
- strumenti creator limitati
- posting limitato: niente storie Amici più stretti, niente Reels, repost parziali

**Recensioni (utile per i nostri criteri di accettazione):**
- **Positive:** il reel ricevuto non porta al successivo; il feed "finito" solo di seguiti in ordine cronologico elimina il loop; le versioni gratuite funzionano.
- **Negative:**
  - lento e "clunky", soprattutto su Android
  - pubblicare (storie e post) è difficile o impossibile
  - mancano le notifiche DM
  - su iPhone 16 una chat non caricava e non si potevano scrivere messaggi a persone nuove → **nei nostri test i DM devono caricarsi e deve essere possibile iniziare una chat nuova**
  - su Android serve l'abbonamento per quasi tutto

Fonti: [sociallite.app](https://sociallite.app/) · [Instagram without Reels](https://sociallite.app/instagram-without-reels) · [How to remove Reels](https://sociallite.app/how-to-remove-reels-from-instagram) · [Keep DMs, block Reels](https://sociallite.app/keep-dms-block-reels) · [Stop endless scrolling](https://sociallite.app/how-to-stop-endless-scrolling-on-social-media) · [For iPhone](https://sociallite.app/for-apple) · [FAQ](https://sociallite.app/faq) · [Limitations](https://sociallite.app/limitations) · [Privacy & Security](https://sociallite.app/privacy-and-security) · [Parents](https://sociallite.app/parents) · [App Store](https://apps.apple.com/us/app/sociallite-block-reels-shorts/id6757661674) · [Google Play](https://play.google.com/store/apps/details?id=com.sociallite.android)

---

## 2. Progetti open source analizzati (solo ispirazione: NON copiare codice, licenze AGPL/GPL)

### FocusGram — Flutter + `flutter_inappwebview`, Android, AGPL-3.0 ([repo](https://github.com/Ujwal223/FocusGram))
Tecniche osservate nel sorgente (giugno 2026):
- **Regole URL:** blocca la radice `/reels` ma consente `/reel/<shortcode>/` (reel singolo da DM) e i domini esterni ([NavigationGuard](https://github.com/Ujwal223/FocusGram/blob/main/lib/services/navigation_guard.dart)).
- **Rilevamento navigazione SPA:** hook di `history.pushState`/`replaceState` e polling del path ogni 500 ms. Per noi solo il polling, perché siamo nel content world.
- **Lock dello scroll dei reel in DM** ([content_disabling.dart](https://github.com/Ujwal223/FocusGram/blob/main/lib/scripts/content_disabling.dart), [core_injection.dart](https://github.com/Ujwal223/FocusGram/blob/main/lib/scripts/core_injection.dart)):
  - `touchmove` in cattura con `preventDefault`, tranne dentro dialog, menu e input
  - `wheel` e tasti freccia/PagSu/PagGiù bloccati
  - `overflow:hidden` su html e body
  - circa 3,5 s di buffer prima di considerare "caricato" il primo reel
  - il viewer reel in DM viene cercato con `[class*="ReelsVideoPlayer"]`, **da verificare**
- **Player isolato:** una WebView separata e "Locked" per il reel aperto da DM, con lo stesso script di lock.
- **Tab nascoste:** `a[href="/reels/"]`, `a[href="/explore/"]`, `a[href*="/shop"]`.
- **Reel nel feed:** gli `article` vengono **rimossi** dal DOM, non nascosti con `display:none`, per evitare buchi dovuti allo scroll virtualizzato. Noi preferiamo clip e nascondimento controllato + segnaposto: verificare nello spike.
- **Suggeriti e sponsorizzati:** riconosciuti dal testo ("Suggested for you", "Sponsored", "Paid partnership"). Noi **non** nascondiamo le partnership pubblicizzate di account seguiti.
- **Intercettazione di fetch/XHR** con filtro del JSON GraphQL (`is_ad`, `is_suggested`, `media_type === 2`, `clips_metadata`): richiede il mondo pagina, **non applicabile** al nostro userscript content-world.
- **User agent iOS Safari usato anche su Android:** `Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1`.
- **Badge DM:** il titolo della pagina `(N)` e i badge rossi indicano i non letti.
- **Extra fuori scopo per noi:** blocco degli endpoint "seen" (ghost mode), grayscale, app lock, sessioni reel a tempo.

### NoReel — Kotlin WebView, Android ([repo](https://github.com/Kalbra/NoReel))
- Home `/` → `/?variant=following` (feed solo seguiti).
- L'icona Esplora porta a `/explore/search/` (solo ricerca).
- Barra storie `div[data-pagelet="story_tray"]` (probabilmente datato).
- **Anti-pattern da evitare:** classi CSS offuscate e iniezione JS ripetuta ogni 200 ms.
- **Idea:** scaricare lo script di iniezione da GitHub raw per aggiornare i selettori senza reinstallare. Noi otteniamo lo stesso con gli aggiornamenti dello userscript.

### FeurStagram / InstaFree — patch dell'APK ufficiale Android, GPL-3.0 ([FeurStagram](https://github.com/jean-voila/FeurStagram), [InstaFree](https://github.com/Y0lan/instafree))
- Bloccano a livello di rete `/feed/timeline/`, `/clips/home/`, `/clips/discover/`, `/discover/topical_explore` e ads; forzano il feed "following" riscrivendo `pagination_source`; mantengono notifiche, DM, storie e posting.
- **Scartato:** solo Android, va riapplicato a ogni aggiornamento di IG e modifica il binario di Meta. L'utente vuole iPhone e l'approccio web.

### Altri
[antigram-extension](https://github.com/aymyo/antigram-extension), [instagram-distraction-free-js](https://github.com/highda/instagram-distraction-free-js), [reel-blocker](https://github.com/BrendanGho/reel-blocker), [FocusTube](https://github.com/malekwael229/FocusTube), [Instagram-DM-Reel-Viewer-Extension](https://github.com/lmBored/Instagram-DM-Reel-Viewer-Extension) (conferma che sul web, aprendo un reel dai DM, poi compaiono reel suggeriti casuali).

---

## 3. Instagram web: fatti tecnici

**Header di sicurezza** (catturati il 2026-09-17 su `/accounts/login/` con UA iPhone):
- `X-Frame-Options: DENY` → niente iframe.
- CSP `script-src`: `*.instagram.com`, `static.cdninstagram.com`, `blob:`, `*.facebook.com`, `*.fbcdn.net`, `'nonce-…'`, `'self'`, `'wasm-unsafe-eval'` e **nessun `'unsafe-inline'`**. Quindi niente script inline iniettati in pagina e bookmarklet inaffidabili.
- CSP `style-src` include `'unsafe-inline'` → gli `<style>` iniettati funzionano.
- `connect-src` include `wss://edge-chat.instagram.com` (chat in tempo reale).

**Altri fatti:**
- **Feed cronologico solo seguiti:** `https://www.instagram.com/?variant=following`, più `?variant=favorites`. Documentati per il web; **supporto sul layout mobile da verificare** (spike).
- **Chat E2EE:** chiuse l'8 maggio 2026, quindi tutti i DM tornano chat standard (utile, perché le chat E2EE erano problematiche sul web).
- **Redesign navigazione (feb–mar 2026, app):** Reels al centro. Il layout web mobile va verificato dal vivo.
- **Pubblicazione storie dal web mobile:** fonti discordanti. Dal 2017 esisteva la creazione storie (foto) dal web mobile; alcune guide 2026 dicono che con UA iOS Safari il "+" propone "Storia", altre che il web mobile è "sola lettura". **Da verificare sull'iPhone** (spike j).
- **Multi-account:** lo switcher di Instagram supporta fino a 5 account, anche dal web ("Cambia account"). Il supporto sul layout mobile va verificato (spike k).
- **Non supportati sul web:** chiamate audio/video, foto "visualizza una volta", sondaggi nelle storie, musica; la creazione di contenuti ha strumenti ridotti.

Fonti: [How-To Geek: variant=following](https://www.howtogeek.com/instagram-for-web-still-has-a-chronological-feedif-you-know-how-to-find-it/) · [giovanniperilli.com (Mosseri, following feed 2026)](https://giovanniperilli.com/en/blog/instagram-feed-following-instagram-is-not-removing-the-chronological-feed-but-visibility-now-works-differently/) · [PPC Land: fine E2EE 8 maggio 2026](https://ppc.land/instagram-is-killing-its-end-to-end-encrypted-chats-heres-what-changes-may-8/) · [Storrito: redesign navigazione 2026](https://storrito.com/resources/what-instagrams-navigation-redesign-actually-changed/) · [Alphr: storie da computer](https://www.alphr.com/post-instagram-story-from-computer/) · [TechCrunch 2017: storie su web mobile](https://techcrunch.com/2017/11/16/instagram-stories-mobile-web) · [posteverywhere.ai: posting da desktop 2026](https://posteverywhere.ai/blog/how-to-post-to-instagram-from-desktop) · [send.win: account multipli nel browser](https://blog.send.win/how-to-log-in-to-multiple-instagram-accounts-in-your-browser-easily/)

---

## 4. iPhone senza account sviluppatore: opzioni valutate

| Opzione | Esito | Motivo |
|---|---|---|
| Webapp/PWA separata (es. GitHub Pages) | ❌ | CORS: un'altra origine non legge i dati di instagram.com; niente API pubbliche per feed/DM (la Basic Display API è deprecata) |
| Webapp con **proxy** server | ❌ | Credenziali e sessioni passano dal server; IG blocca/verifica gli IP da datacenter; websocket DM e media fragili |
| Bookmarklet | ❌ | La CSP con nonce lo blocca su Safari |
| Estensione Safari propria | ❌ | Per pubblicarla serve l'Apple Developer Program (99 $/anno) |
| App "Userscripts" (quoid) + nostro userscript | ⚠️ scelta poi abbandonata (2026-09-17) | Estensione non attivabile su iOS 26 dell'utente, bug noto non risolto — vedi §4.1 |
| **App "Stay for Safari" + nostro userscript** | ✅ scelta attuale | Gratis, open source (MPL), stesse API GM.*/metadati di Userscripts — vedi §4.1 |
| App iOS WebView con SideStore/AltStore (Apple ID gratuito) | ⚠️ scartata | Scade ogni 7 giorni, massimo 3 app, circa 10 App ID a settimana, setup complesso; si può compilare un IPA non firmato con GitHub Actions (runner macOS), ma lo sviluppo da Windows è lento |
| Comandi Rapidi "quando si apre Instagram → apri Safari" | Scartata dall'utente | Utile per tenere l'app solo per le notifiche; l'utente preferisce disinstallare le app. Nota: con i limiti di Tempo di utilizzo iOS le notifiche si fermano |

**Userscripts (quoid):**
- **Metadati supportati:** `@run-at document-start`, `@inject-into auto|content|page` (le API GM **solo** con `content`), `@match`/`@exclude-match`, `@include`/`@exclude`, `@require`, `@grant`, `@updateURL`/`@downloadURL`/`@version`, `@weight`, `@noframes`.
- **API GM:** `GM.getValue/setValue/deleteValue/listValues`, `GM.addStyle`, `GM.xmlHttpRequest`, `GM.openInTab` e altre; `GM.info` sempre disponibile.
- **Installazione su iOS:** aprire in Safari un URL il cui **path finisce con `.user.js`** → aprire il popup dell'estensione → prompt "Install".
- **Se la CSP blocca l'iniezione:** usare `@inject-into content` o `auto`.
- **Release:** v4.8.6 stabile (gen 2026, App Store); v5.0.0 in beta su TestFlight.
- **Aggiornamenti:** a dicembre 2025 il controllo automatico degli aggiornamenti è stato **disattivato temporaneamente** (PR "temporarily disable auto scripts update check") e l'issue "Improve scripts automatic update logic" è aperta → da qui il nostro `update-check` giornaliero in-script.
- **Issue #960** (set 2026): "script non caricati su iPad", probabilmente dovuta al popup che mostra solo gli script che corrispondono alla pagina. Da tenere d'occhio.

**Safari su iOS 26:**
- Le estensioni **non girano nelle webapp aggiunte alla Home**. Su iOS 26 ogni sito aggiunto alla Home si apre come web app per default: bisogna **disattivare "Apri come web app"** per avere un'icona che apre Safari.
- I **Profili Safari** (iOS 17+) hanno cookie separati e le estensioni si attivano per profilo (alternativa multi-account non scelta).

Fonti: [Userscripts su App Store](https://apps.apple.com/us/app/userscripts/id1463298887) · [quoid/userscripts README](https://github.com/quoid/userscripts/blob/main/README.md) · [Releases](https://github.com/quoid/userscripts/releases) · [Issue #960](https://github.com/quoid/userscripts/issues/960) · [Apple Dev Forums: estensioni in standalone](https://developer.apple.com/forums/thread/715634) · [Apple Dev Forums: web extensions e Home Screen](https://developer.apple.com/forums/thread/725178) · [iDB: iOS 26 web app dalla Home](https://www.idownloadblog.com/2025/06/17/apple-ios-26-safari-web-apps-home-screen-bookmarks/) · [MacRumors: iOS 26 web app o segnalibro](https://www.macrumors.com/how-to/save-safari-bookmark-web-app-iphone-home-screen/) · [MacRumors: Profili Safari](https://www.macrumors.com/how-to/separate-iphone-browsing-habits-safari-profiles/) · [builds.io: SideStore 2026](https://builds.io/blog/technologies/ios-technologies/sidestore-live-container-guide-2026-free-sideloading/) · [SideStore FAQ](https://docs.sidestore.io/docs/faq) · [Bookmarklet e CSP](https://socradar.io/csp-bypass-unveiled-the-hidden-threat-of-bookmarklets/) · [Apple Community: limiti app e notifiche](https://discussions.apple.com/thread/254986942) · [Apple: automazioni Comandi Rapidi](https://support.apple.com/guide/shortcuts/intro-to-personal-automation-apd690170742/ios)

### 4.1 Aggiornamento 2026-09-17: Userscripts abbandonata, si passa a Stay for Safari

Sul dispositivo dell'utente (iPhone, iOS 26) l'estensione Userscripts non si attivava in Impostazioni → Safari → Estensioni (nessuna Content & Privacy Restriction attiva). Contattato il supporto Apple: nessuna soluzione (previsibile, e' un problema lato app di terze parti, non di sistema).

**Verifica fatta prima di decidere:**
- Il sintomo ("estensione che non appare/non si attiva") e' un bug ricorrente e documentato di questa app, gia' capitato su iOS precedenti dopo aggiornamenti (es. [issue #193](https://github.com/quoid/userscripts/issues/193): "UserScripts 4.0.9 upgrade caused the extension to disappear from Safari"), oltre a bug simili di registrazione delle estensioni Safari riportati da altri sviluppatori su piu' versioni di iOS (17.4, 18.3) nei forum Apple.
- Esiste un issue apertissimo specifico per iOS 26 ([issue #960](https://github.com/quoid/userscripts/issues/960), 4 settembre 2026): script che non partono su iPadOS 26.5.2 nonostante l'estensione sembri attiva — gia' segnalato come "da tenere d'occhio" nella ricerca originale (§4 sopra). Nessuna risposta dei maintainer al momento, nessuna causa confermata.
- L'ultima release stabile e' di gennaio 2026, l'ultima beta di maggio 2026 — **prima** del rilascio di iOS 26: l'app potrebbe semplicemente non aver ancora recuperato compatibilita' con qualcosa che Apple ha cambiato in Safari.

**Alternativa scelta: Stay for Safari** ([shenruisi/Stay](https://github.com/shenruisi/Stay), App Store: [Stay for Safari](https://apps.apple.com/us/app/stay-for-safari/id1591620171)):
- Open source, licenza **MPL** (Mozilla Public License).
- Gratis con IAP opzionale ($4.99 one-time) per funzioni che non usiamo (sync self-hosted, adblock custom, download manager); l'esecuzione di userscript e' nel livello gratuito.
- **API GM implementate:** `GM_setValue`/`GM.setValue`, `GM_getValue`/`GM.getValue`, `GM_deleteValue`/`GM.deleteValue`, `GM_listValues`/`GM.listValues`, `GM_xmlhttpRequest`/`GM.xmlHttpRequest`, `GM_addStyle`, `GM_registerMenuCommand`, `GM_info`/`GM.info`, `unsafeWindow`. Non implementate (concesse ma inerti): `GM_notification`, `window.onurlchange` — non ci servono.
- **Metadati supportati:** `@name` (localizzato), `@namespace`, `@version`, `@description` (localizzato), `@homepage`, `@updateURL`, `@downloadURL`, `@supportURL`, `@include`/`@match`/`@exclude`, `@require`, `@resource`, `@run-at`, `@grant`, `@noframes`. Tutti i tag che usiamo gia' sono coperti; nessun cambio al codice, solo alle istruzioni di installazione (README).
- **Metodi di importazione:** "Write script | Link | GreasyFork | Local file" — presumibilmente "Link" per il nostro URL raw `.user.js`; il flusso esatto va confermato e documentato nella Fase 1/2 (vedi `docs/spike-findings.md`).
- Non e' emerso nulla sulla stabilita' del suo auto-update da `@updateURL`/`@downloadURL`: teniamo comunque il nostro `update-check.ts` giornaliero in-script, indipendente dall'app ospite.

Fonti: [quoid/userscripts issue #193](https://github.com/quoid/userscripts/issues/193) · [quoid/userscripts issue #960](https://github.com/quoid/userscripts/issues/960) · [quoid/userscripts releases](https://github.com/quoid/userscripts/releases) · [Apple Dev Forums: estensione che appare/scompare su iPad, iOS 18.3](https://developer.apple.com/forums/thread/775772) · [Apple Dev Forums: estensioni Safari rotte su iOS 17.4](https://developer.apple.com/forums/thread/750458) · [shenruisi/Stay README](https://github.com/shenruisi/Stay/blob/main/README-EN.md) · [Stay for Safari su App Store](https://apps.apple.com/us/app/stay-for-safari/id1591620171)

---

## 5. YouTube Shorts
- Approcci noti: nascondere i renderer Shorts e reindirizzare `/shorts/<id>` → `/watch?v=<id>` (esistono script che lo fanno anche su `m.youtube.com`).
- Elementi mobili da verificare nello spike: `ytm-reel-shelf-renderer`, `ytm-shorts-lockup-view-model(-v2)`, `ytm-reel-item-renderer`, `ytm-pivot-bar-item-renderer` (tab Shorts), chip "Shorts", tab Shorts dei canali, link `a[href^="/shorts/"]`.

Fonti: [yt-anti-shorts](https://github.com/YukisCoffee/yt-anti-shorts) · [JohnVea/YouTube-Userscript-Extentions](https://github.com/JohnVea/YouTube-Userscript-Extentions) · [Gist redirect /shorts](https://gist.github.com/lbmaian/c53f48e04a3303d059c042f779a82604) · [No-YouTube-Shorts-Safari](https://github.com/Guillaume351/No-YouTube-Shorts-Safari) · [Greasy Fork: Hide YouTube Shorts](https://greasyfork.org/en/scripts/437345-hide-youtube-shorts)

---

## 6. Greasy Fork
- Codice **non minificato e non offuscato** (anche i bundle devono mantenere spazi e nomi).
- `@license` e descrizione chiara obbligatori.
- Eventuali "antifeature" (tracciamento, ads) vanno dichiarate: noi non ne abbiamo.
- Controllo aggiornamenti **al massimo una volta al giorno**.
- Librerie preferibilmente via `@require`: noi non ne usiamo.
- La sincronizzazione da URL (raw GitHub) si configura dal pannello dello script su Greasy Fork: la fa l'utente.

Fonte: [Greasy Fork code rules](https://greasyfork.org/en/help/code-rules)

---

## 7. Note per sviluppo e test
- **Ambiente PC (2026-09-17):**
  - disponibili: Node 24.16, npm 12, Git 2.55, VS Code, Chrome ed Edge
  - gh CLI loggato come `glingus` (scope `repo`, `gist`, `read:org`)
  - **non** disponibili: JDK moderno (solo Java 8), Android SDK, iCloud Drive
- **Playwright:** usare `channel: 'chrome'` (codec H.264 per i video di IG; il Chromium di Playwright non li ha) con `devices['iPhone 15']`. `addInitScript` gira nel mondo pagina e ignora la CSP, quindi i problemi di CSP e iniezione si vedono **solo** sull'iPhone.
- **Link di installazione:** `raw.githubusercontent.com` (path che finisce in `.user.js`, cache di circa 5 min). I download delle Release GitHub fanno redirect verso URL che non finiscono in `.user.js`.
- **Wrapper nativo futuro (non in v1), riferimenti Android WebView:**
  - `WebViewCompat.addDocumentStartJavaScript` (script prima della pagina, con origini consentite)
  - `addWebMessageListener`
  - `ProfileStore`/`setProfile` (cookie separati per account)
  - Il WebView non supporta Web Push.
  - Fonti: [androidx.webkit releases](https://developer.android.com/jetpack/androidx/releases/webkit) · [ProfileStore](https://developer.android.com/reference/androidx/webkit/ProfileStore)
