# Spec — Personnalisation événementielle HexGL (ACME Racing Challenge)

Sources : `formation/tickets/company-event.md` (besoin, source de vérité), `formation/identite/charte_graphique_acme.pdf` v1.0 (09/2026) et `formation/identite/logo.png` (contraintes d'identité), `docs/architecture.md` (état actuel).

## 1. Contexte et objectif

ACME utilise HexGL lors d'un événement d'entreprise. Aujourd'hui, l'écran d'accueil (étape 1 : titre HexGL, fond photo bleu animé, menu Start / Controls / Quality / HUD / Credits aux couleurs bleu et orange) porte l'identité du jeu d'origine.

**Objectif** : l'écran d'accueil doit afficher l'identité ACME (logo, couleurs de la charte, nom de l'entreprise, message d'accueil) de façon sobre et maintenable, **sans aucun changement de gameplay**.

## 2. Exigences fonctionnelles

- **EF1 — Logo** : le logo ACME fourni (`logo.png`) est visible sur l'écran d'accueil, sans déformation (ratio d'origine 2172×724 conservé), avec une zone de respiration autour.
- **EF2 — Nom de l'entreprise** : « ACME » apparaît dans le message d'accueil (EF3) et via le logo.
- **EF3 — Message d'accueil** : le titre affiché est exactement « Bienvenue au ACME Racing Challenge » (formulation de référence de la charte, y compris « au »).
- **EF4 — Sous-titre** : la ligne « Une expérience événementielle aux couleurs de la marque. » figure sous le titre (intention visuelle de la charte, p. 4).
- **EF5 — Bouton principal** : l'entrée Start s'affiche « Démarrer la course » et garde exactement son rôle actuel (passer à l'étape 2).
- **EF6 — Couleurs** : fond principal sombre ; accents violet / bleu électrique / cyan. Plus aucune couleur de l'ancienne identité (bleu `#4190bb`, orange `#f66439`/`#f8854b`, fond photo) sur l'écran d'accueil.
- **EF7 — Visuels HexGL remplacés** : le titre HexGL (`title.png`) et le fond photo animé ne sont plus affichés sur l'accueil. Le crédit HexGL/BKcore reste accessible par l'entrée « Credits » (inchangé).

## 3. Comportements attendus

- Affichage initial : fond sombre, logo ACME, titre d'accueil, sous-titre, bouton « Démarrer la course », puis les entrées Controls / Quality / HUD / Credits.
- Le logo étant sur fond blanc, il est présenté sur une surface claire (carte arrondie sur fond sombre, comme dans la charte p. 4) ; il n'est ni recoloré, ni ombré, ni contouré.
- Les entrées Controls, Quality, HUD, Credits restent en anglais, conservent libellés, valeurs par défaut, cycle au clic et paramètres d'URL (`controlType`, `quality`, `hud`, `godmode`). Seule leur apparence (couleurs) s'aligne sur la palette.
- Survol / focus du bouton principal et des entrées : retour visuel conservé, mais en couleurs de palette.
- Après le clic sur « Démarrer la course », l'enchaînement étapes 2 → 3 → 4 → 5 et le retour initial sont identiques à l'existant.
- Si WebGL n'est pas disponible, le bouton principal garde son message actuel « WebGL is not supported! » et son lien, lisible sur le nouveau fond.

## 4. Contraintes

- **Gameplay, contrôles, HUD, physique, circuit, audio, scores/replays : inchangés** (charte p. 4, ticket).
- **Palette (charte p. 3)** : noir profond `#08090D` (fond principal), violet `#7628FF` (accent marque), bleu électrique `#315BFF` (accent digital), cyan `#00C4E8` (accent secondaire), blanc `#FFFFFF` (texte/contraste), gris clair `#E6E8EE` (surfaces secondaires). Dégradé événementiel autorisé : `#7628FF → #315BFF`. Jamais de gris moyen dominant.
- **Logo (charte p. 2)** : fichier fourni utilisé tel quel ; pas d'étirement/compression, pas d'ombre ni contour, pas de recoloration hors palette, pas de fond illisible.
- **Typographie (charte p. 3)** : aucune nouvelle dépendance webfont ; la typographie existante (Bebas Neue / sans-serif de repli) est conservée si lisible. Titres en sans-serif à graisse forte.
- **Sobriété** : pas d'effet complexe supplémentaire ; intégration simple et maintenable.
- **Lisibilité** : contraste suffisant du texte sur fond sombre ; écran d'accueil utilisable de 1280×720 à un écran mobile en portrait (`viewport` actuel), sans débordement ni scroll.
- **Hors ligne / autonomie** : le logo est servi par le site lui-même (aucune ressource externe nouvelle).

## 5. Décisions de conception déjà imposées

Par les documents :
- Message d'accueil de référence exact (EF3) ; logo visible sans déformation ; fond sombre avec accents violet/bleu/cyan ; branding sans effet sur gameplay/contrôles/HUD ; pas de webfont ajoutée ; typographie legacy conservée.

Par les arbitrages utilisateur (cette session) :
- Titre HexGL et fond photo **remplacés** sur l'accueil (EF7).
- Seul le bouton principal est francisé ; Controls/Quality/HUD/Credits **inchangés en anglais**.
- Périmètre = **écran d'accueil uniquement** : étapes 2, 3, 5, page Credits, `<title>`, métadonnées `og:`, favicon, manifestes et analytics restent inchangés.

Par défaut (non contredit par les documents) :
- Sous-titre de la charte repris tel quel (EF4).
- Logo présenté sur surface claire faute de version claire fournie (« sur fond sombre, privilégier la version claire si disponible » — non disponible).

## 6. Cas limites et gestion des erreurs

- **Logo introuvable / non chargé** : l'accueil reste utilisable (titre, bouton, menu visibles) ; un texte alternatif « ACME » est présent.
- **WebGL absent** : cf. §3 ; le message d'erreur reste lisible.
- **Petits écrans / portrait / redimensionnement** : logo réduit proportionnellement (jamais étiré) ; titre, sous-titre et bouton restent entièrement visibles et cliquables.
- **Écrans larges** : le logo ne dépasse pas une taille raisonnable ni ne perd sa zone de respiration.
- **Appareil tactile** : la cible du bouton reste cliquable au doigt ; contrôle par défaut (tactile) inchangé.
- **Paramètres d'URL** (`controlType`, `quality`, `hud`, `godmode`) : comportement identique, y compris godmode masqué par défaut.
- **Retour à l'accueil** (fin de course → rechargement, ou sortie de la page Credits) : l'accueil ACME est réaffiché à l'identique, sans résidu de l'ancien visuel.
- **Animations existantes** (flottement du titre/fond) : si conservées, elles ne doivent pas déformer le logo ni gêner la lecture ; sinon supprimées sans effet de bord.

## 7. Hors périmètre

- Toute modification de gameplay, contrôles, HUD, physique, circuit, audio, qualité graphique.
- Étapes 2 (aide), 3 (chargement), 5 (score), page Credits, écrans de course.
- `<title>`, métadonnées SEO/`og:`, favicon, icônes, manifestes FFOS, `cache.appcache`, `package.zip`.
- Traduction de l'interface, correction des bugs/dettes listés dans `docs/architecture.md`, retrait de Google Analytics.
- Création d'une version claire/alternative du logo, ajout de polices, thèmes configurables ou multi-marques.
- Évolution de l'infrastructure de tests existante au-delà de ce qu'exigent les critères ci-dessous.

## 8. Critères d'acceptation

1. **Logo** : le logo ACME est visible sur l'accueil à ses proportions d'origine (rapport largeur/hauteur ≈ 3,0), sans ombre, contour ni recoloration.
2. **Message** : le texte « Bienvenue au ACME Racing Challenge » est affiché, orthographe exacte ; le sous-titre (EF4) et le bouton « Démarrer la course » le sont aussi.
3. **Couleurs** : le fond dominant de l'accueil est `#08090D` ; les accents utilisés appartiennent à la palette (violet, bleu, cyan, blanc, gris clair, dégradé violet→bleu) ; aucune couleur `#4190bb`, `#f66439`, `#f8854b` ni l'ancien fond photo/titre HexGL ne subsiste à l'accueil.
4. **Menu** : Controls / Quality / HUD / Credits sont présents en anglais, cyclent comme avant, et `?controlType=…&quality=…&hud=…` produisent les mêmes valeurs initiales qu'avant.
5. **Parcours** : clic sur « Démarrer la course » → écran d'aide → clic → chargement → course avec compte à rebours, vaisseau et HUD visibles, comme avant (vérifiable avec le driver `run-hexgl` : capture d'accueil + capture en course).
6. **Gameplay inchangé** : aucun fichier de `bkcore/` (logique de jeu) n'est modifié ; les tests QUnit existants passent (`ci-chrome.bat`, code de sortie 0).
7. **Hors périmètre intact** : étapes 2, 3, 5, Credits, `<title>`, métadonnées et favicon sont inchangés.
8. **Robustesse visuelle** : revue manuelle à 1280×720 et en portrait mobile (≈ 390×844) : aucun débordement, texte lisible, logo non déformé ; comportement correct avec logo volontairement indisponible (§6).
9. **Sobriété** : aucune nouvelle dépendance (webfont, bibliothèque, ressource externe) ajoutée.
