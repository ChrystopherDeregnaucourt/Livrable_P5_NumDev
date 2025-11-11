# Yoga App - Application Full Stack

  

Application de gestion de sessions de yoga développée en Java avec le framework  Spring Boot (back-end) et Angular (front-end).

  

## Table des matières

  

- [Prérequis](#-prérequis)

- [Installation de la base de données](#-installation-de-la-base-de-données)

- [Installation de l'application](#-installation-de-lapplication)

- [Lancement de l'application](#-lancement-de-lapplication)

- [Tests et couverture de code](#-tests-et-couverture-de-code)

- [Rapports de couverture](#-rapports-de-couverture)

- [Compte administrateur par défaut](#-compte-administrateur-par-défaut)

  

---

  

## Prérequis

  

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

  

- **Java JDK** 8 ou supérieur

- **Maven** 3.6 ou supérieur

- **Node.js** 14.x ou supérieur

- **npm** 6.x ou supérieur

- **MySQL** 8.0 ou supérieur (ou Docker pour exécuter MySQL via Docker Compose)

  

---

  

##  Installation de la base de données

  

### Option 1 : Utilisation de Docker (recommandé)

  

1. Assurez-vous que Docker et Docker Compose sont installés sur votre machine.

  

2. Naviguez vers le dossier contenant le fichier `docker-compose.yml` :

   ```bash

   cd ressources/MySQL

   ```

  

3. Lancez le conteneur MySQL :

   ```bash

   docker-compose up -d

   ```

  

4. Le script SQL sera automatiquement exécuté au démarrage du conteneur et créera :

   - La base de données `test`

   - Les tables nécessaires (USERS, TEACHERS, SESSIONS, PARTICIPATE)

   - Un compte administrateur par défaut

  

### Option 2 : Installation manuelle de MySQL

  

1. Installez MySQL 8.0 sur votre machine.

  

2. Créez la base de données :

   ```sql

   CREATE DATABASE test;

   ```

  

3. Exécutez le script SQL fourni :

   ```bash

   mysql -u user -p test < ressources/sql/script.sql

   ```

  

### Configuration de la connexion

  

Les paramètres de connexion par défaut sont :

- **Host** : `localhost`

- **Port** : `3306`

- **Database** : `test`

- **User** : `user`

- **Password** : `123456`

  

Ces paramètres peuvent être modifiés dans le fichier `back/src/main/resources/application.properties`.

  

---

  

## Installation de l'application

  

### Back-end (Spring Boot)

  

1. Naviguez vers le dossier `back` :

   ```bash

   cd back

   ```

  

2. Installez les dépendances Maven :

   ```bash

   mvn clean install

   ```

  

### Front-end (Angular)

  

1. Naviguez vers le dossier `front` :

   ```bash

   cd front

   ```

  

2. Installez les dépendances npm :

   ```bash

   npm install

   ```

  

---

  

## Lancement de l'application

  

### Démarrer le back-end

  

1. Depuis le dossier `back`, lancez l'application Spring Boot :

   ```bash

   mvn spring-boot:run

   ```

  

2. Le serveur démarre sur : **http://localhost:8080**

  

### Démarrer le front-end

  

1. Depuis le dossier `front`, lancez l'application Angular :

   ```bash

   npm run start

   ```

  

2. L'application est accessible sur : **http://localhost:4200**

  

---

  

## Tests et couverture de code

  

### Tests back-end (Spring Boot)

  

#### Tests unitaires et d'intégration

  

Depuis le dossier `back`, exécutez :

```bash

mvn clean test

```

  

Cette commande :

- Lance tous les tests unitaires et d'intégration

- Génère automatiquement le rapport de couverture JaCoCo

  

#### Fichiers de documentation des tests

Il est possible de consulter les plans de tests pour les tests unitaires et les tests d'intégration.
Deux fichiers ont été créés :

- **Tests unitaires** : `back/TESTS_UNITAIRES.md`

- **Tests d'intégration** : `back/TESTS_INTEGRATION.md`

  

### Tests front-end (Angular)

  

#### Tests unitaires (Jest)

  

Depuis le dossier `front` :

  

**Lancer tous les tests** :

```bash

npm run test

```

  

**Lancer les tests en mode watch** (surveillance des changements) :

```bash

npm run test:watch

```

  

**Lancer uniquement les tests unitaires** :

```bash

npm run test:unit

```

  

**Lancer uniquement les tests d'intégration** :

```bash

npm run test:integration

```

  

#### Tests end-to-end (Cypress)

  

**Mode interactif** (interface graphique - recommandé pour le développement) :

```bash

npm run cypress:open

```

  

**Mode headless** (ligne de commande - pour CI/CD) :

```bash

npm run cypress:run

```

  

**Lancer avec démarrage automatique du serveur** :

```bash

npm run cypress:test

```

  

**Exécuter un fichier de test spécifique** :

```bash

npx cypress run --spec "cypress/e2e/login.cy.ts"

npx cypress run --spec "cypress/e2e/sessions.cy.ts"

npx cypress run --spec "cypress/e2e/complete-workflow.cy.ts"

```

  

#### Fichiers de documentation des tests

Il est possible de consulter les plans de tests pour les tests unitaires et les tests d'intégration.
Deux fichiers ont été créés :

- **Tests unitaires** : `front/TESTS_UNITAIRES.md`

- **Tests d'intégration** : `front/TESTS_INTEGRATION.md`

- Tests E2E :  `front/TESTS_E2E.md`

  

---

  

## Rapports de couverture

  

### Back-end (JaCoCo)

  

#### Générer le rapport

  

Le rapport est généré automatiquement lors de l'exécution des tests :

```bash

mvn clean test

```

  

#### Consulter le rapport

  

Le rapport de couverture JaCoCo est disponible à :

```

back/target/site/jacoco/index.html

```

  

**Ouvrir le rapport** :

- Double-cliquez sur le fichier `index.html`, ou

- Utilisez la commande :

  ```bash

  start back/target/site/jacoco/index.html

  ```

  

#### Captures d'écran

  ![[Pasted image 20251109065041.png]]

Les captures d'écran du rapport de couverture back-end montre :

- **Couverture globale** : 86% d'instructions, 62% de branches

- **Détail par package** : couverture des modèles, services, contrôleurs, etc.

  

### Front-end (Jest + Istanbul)

  

#### Générer le rapport

  

Les rapports sont générés automatiquement lors de l'exécution des tests :

```bash

npm run test

```

  

#### Consulter le rapport

  

Le rapport de couverture est disponible à :

```

front/coverage/lcov-report/index.html

```

  

**Ouvrir le rapport** :

```powershell

Start-Process front/coverage/lcov-report/index.html

```

  

Ou double-cliquez sur le fichier `index.html`.

  

#### Métriques de couverture

  

D'après les rapports :

- **Statements** : 97.53%

- **Branches** : 95.45%

- **Functions** : 98.94%

- **Lines** : 97.15%

  

#### Captures d'écran

Capture d'écran des tests E2E :

![[Pasted image 20251109065128.png]]

Capture d'écran des tests unitaires et d'intégration :

![[Pasted image 20251109065700.png]]

Les captures d'écran montres :

- Vue d'ensemble de la couverture

- Détail par composant, service et intercepteur

- Couverture à 100% pour la plupart des fichiers critiques

  

### Tests end-to-end (Cypress + NYC)

  

#### Générer le rapport de couverture E2E

  

Après avoir exécuté les tests Cypress, générez le rapport :

```bash

npm run e2e:coverage

```

  

#### Consulter le rapport

  

Le rapport est disponible dans le même dossier que les tests unitaires :

```

front/coverage/lcov-report/index.html

```

  

#### Métriques

  

Les tests E2E couvrent :

- **11 tests** pour Login & Register

-  **15+ tests** pour les Sessions (CRUD complet)

-  **5 tests** pour le profil utilisateur

-  **10+ tests** pour la navigation et les guards

-  **3 scénarios** de workflows complets

  

---

  

## Compte administrateur par défaut

  

L'application est livrée avec un compte administrateur pré-configuré :

  

- **Email** : `yoga@studio.com`

- **Mot de passe** : `test!1234`

  

Ce compte permet d'accéder aux fonctionnalités d'administration (création/modification/suppression de sessions).

  

---

  

## Documentation supplémentaire

  

### Collection Postman

  

Une collection Postman complète est disponible pour tester l'API :

```

ressources/postman/yoga.postman_collection.json

```

  

**Importer la collection** :

1. Ouvrez Postman

2. Cliquez sur "Import"

3. Sélectionnez le fichier `yoga.postman_collection.json`

  

Documentation : [Importing data into Postman](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman)

  


---

  

## Technologies utilisées

  

### Back-end

- Java 8

- Spring Boot 2.6.1

- Spring Security (JWT)

- Spring Data JPA

- MySQL 8.0

- Maven

- JaCoCo (couverture de code)

- JUnit 5 & Mockito (tests)

  

### Front-end

- Angular 14

- Angular Material

- RxJS

- TypeScript

- Jest (tests unitaires)

- Cypress (tests E2E)

- Istanbul/NYC (couverture de code)

  

---

  

## Licence

  

Ce projet a été développé dans le cadre de la formation OpenClassrooms.

  

---

  

## Auteur

  

Projet réalisé dans le cadre du parcours Développeur Full Stack - Java et Angular