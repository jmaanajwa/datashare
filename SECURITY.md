# Rapport de sécurité — frontend DataShare

## 1. Objet du rapport

Ce document présente le scan de sécurité réalisé sur les dépendances du frontend
Angular situé dans ce dossier. L'objectif est d'identifier les vulnérabilités
publiées dans les dépendances déclarées par `package.json` et verrouillées par
`package-lock.json`.

Le scan porte sur les dépendances de production et de développement. Il ne
remplace pas une analyse du code source, une analyse des secrets, un audit de
configuration ou un scan de l'image Docker.

## 2. Environnement du scan

| Élément | Valeur |
| --- | --- |
| Date du scan | 9 novembre 2026 |
| Projet | `datashare` |
| Node.js | 24.18.0 |
| npm | 11.17.0 |
| Angular | 21.2.x |
| Fichier analysé | `package-lock.json` |

## 3. Outils et commandes exécutés

Le scan principal a été réalisé avec l'audit officiel npm :

```powershell
cd datashare
npm audit --json
```

Un contrôle spécifique des dépendances de production a également été exécuté :

```powershell
npm audit --omit=dev --json
npm audit --omit=dev --audit-level=moderate
```

Enfin, l'intégrité du lockfile a été vérifiée sans exécuter les scripts de
paquets :

```powershell
npm install --package-lock-only --ignore-scripts --no-audit --no-fund
```

Résultat : `up to date`.

## 4. Résultats du scan npm audit

| Niveau | Dépendances de production et développement | Production uniquement |
| --- | ---: | ---: |
| Info | 0 | 0 |
| Low | 0 | 0 |
| Moderate | 0 | 0 |
| High | 0 | 0 |
| Critical | 0 | 0 |
| Total | **0** | **0** |

La commande npm a retourné :

```text
found 0 vulnerabilities
```

Le résultat est donc **conforme** au seuil actuel : aucune vulnérabilité npm
connue n'a été détectée dans l'arbre de dépendances installé et audité.

## 5. Analyse complémentaire Trivy

Trivy n'est pas installé ni disponible dans le `PATH` de l'environnement de
validation. Aucun résultat Trivy ne doit donc être interprété comme un scan
réussi ou comme une preuve d'absence de vulnérabilité.

Pour compléter l'analyse sur une machine disposant de Trivy, exécuter depuis le
dossier frontend :

```powershell
trivy fs --scanners vuln,secret,misconfig --severity HIGH,CRITICAL .
```

Les répertoires générés et les dépendances installées peuvent être exclus pour
limiter le bruit du scan :

```powershell
trivy fs --scanners vuln,secret,misconfig `
  --severity HIGH,CRITICAL `
  --skip-dirs node_modules,dist,coverage .
```

## 6. Contrôles de sécurité applicatifs à maintenir

Le scan de dépendances ne suffit pas à valider toute la sécurité du frontend.
Les contrôles suivants doivent rester actifs :

- ne jamais committer de secret, token JWT ou clé privée dans `src/` ;
- conserver les appels API derrière les services Angular prévus à cet effet ;
- ne pas désactiver la validation des formulaires ou les protections de route ;
- utiliser HTTPS en environnement de production ;
- ne pas afficher de token ou de mot de passe dans les logs ;
- vérifier les URLs et les redirections côté backend, même si le frontend les
  valide également ;
- maintenir les dépendances et le lockfile à jour ;
- exécuter un scan de secrets et un scan de l'image Docker dans la CI lorsque
  ces artefacts sont publiés.

## 7. Contrôle recommandé en CI

La commande suivante doit faire échouer le pipeline en cas de vulnérabilité
élevée ou critique :

```powershell
npm ci --ignore-scripts
npm audit --audit-level=high
```

`npm ci` garantit une installation reproductible à partir du lockfile. Le seuil
`high` laisse remonter les niveaux high et critical tout en évitant de bloquer
la livraison sur une vulnérabilité faible sans correctif disponible. Le seuil
peut être abaissé à `moderate` selon la politique de sécurité du projet.

## 8. Conclusion et actions

Statut actuel : **PASS pour l'audit des dépendances npm**.

Actions recommandées avant une mise en production :

1. intégrer `npm ci --ignore-scripts` et `npm audit --audit-level=high` dans la
   CI ;
2. installer Trivy dans la CI ou l'exécuter via son image Docker pour scanner
   les secrets, les mauvaises configurations et les artefacts publiés ;
3. planifier une nouvelle analyse après chaque mise à jour de
   `package-lock.json` ;
4. conserver ce rapport avec les résultats des scans backend et Docker.

