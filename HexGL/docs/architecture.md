# HexGL — Architecture (état actuel)

Document descriptif, établi par lecture du code. Aucune modification du projet n'a été faite pour l'écrire.

## 1. Stack et points d'entrée

- **Type** : site statique, jeu de course 3D en navigateur (HTML5 / WebGL). Aucun `package.json`, aucun bundler, aucun build : les scripts sont chargés un par un par `<script>` dans `index.html`.
- **Langages** : JavaScript ES5 « à la main » (`bkcore/`) et JavaScript généré par CoffeeScript (`bkcore.coffee/*.js`, `launch.js`). Les sources `.coffee` sont versionnées à côté des `.js` générés.
- **Moteur 3D** : Three.js ancienne version (`libs/Three.dev.js`, `libs/Three.r53.js`), avec `EffectComposer`, `BloomPass`, `ShaderPass`, etc. (`libs/postprocessing/`).
- **Autres libs** : `leap-0.4.1.min.js` (Leap Motion), `Detector.js`, `Stats.js`, `DAT.GUI.min.js`, `ShaderExtras.js`. `libs/Editor.html` et `libs/Editor_files/` (éditeur tiers : jQuery 1.8, ace, kinetic…) sont présents mais non référencés par le jeu.
- **Serveur** : n'importe quel serveur HTTP statique (le README indique `python -m SimpleHTTPServer`, Python 2). `.htaccess` est versionné.
- **Points d'entrée** :
  - `index.html` : page unique du jeu (menu, écrans d'aide, chargement, course, fin de course, crédits).
  - `launch.js` (généré depuis `launch.coffee`) : script de démarrage, branche le menu et instancie `bkcore.hexgl.HexGL`.
  - `branding/branding.js` : point unique de configuration du branding ACME (textes, logo, couleurs) ; appliqué à l'étape 1 avant `launch.js`.
    Emplacements remplis : `data-brand="logo"`, `"welcome"`, `"subtitle"` (étape 1) et `#start`. En ajouter un exige de modifier `branding.js` et le markup de `#step-1`. Le CSS de l'étape 1 n'utilise que les variables `--brand-*`.
  - `formation/tests/index.html` : page des tests QUnit.
  - `bkcore.coffee/tests.html` : ancienne page de test (charge `Timer.js`, `ImageData.js`, `Three.r53.js`, sans aucun test).
- **Manifestes / PWA-FFOS** : `manifest.webapp` (lance `/index-mobile.html`), `package.webapp`, `cache.appcache` (v1.0.1-ffos), `package.zip`.

## 2. Flux principal de lancement

1. `index.html` charge dans l'ordre : libs (Leap, Three, post-processing, Detector, Stats, DAT.GUI), contrôleurs (`Touch`, `Orientation`, `Gamepad`), `Timer`, `ImageData`, `Utils`, `threejs/*` (RenderManager, Shaders, Particles, Loader), `Audio`, `hexgl/*` (HUD, RaceData, ShipControls, ShipEffects, CameraChase, Gameplay), `tracks/Cityscape`, `HexGL`, puis `launch.js`. L'ordre est implicite : tout passe par des globaux (`bkcore.*`, `THREE`).
   `branding/branding.js` est chargé juste après le bloc `#step-1`, avant les libs : il écrit les variables CSS `--brand-*` et remplit logo, titre, sous-titre et libellé de `#start`. `launch.js` ne réécrit `#start` que si WebGL est absent : `branding.js` doit donc rester chargé **avant** `launch.js`, sinon le libellé de marque écraserait le message « WebGL is not supported! ».
2. `launch.js` :
   - lit les paramètres d'URL via `bkcore.Utils.getURLParameter` (`controlType`, `quality`, `hud`, `godmode`) ;
   - teste WebGL (`hasWebGL`) ; sinon le bouton Start devient « WebGL is not supported! » et pointe vers get.webgl.org ;
   - câble les entrées de menu (`#s-controlType`, `#s-quality`, `#s-hud`, `#s-godmode`, `#s-credits`), dont les valeurs par défaut sont qualité 3 (Very High), HUD activé, contrôles clavier (tactile si l'appareil est tactile).
3. Clic sur **Start** (`#start`) : `step-1` masqué, `step-2` affiché (image d'aide `css/help-<controlType>.png`).
4. Clic sur `step-2` : `init(...)` crée `new bkcore.hexgl.HexGL({... track: 'Cityscape', difficulty: 0 ...})`, expose `window.hexGL`, affiche `step-3` (barre de progression) et appelle `hexGL.load(...)`.
5. `HexGL.load` → `bkcore.threejs.Loader` charge textures, géométries, images de collision/hauteur (`ImageData`) et sons, selon la description fournie par `tracks/Cityscape.js`. `onProgress` met à jour `#progressbar`.
6. `onLoad` : `hexGL.init()` (matériaux, maillages, HUD, composer de post-traitement), `step-4` affiché, puis `hexGL.start()` : boucle `requestAnimationFrame` → `HexGL.update()` ; `initGameplay()` crée `Gameplay`.
7. `Gameplay` : compte à rebours (étapes `step` 0 à 3, délais `countDownDelay` / `startDelay`), puis mode `timeattack` : tick du `RaceData`, checkpoints, tours, fin `FINISH` ou `DESTROYED`.
8. Fin de course : `HexGL.displayScore` affiche le temps dans `#step-5` (`gameover`), puis un clic ramène à l'état initial. `Échap` appelle `HexGL.reset()`.

## 3. Modules, fichiers et assets

### Code applicatif (`bkcore/`)

| Fichier | Rôle | Taille (lignes) |
|---|---|---|
| `hexgl/HexGL.js` | Classe racine : options, renderer, composer, HUD, boucle, écran de score | 446 |
| `hexgl/ShipControls.js` | Physique/contrôle du vaisseau (clavier, tactile, orientation, gamepad, Leap), collisions, hauteur, boosters | 806 |
| `hexgl/Gameplay.js` | Machine d'état de course, modes `timeattack` / `replay`, tours, checkpoints | 230 |
| `hexgl/HUD.js` | Affichage tête haute (canvas) | 269 |
| `hexgl/ShipEffects.js` | Particules, bloom, effets sonores liés au vaisseau | 186 |
| `hexgl/CameraChase.js` | Caméra de poursuite | 72 |
| `hexgl/RaceData.js` | Enregistrement/relecture de trajectoires (replay) | 98 |
| `hexgl/Ladder.js` | Classement en ligne (non chargé par `index.html`) | 51 |
| `hexgl/tracks/Cityscape.js` | Description du circuit : ressources, checkpoints, construction de la scène | 521 |
| `threejs/Loader.js`, `Preloader.js` | Chargement asynchrone des ressources (`Preloader` non chargé par `index.html`) | 259 / 150 |
| `threejs/RenderManager.js` | Gestion des « scènes » rendues | 131 |
| `threejs/Shaders.js` | Shaders GLSL en chaînes (normal map, hexvignette, etc.) | 949 |
| `threejs/Particles.js` | Système de particules (version JS ; une version Coffee existe dans `bkcore.coffee/threejs`) | 190 |
| `Audio.js` | Wrapper Web Audio API | 141 |

### Code issu de CoffeeScript (`bkcore.coffee/`)

`Timer`, `ImageData`, `Utils`, `controllers/{Touch,Orientation,Gamepad}Controller`, `threejs/Particles`, chacun avec son `.coffee` et son `.js` généré. `Particles.js` de `bkcore.coffee/threejs/` n'est pas chargé par `index.html` (celui de `bkcore/threejs/` l'est).

### Assets

| Dossier | Contenu |
|---|---|
| `textures/` (4,2 Mo) / `textures.full/` (5,3 Mo) | Textures (bonus, hud, particles, ships, skybox, tracks). Le README indique d'échanger les deux dossiers pour les textures pleine taille. |
| `geometries/` (1,3 Mo) | Modèles JSON Three.js : `bonus`, `booster`, `ships/feisar`, `tracks/cityscape` (`track.js` ≈ 739 Ko) et `edge`. |
| `audio/` (2,1 Mo) | `bg`, `boost`, `crash`, `destroyed`, `wind` en `.ogg` uniquement ; fichier `LICENSE`. |
| `css/` | `multi.css`, `fonts.css`, `touchcontroller.css`, polices Bebas Neue (eot/svg/ttf/woff), images d'aide et de menu. |
| `replays/cityscape-casual/bkcore.replay.json` | Replay de référence. |
| `icon_*.png`, `favicon.png` | Icônes. |
| `branding/` | `branding.js` (configuration et application du branding ACME) et `acme-logo.png` (copie de `formation/identite/logo.png`). |
| `formation/` | Matériel de formation : `identite/` (charte graphique PDF, logo), `tickets/company-event.md`, `tests/`. |

## 4. Dépendances et zones legacy à risque

- **Three.js très ancien** (r53 / « dev ») : API disparue des versions actuelles (`Matrix4.n14…`, `lerpSelf`, `slerpSelf`, `texture` dans les uniforms, `THREE.UniformsUtils.clone`). Deux copies de Three coexistent (`Three.dev.js` utilisé par le jeu, `Three.r53.js` utilisé seulement par `bkcore.coffee/tests.html`).
- **Chargement par globaux et ordre de balises** : aucune notion de module ; un fichier manquant ou déplacé casse les suivants (cf. `bkcore.coffee/tests.html` ou `formation/tests/index.html`, qui doivent connaître les chemins relatifs).
- **Code généré versionné** : versions de CoffeeScript différentes selon les fichiers (1.4.0, 1.6.3, 1.7.1). Les fichiers `.coffee` ne couvrent que `launch`, `Timer`, `ImageData`, `Utils`, les contrôleurs et une version de `Particles` ; tout `bkcore/` est écrit directement en JS.
- **Navigateurs/API obsolètes** : `ActiveXObject` dans `Utils.request`, `webkitAudioContext`, Leap Motion 0.4.1, `Detector.js`, FFOS (`manifest.webapp`, `cache.appcache`, `package.webapp`), Application Cache.
- **Étape 1 (branding)** : le CSS de l'accueil utilise les variables CSS (`var(--brand-*)`) et la fonction `min()`. Un navigateur récent est requis pour cet écran ; les environnements legacy ci-dessus (FFOS notamment) ne sont pas pris en charge. Seuil de version non vérifié.
- **Tiers externes** : Google Analytics (`ga.js`, compte `UA-26274524-4`) injecté dans `index.html` ; URLs absolues `hexgl.bkcore.com` (icônes, balises og:).
- **Stockage navigateur** : `localStorage` pour scores et replays (clés construites dans `HexGL.js` et `Gameplay.js`).
- **Licences** : l'en-tête des fichiers cite CC BY-NC 3.0, le README et le dossier racine annoncent MIT (`LICENSE`).
- **Poids binaire** : `package.zip` (3,1 Mo) et `textures.full/` versionnés dans le dépôt.
- **Rendu** : exige WebGL ; fonctionne en headless uniquement avec un rendu logiciel (SwiftShader), le chargement de la course y prend 30 à 45 s.

## 5. Fonctions / modules testables automatiquement

### Infrastructure QUnit existante (`formation/tests/`)

- `index.html` charge QUnit 2.26.0 local (`vendor/`), `../../bkcore.coffee/Utils.js`, `../../bkcore.coffee/Timer.js`, `../../branding/branding.js` et `browser-tests.js`. Un script en tête de page redirige vers `?hexgl_poc=ok` si le paramètre est absent.
- `browser-tests.js` pose `data-test-status` (`pass`/`fail`), `data-test-count` et `data-test-failures` sur `<html>` ; le statut vaut `pass` si 0 échec **et** au moins 4 assertions (`data-test-count` compte les assertions de QUnit, pas les tests).
- Lanceurs : `ci-chrome.sh` (Bash) et `ci-chrome.bat` (Windows) : Chrome/Chromium/Edge headless avec `--dump-dom`, codes de sortie 0/1/2, rapport `rapport_erreur.html` en cas d'échec.
- Tests actuels (15 tests, 28 assertions) : `bkcore.Utils` (`updateClass`, `getOffsetTop`, `getURLParameter`, `isTouchDevice`), `bkcore.Timer` (`msToTime`, `msToTimeString`, `zfill`, `start`/`getElapsedTime`, `pause`/`update`) et le module de branding ci-dessous.
- Module « branding ACME » (3 tests, sans WebGL) : message, libellé de `#start` et logo posés par `applyBranding`, six couleurs de la charte en `--brand-*`, document sans emplacements toléré.

### Couverture possible vs actuelle

| Module | Dépendances | Testable sans WebGL ni DOM de jeu | Couvert par QUnit |
|---|---|---|---|
| `Utils.updateClass`, `getOffsetTop`, `getURLParameter`, `isTouchDevice` | DOM minimal | oui | oui (4 fonctions sur 4 ; `isTouchDevice` seulement par son type de retour) |
| `Utils.request` | `XMLHttpRequest` | oui avec doublure | non |
| `Utils.createNormalMaterial`, `projectOnScreen` | `THREE`, `bkcore.threejs.Shaders` | non (Three requis) | non |
| `Timer.msToTime`, `msToTimeString`, `zfill` | aucune (fonctions statiques) | oui | oui |
| `Timer` (instance : `start`, `pause`, `update`, `getElapsedTime`) | `Date` | oui (horloge à simuler) | partiellement (`start`, `getElapsedTime`, `pause`/`update`) |
| `ImageData.getPixel`, `getPixelBilinear`, `getPixelF`, `getPixelFBilinear` | `Image`, canvas | oui avec image/canvas de test | non |
| `RaceData` (`tick`, `export`, `import`, `reset`, `applyInterpolated`) | `THREE.Vector3/Quaternion`, `shipControls` | avec Three chargé + doublure | non |
| `Gameplay` (checkpoints, tours, `end`) | `THREE`, `Timer`, `shipControls`, `HUD` | difficile | non |
| `Audio`, `Loader`, `HUD`, `ShipControls`, `ShipEffects`, `CameraChase`, `Cityscape`, `HexGL` | WebGL, Web Audio, DOM de jeu | non | non |
| `bkcore.coffee/controllers/*` | événements tactiles/gamepad | partiellement | non |

`Timer.js` et `ImageData.js` n'ont aucune dépendance à Three ni au DOM de jeu. `Timer.js` est chargé par `formation/tests/index.html` ; `ImageData.js` ne l'est pas.

## 6. Bugs, dettes et anomalies remarquables

Observés à la lecture du code (non exécutés individuellement, sauf mention).

**Anomalies de code probables**

1. `bkcore/hexgl/RaceData.js` — `tick` : dans la branche finale, `this.rate++` est incrémenté à la place de `this.rateState` ; `rateState` reste à 1 et chaque tick est enregistré, alors que `rate = 2` suggère un échantillonnage 1 sur 2.
2. `bkcore/hexgl/HexGL.js:228` — `JSON.Stringify(...)` (S majuscule) : `JSON.Stringify` n'existe pas, l'appel lèverait une `TypeError` dans la branche « record local » de `displayScore`.
3. `bkcore/hexgl/HexGL.js` — `displayScore` : `var t = this.track` est l'objet piste ; il est concaténé dans les clés `localStorage` (`'score-'+t+'-'+d`) → `score-[object Object]-casual`. `Gameplay.js` lit la clé `'race-'+this.track.name+'-replay'` : les clés d'écriture et de lecture du replay diffèrent.
4. `bkcore/hexgl/Gameplay.js` — mode `replay` : `self.end(self.result.REPLAY)` référence `self.result` (un nombre, valeur courante) au lieu de `self.results` (qui contient `REPLAY: 4`) : `self.result.REPLAY` vaut `undefined`.
5. `bkcore/hexgl/Ladder.js` — référence `bkcore.Ladder.global` alors que l'objet est `bkcore.hexgl.Ladder` ; la condition `!bkcore.Ladder.global[track][mode] == undefined` est toujours fausse ; `Utils.request("nothing", ...)` appelle une URL factice ; le fichier n'est pas inclus dans `index.html`. Pourtant `HexGL.displayScore` lit `bkcore.hexgl.Ladder.global[t][d]` (branche atteinte seulement si `gameover` est nul, ce que `launch.js` ne fait jamais).
6. `bkcore.coffee/Utils.js` — `Utils.request` : boucle `createXMLHTTPObject` en `i <= XMLHttpFactories.length` (indice hors tableau, masqué par `try/catch`) ; `url += "?" + qdata` est exécuté à l'intérieur de la boucle sur `data` (paramètres multiples répétés) ; en POST les données partent à la fois dans l'URL et dans le corps.
7. `bkcore.coffee/Timer.js` — `msToTime` déclare la clé `ms` deux fois ; `zfill(ms, 4)` fait du temps formaté une chaîne de 4 chiffres pour des millisecondes.
8. `bkcore.coffee/Utils.js` — `getURLParameter` met en cache dans `Utils.URLParameters` à la première lecture ; une valeur contenant `%`-encodage n'est pas décodée.
9. `bkcore/hexgl/HexGL.js` — `this.a = window.location.href` et un test commenté `//if(this.a[15] == "o")` autour de `raf()` : reste d'un contrôle d'origine désactivé.
10. `bkcore/hexgl/RaceData.js` — `import` contient un `console.log(this.data)` de débogage ; plusieurs `console.log` / commentaires de debug restent dans `ShipControls.js` (`'GAMEOVER'`, lignes commentées).
11. `bkcore/hexgl/Gameplay.js` — `simu()` écrit des temps de tour factices (92300, 91250, 90365 ms) : code de simulation laissé dans le module.

**Dettes et incohérences**

- `manifest.webapp` référence `/index-mobile.html`, fichier absent du dépôt.
- `bkcore/threejs/Preloader.js` et `bkcore/hexgl/Ladder.js` ne sont pas inclus par `index.html`.
- `bkcore.coffee/tests.html` ne contient aucun test et référence `../libs/Three.r53.js`.
- `index.html` : l'`id` `ctrl-help` apparaît deux fois (`step-2` et `step-5`).
- Plusieurs `console.warn` mal orthographiés (`"Unkown"`) dans `Loader.js`.
- Mélange d'indentation tabulations/espaces ; en-têtes de licence incohérents ; chaînes en anglais dans le jeu, en français dans `formation/`.
- `README.md` : instructions pour Python 2 (`SimpleHTTPServer`), branche « Master » décrite comme version publique.
- Branding ACME limité à l'écran d'accueil : les étapes 2, 3, 5 et la page Credits gardent l'identité HexGL ; `<title>`, balises `og:`, favicon et Google Analytics restent ceux de HexGL.
- `css/title.png` et `css/bg.jpg` ne sont plus référencés (conservés dans le dépôt).
- Accueil en paysage très bas : à 1280×420, le titre et le sous-titre se superposent au bouton Start (non mesuré entre 420 et 720 px de hauteur).

**Anomalies de la chaîne de test (constatées à l'exécution)**

- `formation/tests/ci-chrome.sh` lancé sous Windows (Git Bash, Chrome 64 bits) se termine avec `STATUT=TESTS_IMPOSSIBLES CODE=2` et la raison « Le navigateur n a produit aucun resultat HTML » : `--dump-dom` n'a rien renvoyé sur stdout dans cet environnement. Il laisse alors `formation/tests/rapport_erreur.html` (ignoré par `.gitignore` selon le README de tests).
- `browser-tests.js` : le test `getURLParameter` calcule `expected` à partir de l'URL courante ; son résultat dépend donc de la présence de `hexgl_poc=ok`, que la page injecte par redirection.
- Le seuil `count >= 4` dans la condition `pass` couple le statut global au nombre d'assertions écrites aujourd'hui.

**Observation à l'exécution**

- Lancé en Chrome headless via `.claude/skills/run-hexgl/driver.mjs` (rendu logiciel), le menu s'affiche, le clic sur Start puis sur l'écran d'aide lance la course : décor, compte à rebours, vaisseau, HUD et « 1/3 » visibles. Le déplacement du vaisseau et la fin de course n'ont pas été observés.
