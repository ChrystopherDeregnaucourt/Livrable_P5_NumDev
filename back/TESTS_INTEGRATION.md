  

---
# Tests d'Intégration

---

## Controllers

### `AuthControllerIntegrationTest.java`

#### Teste `AuthController`

**Description:** Tests d'intégration pour le système d'authentification complet. Teste le comportement avec une vraie base de données H2 en mémoire, le contexte Spring complet chargé et les vrais composants (repositories, services, encodeurs, JWT, etc.). Valide l'intégration complète des couches Controller → Service → Repository → Database.

**Tests:**

**Authentification (POST /api/auth/login):**
- Test d'authentification réussie d'un utilisateur existant : vérification du code 200, présence du token JWT non vide, type "Bearer", ID utilisateur, username, prénom, nom et admin=false
- Test d'authentification réussie d'un utilisateur admin : vérification que le flag admin est à true dans la réponse
- Test d'échec avec mot de passe incorrect : vérification du code 401 Unauthorized
- Test d'échec avec email inexistant : vérification du code 401 Unauthorized
- Test de validation des champs obligatoires : vérification du code 400 pour email et password vides

**Inscription (POST /api/auth/register):**
- Test de création réussie d'un nouvel utilisateur : vérification du code 200, message "User registered successfully!", existence en base, et encodage du mot de passe (pas en clair)
- Test d'échec si l'email existe déjà : vérification du code 400 et message "Error: Email is already taken!"
- Test d'encodage correct du mot de passe : vérification que le mot de passe n'est pas stocké en clair et que passwordEncoder.matches() retourne true
- Test de validation du format de l'email : vérification du code 400 pour un email invalide

  
**Nombre de tests:** 9 tests

**Spécificité:** Ces tests utilisent une vraie base de données H2 en mémoire, le contexte Spring complet avec tous les beans (@SpringBootTest), et MockMvc pour simuler les requêtes HTTP. Ils valident l'intégration complète de l'authentification avec tous les composants réels.



### `SessionControllerIntegrationTest.java`

#### Teste `SessionController`

**Description:** Tests d'intégration pour le système de gestion des sessions de yoga. Teste le CRUD complet sur les sessions, la gestion de la participation des utilisateurs et l'authentification Spring Security simulée avec @WithMockUser.

**Tests:**

**Récupération de sessions:**
- Test de récupération réussie d'une session existante (GET /api/session/{id}) : vérification du code 200, de l'ID, nom, description et teacher_id
- Test de retour 404 pour une session inexistante : vérification du code 404 pour l'ID 9999
- Test de retour 400 pour un ID invalide : vérification du code 400 pour un ID non numérique
- Test de récupération de toutes les sessions (GET /api/session) : vérification du code 200, taille de la liste (2) et des noms des sessions

**Création et modification:**
- Test de création réussie d'une nouvelle session (POST /api/session) : vérification du code 200, du nom, de la description et du count en base (2 sessions)
- Test de mise à jour réussie d'une session (PUT /api/session/{id}) : vérification du code 200, du nom modifié et de la description modifiée
- Test de retour 400 pour un ID invalide lors de la mise à jour

**Suppression:**
- Test de suppression réussie d'une session (DELETE /api/session/{id}) : vérification du code 200 et de l'absence en base
- Test de retour 404 lors de la suppression d'une session inexistante

**Participation:**
- Test d'ajout réussi d'un participant (POST /api/session/{id}/participate/{userId}) : vérification du code 200, de la taille de la liste (1) et de l'ID de l'utilisateur
- Test de retrait réussi d'un participant (DELETE /api/session/{id}/participate/{userId}) : vérification du code 200 et de la liste vide
- Test de retour 400 pour un ID de session invalide lors de la participation
- Test de retour 400 pour un ID utilisateur invalide lors du retrait

  
**Nombre de tests:** 13 tests

**Spécificité:** Ces tests utilisent @WithMockUser pour simuler l'authentification Spring Security, une base de données H2 en mémoire, et valident l'intégration complète avec les repositories et les relations JPA (Session ↔ Teacher, Session ↔ Users).



### `TeacherControllerIntegrationTest.java`

#### Teste `TeacherController`

**Description:** Tests d'intégration pour l'API publique des professeurs. Teste la récupération de la liste des professeurs et d'un professeur par ID avec le contexte Spring complet et une base de données H2.

**Tests:**

**Récupération d'un professeur (GET /api/teacher/{id}):**
- Test de récupération réussie d'un professeur existant : vérification du code 200, de l'ID, prénom et nom
- Test de retour 404 pour un professeur inexistant : vérification du code 404 pour l'ID 9999
- Test de retour 400 pour un ID invalide : vérification du code 400 pour un ID non numérique
- Test de retour des informations complètes du professeur : vérification de la présence de id, firstName, lastName, createdAt et updatedAt

**Récupération de tous les professeurs (GET /api/teacher):**
- Test de récupération de tous les professeurs : vérification du code 200, taille de la liste (2) et des prénoms/noms
- Test de retour d'une liste vide si aucun professeur : vérification du code 200 et taille 0

**Nombre de tests:** 6 tests

**Spécificité:** Ces tests utilisent @WithMockUser, une base de données H2 en mémoire, et valident l'intégration complète Controller → Service → Repository → Database. Nettoyage de la base avec @BeforeEach et @AfterEach.

  

### `UserControllerIntegrationTest.java`

#### Teste `UserController`

**Description:** Tests d'intégration pour l'API de gestion des utilisateurs. Teste la récupération d'un utilisateur par ID et la suppression de compte avec vérification de l'autorisation basée sur l'email de l'utilisateur connecté.

**Tests:**

**Récupération d'un utilisateur (GET /api/user/{id}):**
- Test de récupération réussie d'un utilisateur existant : vérification du code 200, de l'ID, email, prénom, nom, admin et ABSENCE du mot de passe
- Test de retour 404 pour un utilisateur inexistant : vérification du code 404 pour l'ID 9999
- Test de retour 400 pour un ID invalide : vérification du code 400 pour un ID non numérique
- Test de retour des informations complètes de l'utilisateur : vérification de la présence de id, email, firstName, lastName, admin, createdAt et updatedAt
- Test que le mot de passe n'est JAMAIS retourné : vérification de l'absence du champ password dans la réponse JSON

**Suppression de compte (DELETE /api/user/{id}) - SÉCURITÉ CRITIQUE:**
- Test de suppression réussie de son propre compte (@WithMockUser(username = "test@example.com")) : vérification du code 200 et de l'absence en base
- Test d'interdiction de suppression du compte d'un autre utilisateur (@WithMockUser(username = "other@example.com")) : vérification du code 401 Unauthorized et de la présence en base
- Test de retour 404 pour un utilisateur inexistant lors de la suppression
- Test de retour 400 pour un ID invalide lors de la suppression

**Nombre de tests:** 9 tests

**Spécificité:** Ces tests sont **CRITIQUES pour la sécurité**. Ils valident que l'autorisation est correctement implémentée : seul l'utilisateur propriétaire peut supprimer son compte. @WithMockUser(username) simule l'authentification avec un email spécifique.

  

  

---
## Services

  

### `SessionServiceIntegrationTest.java`

#### Teste `SessionService`

**Description:** Tests d'intégration pour le service de gestion des sessions. Valide l'intégration Service → Repositories → Database H2 avec les opérations CRUD réelles, la gestion des relations JPA (Session ↔ Teacher, Session ↔ Users) et la gestion des participations utilisateurs.

**Tests:**

**Opérations CRUD:**
- Test de création réussie d'une nouvelle session en base : vérification que la session est créée, que l'ID n'est pas null et que la session existe en base
- Test de récupération d'une session existante par ID : vérification de l'ID, du nom et du teacher ID
- Test de retour null pour une session inexistante : vérification que getById(999L) retourne null
- Test de récupération de toutes les sessions : vérification de la taille (2) et des noms extraits
- Test de mise à jour réussie d'une session existante : vérification de l'ID conservé, du nom modifié et de la persistance en base
- Test de suppression réussie d'une session de la base : vérification de la présence avant, puis de l'absence après suppression

**Participation aux sessions:**
- Test d'ajout réussi d'un utilisateur à une session : vérification de la taille de la liste (1) et de l'ID de l'utilisateur
- Test d'exception NotFoundException si la session n'existe pas lors de la participation : vérification du type d'exception
- Test d'exception NotFoundException si l'utilisateur n'existe pas lors de la participation
- Test d'exception BadRequestException si l'utilisateur participe déjà : vérification du type d'exception

**Annulation de participation:**
- Test de retrait réussi d'un utilisateur d'une session : vérification de la taille avant (1) et après (0)
- Test d'exception NotFoundException si la session n'existe pas lors du retrait
- Test d'exception BadRequestException si l'utilisateur ne participe pas

**Cas complexes:**
- Test de gestion de plusieurs utilisateurs dans une session : vérification de la taille (2) et des IDs extraits
- Test d'un cycle de vie complet d'une session : création → ajout participant → mise à jour → retrait participant → suppression

**Nombre de tests:** 15 tests

**Spécificité:** Ces tests valident la logique métier complexe avec une vraie base de données H2 en mémoire. Ils testent les relations JPA et la persistance réelle des données.

  

### `TeacherServiceIntegrationTest.java`

#### Teste `TeacherService`

**Description:** Tests d'intégration pour le service de gestion des professeurs. Valide l'intégration Service → Repository → Database H2 avec les opérations de lecture réelles.

**Tests:**

**Récupération par ID:**
- Test de récupération réussie d'un enseignant existant dans la base : vérification de l'ID, prénom et nom
- Test de retour null pour un enseignant inexistant : vérification que findById(999L) retourne null
- Test de retour des données persistées en base : création de 3 enseignants et vérification des données du deuxième
- Test de gestion des valeurs null correctement : vérification qu'une exception est levée pour ID null
- Test de retour des timestamps créés par JPA : vérification que createdAt et updatedAt ne sont pas null

**Récupération de tous les enseignants:**
- Test de récupération de tous les enseignants : vérification de la taille (2) et des prénoms extraits
- Test de retour d'une liste vide si aucun enseignant : vérification de la liste vide après deleteAll
- Test de retour des enseignants dans l'ordre d'insertion : vérification de l'ordre (John, Second, Third)

**Intégration avec repository:**
- Test que le service utilise le vrai repository : création via repository et vérification que le service voit le nouvel enseignant

  
**Nombre de tests:** 9 tests

**Spécificité:** Ces tests valident le comportement du service avec une vraie base de données H2. Ils vérifient la persistance JPA (timestamps, ordre d'insertion) et l'intégration avec le repository.

  

### `UserServiceIntegrationTest.java`

#### Teste `UserService`

**Description:** Tests d'intégration pour le service de gestion des utilisateurs. Valide l'intégration Service → Repository → Database H2 avec les opérations CRUD réelles et le comportement avec base de données réelle.

**Tests:**

**Récupération par ID:**
- Test de récupération réussie d'un utilisateur existant dans la base : vérification de l'ID, email, prénom, nom, mot de passe et admin
- Test de retour null pour un utilisateur inexistant : vérification que findById(999L) retourne null
- Test de retour des données persistées en base : création de plusieurs utilisateurs et vérification des données du deuxième (admin=true)
- Test de gestion des valeurs null correctement : vérification qu'une exception est levée pour ID null
- Test de retour des timestamps créés par JPA : vérification que createdAt et updatedAt ne sont pas null

**Suppression:**
- Test de suppression réussie d'un utilisateur de la base : vérification de la présence avant, puis de l'absence après suppression
- Test de gestion de la suppression d'un utilisateur inexistant : vérification qu'une exception est levée
- Test de suppression puis recherche : vérification que findById retourne null après delete

**Intégration avec repository:**
- Test que le service utilise le vrai repository : vérification du count avant (1) et après (0) suppression

**Nombre de tests:** 9 tests

**Spécificité:** Ces tests valident le comportement du service avec une vraie base de données H2. Ils vérifient la persistance JPA (timestamps) et l'intégration avec le repository.

  

  

---
## Mappers

  

### `MappersIntegrationTest.java`

#### Teste `UserMapper`, `TeacherMapper` et `SessionMapper`

**Description:** Tests d'intégration pour les mappers MapStruct. Valide le mapping entre entités et DTOs avec les vrais mappers générés par MapStruct, les services injectés (pour SessionMapper) et le contexte Spring complet.

**Tests:**

**UserMapper:**
- Test de mapping User vers UserDto : vérification de tous les champs (ID, email, prénom, nom, admin, mot de passe, createdAt, updatedAt)
- Test de mapping UserDto vers User : vérification de tous les champs
- Test de gestion des valeurs null : vérification que toDto(null) retourne null

**TeacherMapper:**
- Test de mapping Teacher vers TeacherDto : vérification de tous les champs (ID, prénom, nom, createdAt, updatedAt)
- Test de mapping TeacherDto vers Teacher : vérification de tous les champs
- Test de gestion des valeurs null : vérification que toDto(null) retourne null
  
**SessionMapper:**
- Test de mapping Session vers SessionDto : vérification de tous les champs (ID, nom, description, date, teacher_id, users IDs, createdAt, updatedAt)
- Test de mapping d'une session sans utilisateurs : vérification que la liste users est vide
- Test de mapping SessionDto vers Session : vérification de tous les champs, du teacher ID et des users IDs
- Test de gestion d'une liste d'utilisateurs vide : vérification que la liste est vide
- Test de gestion des utilisateurs null : vérification que la liste est vide quand users=null
- Test de gestion des valeurs null : vérification que toDto(null) retourne null
- Test de round-trip (toEntity puis toDto) : vérification de la cohérence des données
- Test de mapping de plusieurs utilisateurs : vérification de la taille (2) et des IDs
- Test d'intégration complète avec services : vérification que le mapper utilise UserService et TeacherService pour charger les entités

**Nombre de tests:** 15 tests

**Spécificité:** Ces tests valident que les mappers générés par MapStruct fonctionnent correctement avec le contexte Spring complet. SessionMapper utilise @Autowired pour injecter UserService et TeacherService afin de charger les entités depuis la base.

  

  

---
## Security

  

### `SecurityIntegrationTest.java`

#### Teste la sécurité complète de l'application

**Description:** Tests d'intégration pour la sécurité de l'application. Valide l'ensemble de la chaîne de sécurité : génération et validation du token JWT, filtres de sécurité (AuthTokenFilter), UserDetailsService et chargement de l'utilisateur, accès aux endpoints protégés avec et sans authentification, et gestion des erreurs (401, 403).

**Tests:**

**Accès aux endpoints protégés:**
- Test d'accès réussi à un endpoint protégé avec token JWT valide : vérification du code 200 et de l'email de l'utilisateur
- Test de rejet de l'accès sans token JWT (401 Unauthorized) : vérification du code 401
- Test de rejet de l'accès avec token JWT invalide (401 Unauthorized) : vérification du code 401 avec token "invalid.signature"
- Test de rejet de l'accès avec token JWT malformé (401 Unauthorized) : vérification du code 401 avec "malformed.token"
- Test de rejet de l'accès sans préfixe 'Bearer' dans le header : vérification du code 401
- Test de rejet de l'accès avec header Authorization vide : vérification du code 401

**Validation du token JWT:**
- Test de validation du token JWT et extraction du username correctement : vérification du code 200, email, prénom et nom
- Test de génération de nouveaux tokens JWT valides lors de nouvelles connexions : vérification que les deux tokens permettent l'accès

**Endpoints publics:**
- Test d'accès aux endpoints publics sans authentification : vérification que POST /api/auth/login fonctionne sans token

**Cas spéciaux:**
- Test de gestion correcte de l'accès pour un utilisateur admin : création d'un admin, connexion et vérification de l'accès avec admin=true
- Test que le JWT contient les bonnes informations utilisateur : vérification de l'ID, email, prénom, nom et admin
  
**Nombre de tests:** 11 tests

**Spécificité:** Ces tests valident que la sécurité fonctionne correctement end-to-end avec tous les composants réels (JwtUtils, AuthTokenFilter, UserDetailsServiceImpl, PasswordEncoder, etc.). Ils utilisent une vraie base de données H2 et MockMvc pour simuler les requêtes HTTP.

    

---

  

## Résumé

**Total des fichiers de tests d'intégration:** 9 fichiers

**Répartition par catégorie:**
- **Controllers:** 4 fichiers (AuthController, SessionController, TeacherController, UserController)
- **Services:** 3 fichiers (SessionService, TeacherService, UserService)
- **Mappers:** 1 fichier (tous les mappers MapStruct)
- **Security:** 1 fichier (sécurité complète)

**Total approximatif de tests d'intégration:** ~96 tests

**Technologies utilisées:**
- JUnit 5 (Jupiter)
- Spring Boot Test (@SpringBootTest)
- MockMvc (simulation de requêtes HTTP)
- @WithMockUser (simulation d'authentification)
- Base de données H2 en mémoire (@ActiveProfiles("test"))
- AssertJ
- Jackson ObjectMapper (pour JSON)

**Points clés:**
- Tous les tests utilisent une vraie base de données H2 en mémoire
- Contexte Spring complet chargé (@SpringBootTest)
- Validation de l'intégration complète des couches
- Tests de la sécurité end-to-end (JWT, filtres, autorisation)
- Tests des relations JPA (Session ↔ Teacher, Session ↔ Users)
- Nettoyage de la base avec @BeforeEach et @AfterEach
- MockMvc pour simuler les requêtes HTTP
- Validation de la persistance réelle des données
  
**Différences avec les tests unitaires:**
- Tests d'intégration : vrais composants, vraie base de données, contexte Spring complet
- Tests unitaires : mocks, pas de base de données, composants isolés

**Objectif des tests d'intégration:**
Valider que tous les composants fonctionnent correctement ensemble dans un environnement proche de la production, avec une vraie base de données et le contexte Spring complet. Ils détectent les problèmes d'intégration que les tests unitaires ne peuvent pas détecter (ex: erreurs de configuration Spring, problèmes de mapping JPA, erreurs de sérialisation JSON, etc.).