# Plan technique — Branding ACME de l'écran d'accueil HexGL

Base : `work/company-event/spec.md` + `docs/architecture.md` + lecture de `index.html`, `launch.coffee`/`launch.js`, `css/multi.css`, `formation/tests/*`.
Aucun code écrit à ce stade. **Aucun commit pendant l'implémentation** : un seul commit après validation finale.

## 1. Objectif

Afficher l'identité ACME sur l'écran d'accueil (étape 1) : logo, palette de la charte, message « Bienvenue au ACME Racing Challenge », sous-titre, bouton « Démarrer la course ». Gameplay, étapes 2/3/5, Credits, `<title>`/métadonnées inchangés. Tout le branding vient **d'un seul fichier de configuration**.

## 2. État actuel et architecture concernée

- Site statique, scripts ES5 chargés par `<script>` dans `index.html` ; pas de build, pas de module.
- Étape 1 = `#step-1` : `#global` (fond `bg.jpg` animé), `#title` (fond `title.png`, animé), `#menucontainer > #menu` avec `#start` et `#s-*`. Styles dans `css/multi.css` (couleurs `#4190bb` / `#f66439` / `#f8854b`, bande blanche en dégradé, `text-shadow` blanc).
- `launch.js` (généré de `launch.coffee`, aucun compilateur disponible hors Node) : ne pose le texte de `#start` **que** si WebGL est absent (« WebGL is not supported! ») ; il pose le texte des `#s-*` et branche tous les clics. Il ne touche ni `#title` ni `#global`.
- `index.html` n'a pas d'attribut `manifest` : `cache.appcache` (FFOS) ne s'applique pas, pas de cache périmé à craindre.
- Tests : QUnit local, `formation/tests/index.html` + `browser-tests.js`, lancés par `ci-chrome.bat` (voir `CLAUDE.md`).
- Environnement : Python 3.13 présent, PHP absent, Node présent mais **non utilisé** par ce plan.

## 3. Approche technique

Un fichier JS ES5 sans dépendance, `branding/branding.js`, qui contient **la configuration et la petite fonction qui l'applique**. Il est chargé par `index.html` juste après le bloc `#step-1` (donc DOM déjà présent) et **avant** les libs et `launch.js`. Il :
1. écrit les couleurs de la config en variables CSS (`--brand-*`) sur `document.documentElement` ;
2. remplit les éléments marqués `data-brand="…"` (titre, sous-titre) ;
3. pose `src`/`alt` du logo ;
4. pose le libellé de `#start`.

`css/multi.css` consomme les variables pour les seules règles de l'étape 1. Le markup de l'étape 1 reçoit des emplacements vides (logo, titre, sous-titre) ; aucun texte de marque n'est écrit en dur dans le HTML ni le CSS.

Pourquoi ce séquencement : exécuté avant `launch.js`, le script laisse le message « WebGL is not supported! » écraser le libellé quand WebGL manque (spec §3) sans toucher à `launch.coffee`/`launch.js` (pas de dérive source/généré). Exécuté avant le téléchargement des libs, il évite l'affichage prolongé d'un accueil non brandé.

## 4. Fichiers et modules impactés

| Fichier | Action |
|---|---|
| `branding/branding.js` | **nouveau** : config + fonction d'application |
| `branding/acme-logo.png` | **nouveau** : copie de `formation/identite/logo.png` (l'original reste en place) |
| `index.html` | markup de l'étape 1 (emplacements) + 1 balise `<script>` |
| `css/multi.css` | règles de l'étape 1 uniquement (`#global`, `#title`, `#menu`, `#menu div`, hover, `#start`) + règles des nouveaux emplacements |
| `formation/tests/index.html` | +1 balise `<script>` |
| `formation/tests/browser-tests.js` | +1 module de tests de branding |

**Non touchés** : `bkcore/`, `bkcore.coffee/`, `launch.coffee`, `launch.js`, `libs/`, règles CSS des étapes 2/3/5 et Credits, `title.png` et `bg.jpg` (conservés, simplement plus référencés → retour arrière trivial), `<title>`, `og:`, favicon.

## 5. Structure des données de branding

```
window.BRANDING = {
  name:       "ACME",
  welcome:    "Bienvenue au ACME Racing Challenge",
  subtitle:   "Une expérience événementielle aux couleurs de la marque.",
  startLabel: "Démarrer la course",
  logo:       { src: "branding/acme-logo.png", alt: "ACME" },
  colors:     { bg: "#08090D", violet: "#7628FF", blue: "#315BFF",
                cyan: "#00C4E8", text: "#FFFFFF", surface: "#E6E8EE" }
}
window.applyBranding(doc)   // applique la config à `doc` (doc injectable → testable)
```
Le dégradé événementiel (violet→bleu) est composé en CSS à partir de `--brand-violet` / `--brand-blue`, pas dupliqué en config.

## 6. Décisions techniques principales

- **Un seul point de config** : texte, logo et couleurs dans `branding/branding.js` ; le CSS n'a aucune valeur de palette en dur pour l'étape 1.
- **Pas de modification du Coffee** : pas de compilateur sans Node, et modifier `launch.coffee` sans régénérer `launch.js` créerait une dérive.
- **Animations** (ambiguïté laissée ouverte par la spec §6) : tranché → `animbg` et `anim` retirés de l'accueil (sobriété, charte : « éviter les effets complexes »). Les `@keyframes` restent dans le fichier.
- **Typographie** : Bebas Neue conservée (charte : legacy toléré si lisible, pas de webfont ajoutée). Le titre d'accueil reste dans cette police ; l'exigence « graisse forte » est jugée à la recette visuelle.
- **Logo sur carte claire** (`--brand-text`/blanc, coins arrondis) au centre de l'accueil, largeur bornée (`max-width`, `height:auto`) → ratio préservé, pas de recoloration, pas d'ombre.
- **Menu** : texte `--brand-text`, survol `--brand-cyan`, bouton principal violet (ou dégradé violet→bleu), survol bleu. Suppression de la bande blanche en dégradé et du `text-shadow` blanc de l'étape 1.
- **Disposition** : dimensions en `vh`/`vw`/`min()` avec le menu toujours ancré en bas (comme aujourd'hui), pour tenir 1280×720 et le portrait mobile sans scroll (`body` est en `overflow:hidden`).
- **Texte alternatif « ACME »** sur le logo : couvre l'indisponibilité du fichier sans code d'erreur dédié.

## 7. Risques et compatibilité

| Risque | Parade |
|---|---|
| `launch.js` écraserait le libellé si l'ordre change | branding chargé **avant** `launch.js` ; vérifié par test « WebGL absent » |
| Règles CSS partagées dégradant les étapes 2/3/5/Credits | on ne modifie que des sélecteurs de l'étape 1 ; relecture du diff CSS |
| Débordement du bloc logo+titre sur le menu en hauteur réduite | tailles bornées en `vh`, contrôle visuel 1280×720 et 390×844 ; cas paysage mobile très bas signalé hors garantie |
| Variables CSS (`var()`) | supportées par tout navigateur capable de WebGL + Chrome/Edge visés ; non pertinent pour l'ancien FFOS (déjà cassé : `index-mobile.html` absent) |
| `browser-tests.js` couplé à `count >= 4` | on ne fait qu'ajouter des tests, le seuil reste satisfait |
| Attribution/licence HexGL retirée du titre | l'entrée « Credits » reste intacte (non modifiée) ; question de licence CC BY-NC vs MIT **non traitée ici** (signalée dans `architecture.md`) |
| Pas de vérification automatisée de la course | voir §8 : contrôle manuel court, car cliquer sans Node/CDP n'est pas scriptable |

## 8. Stratégie de tests et de vérification

Commandes (sans Node) :
- **Serveur** : `python -m http.server 8765` depuis la racine HexGL (Python 3, déjà documenté dans `CLAUDE.md`).
- **QUnit** : `cmd /c ".\formation\tests\ci-chrome.bat"` (PowerShell), attendu code 0.
- **Capture d'accueil** : Chrome headless natif, `--screenshot --window-size=1280,720` puis `390,844` sur `http://localhost:8765/index.html`.
- **WebGL absent** : même capture avec `--disable-3d-apis` → doit afficher « WebGL is not supported! » lisible.

Nouveaux tests QUnit (objectifs, sans WebGL) :
1. `applyBranding` sur un fixture : le titre vaut exactement la chaîne de la spec (critère 2), `#start` = « Démarrer la course », le logo a `src` et `alt` non vides.
2. Les couleurs posées en `--brand-*` sont exactement les 6 valeurs de la charte (critère 3).
3. `applyBranding` sur un document sans les emplacements ne lève pas d'exception.

Contrôles hors QUnit :
- `grep` sur `css/multi.css` et `index.html` : plus aucun `#4190bb`, `#f66439`, `#f8854b` ni référence à `title.png`/`bg.jpg` dans l'étape 1 ; aucune URL externe ajoutée.
- Diff : `bkcore/`, `bkcore.coffee/`, `launch.*` sans modification (listing des fichiers changés).
- Manuel (~1 min, rendu réel) : Start → clic aide → chargement → compte à rebours + HUD ; clics Controls/Quality/HUD ; `?quality=0&hud=0` ; Credits aller-retour ; fin de course/Échap → retour à l'accueil ACME sans résidu. Cas logo indisponible : renommer temporairement `acme-logo.png`, vérifier titre/menu utilisables, puis le remettre.
- Le driver `run-hexgl` (Node) existe et peut servir de confort local, mais le plan n'en dépend pas.

## 9. Plan d'implémentation (5 petites étapes, aucun commit)

1. **Config + tests d'abord.** Créer `branding/branding.js` (config + `applyBranding`), copier le logo, ajouter le `<script>` et les 3 tests dans `formation/tests/`. *Vérif* : `ci-chrome.bat` → code 0, tests de branding comptés ; l'accueil réel n'a pas encore changé.
2. **Emplacements HTML + chargement.** Dans `index.html` : emplacements logo / titre / sous-titre dans l'étape 1 et `<script src="branding/branding.js">` placé après `#step-1` et avant les libs. *Vérif* : serveur Python, textes présents dans une capture 1280×720, aucune erreur console, Start fonctionne, test « WebGL absent » garde le message d'erreur.
3. **Restyle CSS de l'étape 1.** Variables `--brand-*`, fond sombre, carte logo, titre, bouton violet, menu aux couleurs de la charte, animations retirées. *Vérif* : captures 1280×720 et 390×844 (pas de débordement, logo non déformé), `grep` anciennes couleurs → vide, relecture du diff CSS (seuls les sélecteurs de l'étape 1).
4. **Non-régression et cas limites.** Parcours complet manuel, paramètres d'URL, Credits, retour à l'accueil, logo indisponible, WebGL absent ; QUnit à nouveau. *Vérif* : liste des fichiers modifiés conforme au §4, `bkcore/` et `launch.*` intacts.
5. **Clôture (optionnelle, à valider hors spec).** Mettre à jour `CLAUDE.md`/`docs/architecture.md` (point de config du branding) et régénérer les captures de référence d'accueil, qui seront obsolètes. Présenter le diff final pour validation ; **le commit n'a lieu qu'après.**

Chaque étape est réversible isolément : supprimer `branding/` et rétablir les fichiers modifiés restitue l'accueil d'origine (`title.png` et `bg.jpg` sont conservés).
