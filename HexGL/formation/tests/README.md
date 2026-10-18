# HexGL — Tests QUnit sans Node.js

## Fichiers

- `index.html` : interface QUnit pour afficher les résultats des tests.
- `browser-tests.js` : tests et assertions JavaScript, à compléter pendant le TP.
- `vendor/` : bibliothèque QUnit (JS et CSS), utilisable hors ligne.
- `ci-chrome.bat` : lance automatiquement les tests sous Windows (CMD ou PowerShell), sans dépendance supplémentaire.
- `ci-chrome.sh` : équivalent pour Linux (Bash).
- `rapport_erreur.html` : généré uniquement en cas d'échec, avec les détails des tests ou du problème d'exécution.

## Lancer les tests

- **Manuellement** : ouvrir `index.html` dans un navigateur.
- **Windows** : exécuter `ci-chrome.bat`.
- **Linux** : lancer `bash HexGL/formation/tests/ci-chrome.sh` depuis la racine du dépôt.

Les scripts recherchent Chrome, Chromium ou Edge selon le système et exécutent les tests en mode headless, sans Node.js.

**Codes de retour :**
- `0` — `TESTS_REUSSIS` : tous les tests passent. Aucun rapport d'erreur.
- `1` — `TESTS_ECHOUES` : au moins une assertion échoue. Consulter `rapport_erreur.html`.
- `2` — `TESTS_IMPOSSIBLES` : exécution automatique impossible. Consulter `rapport_erreur.html`, puis tester manuellement si nécessaire.

Le rapport précédent est supprimé au lancement et n'est conservé que si une erreur survient.

## Ajouter la CI

Placer `.github/workflows/hexgl-browser-tests.yml` à la racine du dépôt Git.

GitHub Actions exécute les mêmes tests sur une machine Windows (`windows-latest`), via `ci-chrome.bat`.

## Git

Ajouter au `.gitignore` à la racine du dépôt :

```gitignore
/HexGL/formation/tests/rapport_erreur.html
```