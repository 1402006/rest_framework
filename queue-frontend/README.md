# Front-office — Gestion de files d'attente

Interface client (borne, affichage salle d'attente) et interface agent pour un système de gestion de files d'attente en agence bancaire.

## Stack

React 18 + TypeScript · Vite · Tailwind CSS v4 · react-router-dom · lucide-react

## Lancer le projet

Deux serveurs à démarrer, dans deux terminaux séparés.

**1. Le serveur de simulation (base de données JSON)**

Remplace temporairement l'API Django, le temps qu'elle soit intégrée. Toutes les données (services, guichets, tickets) sont stockées dans `mock-server/db.json` et persistent entre les rechargements de page.

```bash
cd mock-server
npm install
npm start
```
→ démarre sur `http://localhost:3001`

**2. Le frontend**

```bash
npm install
npm run dev
```
→ démarre sur `http://localhost:5173`

## Écrans disponibles

| Route | Écran |
|---|---|
| `/kiosk` | Prise de ticket (client) |
| `/display` | Affichage salle d'attente |
| `/track/:ticketId` | Suivi client (à venir) |
| `/agent` | Interface agent (prise en charge des clients) |

## Tester depuis un téléphone (écran Track / QR code)

Le Kiosk et l'API s'adaptent automatiquement à l'adresse utilisée, mais `localhost` n'a de sens que sur votre propre machine — un téléphone doit utiliser l'IP locale de l'ordinateur.

1. Trouvez l'IP locale de votre machine (les deux serveurs l'affichent aussi au démarrage) :
   - Windows : `ipconfig` → ligne "Adresse IPv4"
   - macOS/Linux : `ifconfig` ou `ip addr` → repérez une IP du type `192.168.x.x`
2. Vérifiez que le téléphone est connecté au **même réseau Wi-Fi** que l'ordinateur.
3. Sur l'ordinateur, ouvrez le Kiosk via cette IP plutôt que `localhost`, par exemple :
   `http://192.168.1.42:5173/kiosk`
4. Générez un ticket : le QR code encodera automatiquement cette même IP (`.../track/...`), donc le téléphone pourra le charger normalement.

Si le téléphone ne capte pas le même Wi-Fi (réseau d'entreprise filtré, hotspot mobile, démonstration à distance...), utilisez un tunnel comme [ngrok](https://ngrok.com) ou `npx localtunnel --port 5173` pour exposer temporairement le Kiosk sur une URL publique — utile surtout pour la soutenance si vous n'êtes pas sûr du réseau de la salle.

## Réinitialiser les données de test

Il suffit de remettre `mock-server/db.json` à son état initial (voir le fichier pour la structure de départ), ou de relancer le serveur après l'avoir restauré depuis Git.

## Bug corrigé : rechargement intempestif de la page en dev

`mock-server/db.json` est réécrit à chaque action (création de ticket, appel, résolution...). Comme ce fichier vit dans le dossier du projet frontend, Vite le surveillait par défaut et déclenchait un rechargement complet de la page à chaque écriture — ce qui donnait l'impression que l'écran de confirmation "revenait" à la sélection de service. C'est corrigé dans `vite.config.ts` (`server.watch.ignored`), qui exclut désormais `mock-server/` de la surveillance.

## Tests

```bash
npm run test
```
Un test (`test/kiosk.test.tsx`) simule le parcours complet du Kiosk (sélection → formulaire → confirmation) et vérifie que l'écran de confirmation reste affiché.

## Passage à l'API Django réelle

Toute la logique d'accès aux données est centralisée dans `src/api/client.ts` et `src/api/config.ts`. Pour brancher l'API réelle, il suffira de changer `API_BASE_URL` dans `config.ts` et d'ajuster les chemins si besoin — aucun composant ni hook ne devrait avoir à être modifié.
