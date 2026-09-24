# AfriPay — Application mobile Client

Application mobile (Expo / React Native / JavaScript) pour les clients AfriPay : rechargement du portefeuille
depuis Mobile Money ou carte Visa, transfert entre comptes AfriPay, et paiement instantané chez les marchands
via un QR code (remplaçant fonctionnel du scan de paume — voir plus bas).

## Prérequis

- Node.js installé sur cette machine.
- Le backend AfriPay démarré : `cd ../backend && npm run dev` (écoute sur le port 4000).
- Un téléphone avec l'application **Expo Go** installée, connecté au **même réseau Wi-Fi** que cet ordinateur.

## Lancer l'application

```bash
npm install
npx expo start
```

Scannez ensuite le QR code affiché dans le terminal avec l'appareil photo (iOS) ou l'app Expo Go (Android).

### Configuration de l'URL de l'API

Le fichier `src/config/api.js` centralise l'URL du backend. Par défaut, il pointe vers
`http://192.168.1.71:4000/api` (l'IP LAN de la machine de développement d'origine). Si votre ordinateur a une
IP différente sur le réseau Wi-Fi :

1. Trouvez votre IP locale (`ipconfig` sous Windows, cherchez "Adresse IPv4").
2. Modifiez la constante `LAN_IP` en haut de `src/config/api.js`.

Le fichier documente aussi les deux autres cas de figure (émulateur Android → `10.0.2.2`, simulateur iOS →
`localhost`) via la constante `MODE`.

**Build de production** : ces réglages (`LAN_IP`/`MODE`) ne s'appliquent qu'en développement. Pour un
build de production (EAS Build), définissez `EXPO_PUBLIC_API_URL` (voir `.env.example`) avec une URL
**https://** — le démarrage échoue volontairement si elle est absente ou non-HTTPS, pour éviter de faire
transiter PIN, mot de passe et tokens en clair sur le réseau.

## À propos du "scan de paiement" (paume de main)

Il n'existe pas de capteur biométrique palmaire réel dans ce projet. Le backend fournit un remplaçant
fonctionnel : lors du parcours KYC, `POST /biometrie/enroll` génère un `palmCode` unique. L'application
l'affiche sous forme de **QR code** sur l'écran "Payer" (onglet du bas). C'est ce QR code que l'app Marchand
scanne pour identifier le client et encaisser le paiement — jamais présenté comme une vraie biométrie dans
l'interface, toujours libellé "Scan de paiement AfriPay".

## Écrans construits

- **Splash** — logo + slogan, redirige automatiquement vers Connexion ou le Tableau de bord selon la présence
  d'une session stockée (`expo-secure-store`).
- **Connexion** (téléphone + mot de passe) et **Inscription** en plusieurs étapes : numéro de téléphone → OTP
  (avec bandeau "mode développement" affichant le `devCode` renvoyé par l'API) → informations personnelles →
  création du compte PIN (4-6 chiffres).
- **Tableau de bord** (onglet Accueil) — solde du portefeuille (tirer pour rafraîchir), badge de statut KYC,
  grille d'actions rapides (Recharger / Transférer / Payer / Historique), bannière "Complétez votre KYC" si
  nécessaire, aperçu des transactions récentes.
- **Recharger** — tuiles par fournisseur (Wave, Orange Money, Moov Money, MTN MoMo, Djamo, Visa), saisie du
  montant, gestion explicite de l'erreur 403 de plafond (10 000 FCFA hors KYC validé) avec lien direct vers le
  parcours KYC.
- **Transférer** — numéro AfriPay du destinataire, montant, note optionnelle ; demande le code PIN si le
  montant est ≥ 50 000 FCFA (règle imposée par l'API).
- **Parcours KYC** (accessible depuis le tableau de bord et les paramètres) — écran d'état avec 4 étapes :
  informations personnelles, pièce d'identité (CNI/passeport/carte de séjour, caméra ou galerie), selfie,
  puis enrôlement du paiement (`POST /biometrie/enroll`) avec état de succès "Votre code de paiement AfriPay
  est prêt".
- **Payer** (onglet du bas) — QR code du `palmCode` du client, rappel du solde, bouton d'actualisation, état
  de repli si l'enrôlement n'est pas encore fait.
- **Historique** (onglet du bas) — liste filtrable par type (achat/recharge/transfert) et statut, détail façon
  reçu (référence, montant, date, statut, méthode) au tap sur une ligne.
- **Notifications** (onglet du bas) — liste, marquage lu au tap, "tout marquer lu".
- **Paramètres** (onglet du bas) — profil, statut KYC, modification du PIN, assistance/FAQ statique,
  déconnexion.

## Stack technique

- Expo (managed workflow), React Native, JavaScript.
- Navigation : `@react-navigation/native` + native-stack (pile Auth vs pile principale) + bottom-tabs (Accueil,
  Payer, Historique, Notifications, Paramètres) — pas d'Expo Router.
- Authentification : `expo-secure-store` pour les tokens (access/refresh), rafraîchissement automatique en cas
  de 401 (`src/api/client.js`).
- Upload de documents KYC : `expo-image-picker` (caméra ou galerie) + `FormData` multipart.
- QR code de paiement : `react-native-qrcode-svg`.
- Icônes : `@expo/vector-icons` (set FontAwesome6, style solid) via le composant centralisé `src/components/Icon.js`
  — voir `ICON_MIGRATION.md` à la racine du repo pour le mapping sémantique partagé entre les 3 apps.
- Palette et typographie conformes à `DESIGN_TOKENS.md` (fond noir/anthracite, dégradé de marque sur les
  boutons principaux, logo officiel `assets/logo-main.png` / `assets/logo-compact.png`, redimensionné depuis
  `assets/logo.png` à la racine du repo).

## Vérifications effectuées

- `npm install` réussit sans erreur.
- `npx expo-doctor` : 21/21 vérifications passées.
- `npx eslint src App.js` : 0 erreur.
- `npx expo export --platform android` : bundle généré sans erreur (migration des icônes vers FontAwesome6 incluse).
- Script de fumée (`node smoke.mjs`, non inclus dans le livrable) exécuté contre le backend réel démarré en
  local : inscription, connexion, définition du PIN, récupération du portefeuille, informations KYC, upload de
  documents (CNI + selfie), statut KYC, enrôlement biométrique + lecture du code, liste des fournisseurs de
  recharge, recharge réussie, recharge au-delà du plafond (403 attendu), historique, transfert interne simple,
  transfert ≥ 50 000 FCFA sans PIN (400 attendu) et avec mauvais PIN (401/400 attendu), notifications + marquage
  lu — toutes les requêtes ont retourné les formes de réponse attendues par le code de l'application.

## Limitations connues

- Le "scan de paiement" est un QR code, pas une vraie lecture biométrique (voir section dédiée ci-dessus).
- Pas de vraie intégration SMS pour l'OTP : le code est affiché directement dans l'app en développement
  (`devCode` renvoyé par l'API), conformément à `OTP_DEV_ECHO=true` côté backend.
- Le logo est utilisé en PNG statique (redimensionné), pas de rendu SVG vectoriel dynamique.
