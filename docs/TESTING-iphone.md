# Checklist di test su iPhone (Orion + Tampermonkey)

Checklist da eseguire **a mano sul telefono**, con l'account principale dell'utente.
Copre gli scenari live di `PIANO.md` §7.3/§7.4 più i punti dello spike (Fase 2) rimasti aperti perché richiedono
per forza l'iPhone reale: (d) completamento, (i) storia sponsorizzata se capita, (j), (k), (o), (q), (r).

Regole valide per tutta la sessione (`CLAUDE.md`):
- Solo navigazione in lettura dove non specificato altrimenti: **mai** commenti/messaggi/pubblicazioni non voluti.
- Se compare un checkpoint/challenge/richiesta di login inattesa: fermati e segnalalo, non proseguire.
- Segna qui sotto esito e data per ogni punto; per i selettori nuovi/rotti, aggiorna `docs/spike-findings.md`.

## 0. Prerequisiti (già verificati il 2026-09-17, non ripetere)
- [x] Orion installato, Tampermonkey installato, script aggiornato dal link raw `dev`.
- [x] Badge Fase 1 visto su Instagram e YouTube (test ormai superato dal codice reale delle Fasi 4-6).

## 1. Instagram — rotte e blocchi (`PIANO.md` §7.3)
- [ ] Apri `instagram.com` da zero → atterri sul feed "Seguiti" (`?variant=following`), non sulla Home normale.
- [ ] Nessun link "Reels" visibile in nessuna barra di navigazione.
- [ ] Tocca `/reels/` (se raggiungibile da un link residuo) → ritorno silenzioso, nessun flash del feed reel.
- [ ] Un post-reel nel feed mostra il segnaposto (copertina statica, @nome, data, didascalia, "Guarda reel") invece del reel autoplay.
- [ ] Tocca "Guarda reel" dal segnaposto → player isolato (`/reel/<code>/`); prova a scorrere/swipare verso un altro reel → **nessun secondo reel visibile**, torni al feed (origine).
- [ ] Nel player isolato: like, commento (se vuoi scrivere davvero un commento tuo), audio funzionano normalmente.
- [ ] `/explore/` mostra solo la ricerca, griglia nascosta; una query hashtag `#...` mostra risultati, tocca `/explore/tags/...` → ritorno silenzioso.
- [ ] Scorri il feed "Seguiti" fino alla card "Sei in pari" → nessun altro post carica dopo, nessuno scroll infinito.
- [ ] Riapri l'app/lo script dopo la card "Sei in pari": il feed riparte dal watermark salvato, non rimostra tutto da capo.
- [ ] Apri un thread DM con un reel condiviso (**tu decidi quale**, sola lettura) → si apre in modo isolato, nessuno swipe al reel successivo.
- [ ] `/accounts/activity/` → blocco "Suggeriti per te" nascosto; interstiziale "Usa l'app" chiusa solo con la X, mai con "Usa l'app".
- [ ] Un profilo pubblico (non seguito) → tab Reel visibile e invariata, "Account simili" nascosto.

## 2. Instagram — punti spike ancora aperti
- [ ] **(d) Reel da DM, completamento**: apri un reel condiviso, prova swipe verso il successivo, apri il foglio commenti, apri il foglio condivisione, chiudi normalmente. Annota in `spike-findings.md` punto (d): cosa succede esattamente in ciascun caso.
- [ ] **(i) Storia sponsorizzata**: se ne capita una durante l'uso normale, annota l'etichetta esatta vista e se `stories-ads.ts` l'ha saltata correttamente (max 3 tentativi, nessun loop).
- [ ] **(j) Pubblicazione Storia dal web mobile**: prova a pubblicare una Storia (contenuto a scelta) sia con lo script **attivo** sia **disattivo** in Tampermonkey. Deve funzionare in entrambi i casi (fail-open sul flusso Crea → Storia).
- [ ] **(k) Switcher account**: se hai più account Instagram, cambia account dallo switcher nativo. Verifica che il feed/watermark siano salvati **per account** (non mescolati).
- [ ] **(o) Timing e API nel content world**: apri il pannello (tocca la pillola) → 5 tap sul numero di versione in "Info" → overlay di debug. Controlla: `GM: true`, `typeof unsafeWindow` (atteso `undefined`), `navigation API` presente o no. Annota tutto in `spike-findings.md` punto (o) e (q).
- [ ] **(r) Comando Rapido `orion://open-url?...`**: crea il Comando Rapido di `PIANO.md` §4.8 variante 1. Se non apre Orion sulla pagina giusta, passa alla variante 2 (Orion browser predefinito) e correggi `PIANO.md` §4.8 + `README.md`.

## 3. YouTube (`PIANO.md` §7.3)
- [ ] Home `m.youtube.com` → nessuno scaffale Shorts visibile, nessuna card Shorts sciolta in altri scaffali (es. "Ultime notizie").
- [ ] Tab "Shorts" nella barra in basso → nascosta.
- [ ] Apri direttamente un link `/shorts/<id>` (es. da una chat) → redirect immediato a `/watch?v=<id>`, nessun rimbalzo visibile sullo schermo Shorts.
- [ ] Home, autoplay, video correlati, ricerca → tutto invariato rispetto a YouTube normale.

## 4. Statistiche e UI (Fase 6, mai vista dal vivo prima d'ora)
- [ ] La pillola compare in basso a destra, sopra la barra di navigazione, leggibile sia su Instagram che YouTube.
- [ ] **Verifica l'offset**: la pillola non deve sovrapporsi alla barra di navigazione native né essere tagliata dalla safe area. Se la posizione è sbagliata, correggi la costante in `src/core/ui/pill.ts` (commento `TODO` già presente) e segna qui la posizione corretta misurata.
- [ ] La pillola **sparisce** su: DM aperta (`/direct/t/...`), storie, player reel isolato, `/create/*`, `/accounts/*`.
- [ ] Su YouTube, la pillola sparisce quando il video va a schermo intero. **Verifica questo punto in particolare**: `isFullscreenVideo()` in `src/main.ts` usa `document.fullscreenElement`, mai testato su iOS/Orion — se non sparisce, va cambiato l'euristica (commento `TODO` nel file).
- [ ] Tocca la pillola → si apre il pannello: sezioni Oggi, Ultimi 7 giorni (barre IG/YT), Blocchi scattati, Impostazioni, Info — tutte popolate con numeri sensati.
- [ ] Impostazioni: disattiva/riattiva la pillola, cambia lingua Auto/IT/EN (l'interfaccia deve cambiare lingua subito), disattiva/riattiva il controllo aggiornamenti.
- [ ] "Azzera statistiche" → chiede conferma, poi azzera davvero (Oggi e 7 giorni tornano a 0).
- [ ] Tema chiaro/scuro: cambia l'aspetto di Orion/iOS e verifica che pillola e pannello si adattino (`prefers-color-scheme`).
- [ ] Al primo avvio su un profilo pulito (o cancellando `smd:v1:welcomeShown` dall'overlay di debug/storage), compare la schermata di benvenuto con l'elenco dei blocchi e i consigli §4.8.
- [ ] Controllo aggiornamenti: se c'è una versione più nuova su `dev`/`main`, entro 24h compare il pallino sulla pillola e la voce "Aggiornamento disponibile" nel pannello.

## 5. Permessi estensione
- [ ] In Tampermonkey, verifica che i permessi richiesti dallo script (`@match`, `@connect raw.githubusercontent.com`) siano quelli attesi, nessun permesso extra comparso a sorpresa.

---

Dopo aver completato la checklist: aggiorna le spunte delle fasi in `PIANO.md`, riporta le scoperte nuove in `docs/spike-findings.md`, e segnala qui sotto eventuali problemi trovati perché vengano sistemati prima della release v1.0.0.

## Problemi trovati durante il test

_(vuoto finora)_
