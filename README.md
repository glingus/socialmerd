# socialmerd

A free, open-source userscript that makes **Instagram web** and **YouTube** less "addictive" on **iPhone**, running in the free [Orion browser](https://orionbrowser.com/) with [Tampermonkey](https://www.tampermonkey.net/).

- **Instagram:** no Reels tab (reels received in DMs still play, one at a time), no suggested content or Explore grid, Home feed limited to accounts you follow with a "You're all caught up" stop.
- **YouTube:** no Shorts.
- **Extra:** a small usage-time counter and stats panel.

Inspired by [SocialLite](https://sociallite.app). License: GPL-3.0-or-later.

> ⚠️ Status: early scaffold. Fase 1 of the project plan is done — installing and running the script is verified on a real iPhone — but the actual blocking features aren't built yet. Not usable.

## Install (iOS 26)

1. Install **[Orion Browser by Kagi](https://apps.apple.com/us/app/orion-browser-by-kagi/id1484498200)** from the App Store. It's free, and extensions are not behind the Orion+ paywall.
2. Install **Tampermonkey** in Orion. Either way works:
   - in Orion, tap **•••** (bottom right) → **Extensions** → **+**, or
   - open **[Tampermonkey on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/tampermonkey/)** in Orion and install from there.

   ⚠️ **The Chrome Web Store answers "available only on desktop" when you open it from an iPhone.** Use Firefox Add-ons, or turn on Orion's desktop mode first.
3. Open this raw link **in Orion**. Tampermonkey shows an "Installing script" screen — tap **Install**:
   - Stable: `https://raw.githubusercontent.com/glingus/socialmerd/main/dist/socialmerd.user.js`
4. Give yourself a Home Screen icon. Third-party browsers can't create one — that's a Safari-only feature — so use the **Shortcuts** app instead:
   - Shortcuts → new shortcut → **Open URL** → `orion://open-url?url=https://www.instagram.com/?variant=following`
   - share menu → **Add to Home Screen**, then pick a name and an icon
   - if the `orion://` scheme doesn't work on your device, set Orion as your default browser (next step) and use the plain `https://www.instagram.com/?variant=following` URL instead
5. **Set Orion as your default browser** (Settings → Apps → Orion → Default Browser App). Otherwise an Instagram link tapped inside another app opens in Safari, where none of this runs.
6. Uninstall the official Instagram/YouTube apps if you want no other way back in.

If Tampermonkey gives you trouble, these also manage userscripts in Orion: [Violentmonkey](https://addons.mozilla.org/firefox/addon/violentmonkey/), [ScriptCat](https://addons.mozilla.org/firefox/addon/scriptcat/), or OrangeMonkey (Chrome Web Store only).

Note: GitHub's raw file host caches for a few minutes, so a freshly published update can take a little while to show up.

## Why Orion and not Safari

This is a plain userscript, so it will also run under Safari userscript apps like [Userscripts](https://github.com/quoid/userscripts) or [Stay](https://github.com/shenruisi/Stay) — **if Safari extensions work on your device**. On the author's iPhone (iOS 26) they don't: three different extensions, Grammarly included, refuse to activate, with Screen Time restrictions and configuration profiles ruled out and no help from Apple support. That device's Safari extension subsystem is simply broken.

Orion sidesteps the problem: it implements WebExtensions itself on top of WKWebView, so it never touches Apple's Safari extension machinery. It's still WebKit underneath, so Instagram and YouTube render exactly as they do in Safari. Details in [`docs/RICERCA.md`](docs/RICERCA.md) §4.2.

## Why a userscript (and not an app)

A regular website can't read or modify instagram.com from the browser (CORS), Instagram sends `X-Frame-Options: DENY`, its CSP blocks bookmarklets, and there's no public feed/DM API anymore. A proxy would have to see your credentials, which is unacceptable. A native iOS app would need a paid Apple Developer account, or sideloading that expires every 7 days. A userscript running client-side inside a browser avoids all of that: no server, no expiry, no cost.

## Limitations

- Only works inside Orion, in a normal browser tab. Open Instagram anywhere else and nothing is blocked — which is why the default-browser step matters.
- Orion is closed source and single-vendor, and its iOS extension support is officially beta. If it breaks, socialmerd stops until it's fixed. The script itself is a standard userscript, so it moves to any other compatible host without a rewrite.
- No notifications, no calls; publishing is limited to whatever the mobile web UI supports.
- Instagram and YouTube change their web UI often; selectors can break and need updates (see the in-script update check).
- Tampermonkey can always be turned off — this is friction, not a cage.
- Only changes how the page renders in your own browser (like an ad blocker): no automation, no private APIs, no data collected. Low but non-zero risk with respect to Meta/Google's terms of use — use at your own risk.

## Contributing

See [`docs/PIANO.md`](docs/PIANO.md) for the project plan and architecture, and [`docs/RICERCA.md`](docs/RICERCA.md) for background research. Selector/string breakage reports are welcome via GitHub Issues.

---

## In italiano

**socialmerd** è uno userscript gratuito e open source che rende **Instagram web** e **YouTube** meno "da dipendenza" su **iPhone**, dentro il browser gratuito [Orion](https://orionbrowser.com/) con [Tampermonkey](https://www.tampermonkey.net/).

- **Instagram:** niente tab Reel (i reel ricevuti in DM si guardano comunque, uno alla volta), niente contenuti suggeriti né griglia Esplora, feed Home limitato a chi segui con uno stop "Sei in pari".
- **YouTube:** niente Shorts.
- **Extra:** contatore del tempo d'uso e pannello statistiche.

Ispirato a [SocialLite](https://sociallite.app). Licenza: GPL-3.0-or-later.

> ⚠️ Stato: scaffold iniziale. La Fase 1 del piano è completata — installazione ed esecuzione verificate su un iPhone vero — ma i blocchi veri e propri non ci sono ancora. Non ancora utilizzabile.

### Installazione (iOS 26)

1. Installa **[Orion Browser by Kagi](https://apps.apple.com/us/app/orion-browser-by-kagi/id1484498200)** dall'App Store. È gratis e le estensioni non sono a pagamento.
2. Installa **Tampermonkey** dentro Orion: **•••** in basso a destra → **Extensions** → **+**, oppure apri in Orion [Tampermonkey su Firefox Add-ons](https://addons.mozilla.org/it/firefox/addon/tampermonkey/).

   ⚠️ **Il Chrome Web Store da iPhone risponde "disponibile solo da computer".** Usa Firefox Add-ons, o attiva prima la modalità desktop di Orion.
3. Apri **in Orion** il link raw `https://raw.githubusercontent.com/glingus/socialmerd/main/dist/socialmerd.user.js` → Tampermonkey mostra "Installing script" → **Install**.
4. Fatti l'icona sulla schermata Home. I browser di terze parti non possono crearla (è una funzione riservata a Safari), quindi passa dai **Comandi Rapidi**: nuovo comando → **Apri URL** → `orion://open-url?url=https://www.instagram.com/?variant=following` → menu condivisione → **Aggiungi alla schermata Home**. Se lo schema `orion://` non funziona sul tuo telefono, imposta Orion come browser predefinito e usa l'URL normale.
5. **Imposta Orion come browser predefinito** (Impostazioni → App → Orion → App browser di default): altrimenti un link a Instagram toccato dentro un'altra app si apre in Safari, dove non c'è nessun blocco.
6. Disinstalla le app ufficiali di Instagram e YouTube, se vuoi chiudere del tutto la porta.

Se Tampermonkey desse problemi, in Orion funzionano anche [Violentmonkey](https://addons.mozilla.org/it/firefox/addon/violentmonkey/), [ScriptCat](https://addons.mozilla.org/it/firefox/addon/scriptcat/) e OrangeMonkey (solo Chrome Web Store).

Per i dettagli del progetto: [`docs/PIANO.md`](docs/PIANO.md). Per la ricerca e le fonti: [`docs/RICERCA.md`](docs/RICERCA.md).
