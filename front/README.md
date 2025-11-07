# Yoga

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.1.0.

## Start the project

Git clone:

> git clone https://github.com/OpenClassrooms-Student-Center/P5-Full-Stack-testing

Go inside folder:

> cd yoga

Install dependencies:

> npm install

Launch Front-end:

> npm run start;


## Ressources

### Mockoon env 

### Postman collection

For Postman import the collection

> ressources/postman/yoga.postman_collection.json 

by following the documentation: 

https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman


### MySQL

SQL script for creating the schema is available `ressources/sql/script.sql`

By default the admin account is:
- login: yoga@studio.com
- password: test!1234


### Test

#### E2E Tests (Cypress)

📚 **Documentation complète des tests E2E** : [INDEX_TESTS_E2E.md](INDEX_TESTS_E2E.md)

**Quick Start :**
```bash
# Mode interactif (recommandé)
npm run cypress:open

# Mode headless (CI/CD)
npm run cypress:run

# Avec serveur automatique
npm run cypress:test
```

**Tests disponibles :**
- ✅ Login & Register (11 tests)
- ✅ Sessions CRUD (15+ tests)
- ✅ Profil utilisateur (5 tests)
- ✅ Navigation & Guards (10+ tests)
- ✅ Workflows complets (3 scénarios)

**Guides :**
- 🚀 [Quick Start](QUICK_START_E2E.md) - Démarrage en 3 étapes
- 📖 [Guide complet](TESTS_E2E_GUIDE.md) - Documentation détaillée
- 📝 [Index des tests](INDEX_TESTS_E2E.md) - Navigation rapide
- 📋 [Résumé](../RESUME_TESTS_E2E.md) - Vue d'ensemble

**Tests spécifiques :**
```bash
# Login uniquement
npx cypress run --spec "cypress/e2e/login.cy.ts"

# Sessions uniquement
npx cypress run --spec "cypress/e2e/sessions.cy.ts"

# Workflows complets
npx cypress run --spec "cypress/e2e/complete-workflow.cy.ts"
```

**Commandes personnalisées disponibles :**
```typescript
cy.loginAsAdmin()           // Login en tant qu'admin
cy.loginAsUser()            // Login en tant qu'utilisateur
cy.setupSessionIntercepts() // Configuration des intercepts
```

Generate coverage report (legacy):

> npm run e2e:coverage

Report is available here:

> front/coverage/lcov-report/index.html

#### Unitary test

Launching test:

> npm run test

for following change:

> npm run test:watch
