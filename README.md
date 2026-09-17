# socialmerd

A free, open-source userscript that makes **Instagram web** and **YouTube** less "addictive" on **iPhone Safari**, via the free [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) app (quoid).

- **Instagram:** no Reels tab (reels received in DMs still play, one at a time), no suggested content or Explore grid, Home feed limited to accounts you follow with a "You're all caught up" stop.
- **YouTube:** no Shorts.
- **Extra:** a small usage-time counter and stats panel.

Inspired by [SocialLite](https://sociallite.app). License: GPL-3.0-or-later.

> ⚠️ Status: early scaffold (Fase 1 of the project plan). Not usable yet.

## Install (iOS 26, Safari)

1. Install the free [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) app from the App Store.
2. In **Settings → Apps → Safari → Extensions**, enable Userscripts and set it to **"Always Allow"** on `instagram.com` and `youtube.com`.
3. Open the raw install link below in Safari, tap the extension icon, then **Install**:
   - Stable: `https://raw.githubusercontent.com/glingus/socialmerd/main/dist/socialmerd.user.js`
4. If you add an icon to your Home Screen, turn **"Open as Web App" OFF**, so it still opens in Safari (extensions don't run in standalone web apps).
5. Uninstall the official Instagram/YouTube apps if you want no other way back in.

Note: GitHub's raw file host caches for a few minutes, so a freshly installed update can take a little while to show up.

## Why a userscript (and not an app)

A regular website can't read or modify instagram.com from the browser (CORS), Instagram sends `X-Frame-Options: DENY`, its CSP blocks bookmarklets, and there's no public feed/DM API anymore. A proxy would have to see your credentials, which is unacceptable. A userscript running client-side inside Safari, through the open-source Userscripts app, avoids all of that: no server, no expiry, no cost.

## Limitations

- Only works in a Safari tab — Apple doesn't run browser extensions inside Home Screen web apps.
- No notifications, no calls; publishing is limited to whatever the mobile web UI supports.
- Instagram and YouTube change their web UI often; selectors can break and need updates (see in-script update check).
- The extension can always be turned off from Settings — this is friction, not a cage.
- Only changes how the page renders in your own browser (like an ad blocker): no automation, no private APIs, no data collected. Low but non-zero risk with respect to Meta/Google's terms of use — use at your own risk.

## Contributing

See [`docs/PIANO.md`](docs/PIANO.md) for the project plan and architecture, and [`docs/RICERCA.md`](docs/RICERCA.md) for background research. Selector/string breakage reports are welcome via GitHub Issues.

---

## In italiano

**socialmerd** è uno userscript gratuito e open source che rende **Instagram web** e **YouTube** meno "da dipendenza" su **iPhone Safari**, tramite l'app gratuita [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) (quoid).

- **Instagram:** niente tab Reel (i reel ricevuti in DM si guardano comunque, uno alla volta), niente contenuti suggeriti né griglia Esplora, feed Home limitato a chi segui con uno stop "Sei in pari".
- **YouTube:** niente Shorts.
- **Extra:** contatore del tempo d'uso e pannello statistiche.

Ispirato a [SocialLite](https://sociallite.app). Licenza: GPL-3.0-or-later.

> ⚠️ Stato: scaffold iniziale (Fase 1 del piano di progetto). Non ancora utilizzabile.

Per l'installazione su iOS 26 vedi la sezione "Install" sopra (i passaggi sono identici, solo in inglese). Per i dettagli del progetto: [`docs/PIANO.md`](docs/PIANO.md).
