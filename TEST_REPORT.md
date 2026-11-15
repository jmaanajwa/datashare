# Rapport des tests frontend DataShare

Date de validation : **15 novembre 2026**

## Synthèse

| Campagne | Suites/specs | Tests | Réussis | Échecs | Statut |
| --- | ---: | ---: | ---: | ---: | --- |
| Jest avec couverture | 10 suites | 34 | 34 | 0 | PASS |
| Cypress E2E | 7 specs | 15 | 15 | 0 | PASS |

## Couverture Jest

| Indicateur | Résultat | Seuil | Statut |
| --- | ---: | ---: | --- |
| Instructions | **89,96 %** | 70 % | PASS |
| Branches | **74,28 %** | 70 % | PASS |
| Fonctions | **92,15 %** | 70 % | PASS |
| Lignes | **93,15 %** | 70 % | PASS |

Le seuil global configuré dans `jest.config.js` est respecté pour les quatre
indicateurs.

## Commandes exécutées

Depuis le dossier `datashare` :

```powershell
npm run test:coverage -- --runInBand
npm start -- --host 127.0.0.1
npm run cypress:run
```

Le serveur Angular a été démarré temporairement sur `http://localhost:4200` pour
Cypress, puis arrêté après l'exécution.

## Environnement

- Node.js `24.18.0`
- npm `11.17.0`
- Angular `21.2.x`
- Jest `30.5.2`
- Cypress `16.2.1`
- Navigateur Cypress : Electron 146 headless

## Détail Cypress

Les 7 specs suivantes sont passées :

- `app.cy.ts` : 1 test
- `dashboard-user.cy.ts` : 3 tests
- `download-file.cy.ts` : 3 tests
- `login.cy.ts` : 2 tests
- `register.cy.ts` : 2 tests
- `site-header.cy.ts` : 2 tests
- `upload-file.cy.ts` : 2 tests

Cypress a affiché un avertissement non bloquant indiquant qu'Electron est
déprécié comme navigateur de test. Il faudra prévoir Chrome ou un autre
navigateur supporté lors d'une prochaine mise à jour de Cypress.

Le scénario d'upload a également validé la conversion d'une URL backend
`/api/shares/<token>` en URL frontend `/download/<token>`.
