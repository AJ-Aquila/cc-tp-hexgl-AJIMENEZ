# Prompts principaux

## A2 - Explorer le legacy

```text
Explore ce projet legacy sans modifier aucun fichier.

Génère directement `docs/architecture.md` avec :

- stack et points d’entrée ;
- flux principal de lancement ;
- principaux modules, fichiers et assets ;
- dépendances et zones legacy à risque ;
- fonctions/modules testables avec Node sans navigateur ;
- bugs, dettes ou anomalies remarquables.

Le document doit décrire uniquement l’état actuel du projet.

Ne propose aucune solution.
Ne refactore rien.
Ne modifie aucun autre fichier.
```

Cf. /A2-explorer pour un exemple de architecture.md

## A3 - Figer les comportements à préserver

```text
À partir de ton analyse du projet, identifie les comportements existants
qu’il est pertinent de protéger avant le refactoring.

Crée uniquement les tests utiles et simples à exécuter sans navigateur.

Contraintes :
- utiliser uniquement les outils natifs de Node
  (`node:test`, `node:assert`, `node:fs` si nécessaire)
- privilégier les fonctions pures et les checks simples de non-régression
- ajouter un `package.json` minimal avec une commande `npm test`
- ne pas modifier le code fonctionnel
- ne pas figer le logo, les couleurs, les textes ou autres éléments
  de branding qui seront volontairement modifiés plus tard.

À la fin, exécute `npm test` et explique brièvement ce que chaque test protège.
```

Cf. /A3-figer-les-comportements pour un exemple des tests et de captures

## B1 - Créer une branche dédiée

```text
git switch -c refactor/company-event
git branch
```

## B2 et B3 - Spécification fonctionnelle

Ce prompt utilise le ticket, le logo, et la charte graphique déjà préparées dans le dossier /HexGL/formation/ pour générer la specification fonctionnelle :

```text
Lis :
- @formation/tickets/company-event.md
- @formation/identite/charte_graphique_acme.pdf
- @formation/identite/logo.png
- @docs/architecture.md
- ainsi que le code concerné.

@formation/tickets/company-event.md est notre source de vérité du besoin. 
La charte et le logo sont des contraintes d'identité visuelle à respecter.

Avant de rédiger la spec :
- utilise AskUserQuestion uniquement si une ambiguïté nécessite réellement une décision humaine
- ne redemande pas ce qui est déjà explicite dans les documents
- ne détaille pas encore le plan d’implémentation ni les fichiers à modifier

Une fois les points nécessaires clarifiés, génère : work/company-event/spec.md avec :
- Contexte et objectif
- Exigences fonctionnelles
- Comportements attendus
- Contraintes
- Décisions de conception déjà imposées
- Cas limites et gestion des erreurs
- Hors périmètre
- Critères d’acceptation

La spécification décrit ce que l’on veut obtenir et pourquoi.

Ne modifie aucun code.
```
Review : 
```text
Relis @work/company-event/spec.md comme reviewer produit.
Signale uniquement :
- les ambiguïtés restantes
- les exigences non vérifiables
- les détails d’implémentation prématurés qui devraient plutôt apparaître dans plan.md
- les exigences inventées par rapport aux sources du besoin
- les cas limites ou éléments hors périmètre manquants qui pourraient élargir le travail.
Ne modifie rien. Classe les remarques par importance.
```

Cf. /B2-B3-spec pour une exemple de specification fonctionnelle

## B4 et B5 - plan

```text
/plan À partir de @work/company-event/spec.md et de @docs/architecture.md,
propose l’approche technique minimale pour implémenter le changement
dans cette codebase legacy.

Contraintes :
- préserver le gameplay et le fonctionnement actuel ;
- ne pas changer de framework ni moderniser Three.js / CoffeeScript ;
- centraliser le branding dans un seul point de configuration ;
- Node sert uniquement au tooling et aux tests ;
- pas de backend ni d’upload dynamique ;
- préférer de petits changements réversibles.

Structure le plan avec :
- objectif
- état actuel et architecture concernée
- approche technique
- fichiers et modules impactés
- structure des données de branding si nécessaire
- décisions techniques principales
- risques et compatibilité
- stratégie de tests et de vérification
- plan d’implémentation en 3 à 5 petites étapes

Ne code rien.
```

Review :

```text
Le plan est validé.
Enregistre le plan validé dans : work/company-event/plan.md
Ne l'enrichis pas et ne commence aucune implémentation.
Ne modifie aucun autre fichier.
```

Cf. /B4-B5-plan pour une exemple de plan.md

## B6 - Build

Cf. /B6-build pour les captures d'écran de chaque étape

### ETAPE 1 : 

```text
Implémente uniquement l’étape 1 du plan d’implémentation de @work/company-event/plan.md.
Respecte exactement le plan validé et les contraintes propres à cette étape.
Règles :
- n’anticipe pas les étapes suivantes
- ne modifie rien hors du périmètre prévu
- si l’implémentation nécessite de s’écarter du plan validé, arrête-toi et explique l’écart avant de poursuivre
- ne touche pas au gameplay ni au JavaScript / CoffeeScript sauf si le plan l’exige explicitement
- lance `npm test` après les modifications
- si un test échoue, corrige la cause sans supprimer ni affaiblir le test
- arrête-toi après cette étape
- résume les fichiers modifiés, les changements effectués et le résultat des tests
Ne commence pas l’étape suivante.
```

### ETAPES 2 - N : 

```text
L’étape précédente est validée.

Implémente uniquement l’étape suivante
du plan d’implémentation de @work/company-event/plan.md.

Respecte exactement le plan validé et les contraintes propres à cette étape.

Règles :
- n’anticipe pas les étapes suivantes
- ne modifie rien hors du périmètre prévu
- si l’implémentation nécessite de s’écarter du plan validé, arrête-toi et explique l’écart avant de poursuivre
- ne touche pas au gameplay ni au JavaScript / CoffeeScript sauf si le plan l’exige explicitement
- lance `npm test` après les modifications
- si un test échoue, corrige la cause sans supprimer ni affaiblir le test
- arrête-toi après cette étape
- résume les fichiers modifiés, les changements effectués et le résultat des tests

Ne commence pas l’étape suivante ni ne fait aucun commit.
```

## B7 - Vérification finale

```text
/simplify Concentre-toi uniquement sur les fichiers modifiés pour ce changement. Simplifie seulement si cela améliore réellement la qualité ou réduit la duplication. Ne change aucun comportement, n'élargis pas le périmètre, ne modernise pas la codebase et ne touche pas au gameplay ni au JavaScript / CoffeeScript. Si aucune simplification utile n'est nécessaire, ne modifie rien.
```

puis :

```text
Vérifie l’implémentation par rapport aux critères d’acceptation de @work/company-event/spec.md.
Pour chaque critère, indique :
- PASS, FAIL ou INCONCLUSIVE
- la preuve observée : test, fichier, diff ou comportement visible 
- si FAIL, la cause probable
Vérifie également qu’aucun changement hors périmètre n’a été introduit.
Ne modifie rien pendant cette vérification.
```

## B8 - Capitaliser et documenter


```text
Analyse @work/company-event/spec.md, @work/company-event/plan.md et le diff actuel. 
Identifie les informations durables qui doivent être répercutées dans docs/architecture.md : changements d’architecture, nouvelles commandes, contraintes, pièges importants et décisions techniques durables.
Propose uniquement les mises à jour nécessaires.
Ne supprime ni spec.md ni plan.md.

```

puis :

```text
Applique les mises à jour validées à @docs/architecture.md.
Supprime uniquement les fichiers temporaires devenus inutiles.
Conserve work/company-event/spec.md et work/company-event/plan.md
```

Cf. /B8-capitaliser-et-documenter pour la doc mise à jour.

## B9 - Commit

```text
Analyse le diff actuel, y compris spec.md, plan.md, code, tests et documentation.
Si tu détectes un changement inattendu ou hors périmètre, arrête-toi.
Sinon, propose un message adapté puis crée le commit local.
Ne push rien.
```

## B10 - Automatisations Git

Cf. /B10-automatisations-git pour les fichiers du chapitre sur Git, GitHub, et CI / CD