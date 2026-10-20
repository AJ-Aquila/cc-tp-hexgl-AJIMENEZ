# HexGL — notes pour Claude

Site statique (pas de build, pas de npm). Architecture : `docs/architecture.md`.

## Tests (QUnit, sans Node)

- Windows (PowerShell) : `cmd /c ".\formation\tests\ci-chrome.bat"` — depuis Git Bash le `.bat` n'est pas trouvé, utiliser PowerShell.
- Linux : `bash formation/tests/ci-chrome.sh`
- Codes : 0 = réussis, 1 = échecs (rapport `formation/tests/rapport_erreur.html`), 2 = impossibles.
- Manuel : ouvrir `formation/tests/index.html`. Tests dans `formation/tests/browser-tests.js` (Utils, Timer), scripts chargés dans `formation/tests/index.html`.
- `ci-chrome.sh` sous Git Bash/Windows renvoie code 2 (`--dump-dom` sans sortie) : préférer le `.bat`.

## Branding ACME (écran d'accueil)

Tout le branding (textes, logo, couleurs) est dans `branding/branding.js` ; le CSS de l'étape 1 n'utilise que les variables `--brand-*`. Ne pas écrire de texte ou de couleur de marque en dur dans `index.html`/`multi.css`, ni modifier `launch.coffee`/`launch.js` pour cela. Tests : module « branding ACME » dans `formation/tests/browser-tests.js`.

## Captures de référence

`formation/tests/captures/accueil.png` et `jeu-en-cours.png` (1280x720, Chrome headless, rendu logiciel). Régénérer :

```
python -m http.server 8765 &
node .claude/skills/run-hexgl/driver.mjs http://localhost:8765/index.html formation/tests/captures/accueil.png formation/tests/captures/jeu-en-cours.png
```

Durée ~1 min. La capture « en cours » tombe dans le compte à rebours/GO : ne pas comparer au pixel.
