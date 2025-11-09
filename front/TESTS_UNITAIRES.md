# Tests Unitaires

---

# Composants

## `front/src/app/app.component.ts`

#### Teste `AppComponent`

Permet juste de tester s'il est possible de créer le composant de l'application

**Tests de création** :
- ✅ Création du composant

**Nombre de tests** : 1 test

## `\front\src\app\components\me\me.component.spec.ts`
#### Teste `MeComponent`

Pourquoi fakeAsync ? 
Méthode d'Angular qui permet d'utiliser des méthodes qui utilises des observables.
Le flush() est utilisé pour forcer l'exécution immédiate de tous les observables. (c'est comme appuyer sur le bouton avance rapide ) 

**Description :** Composant de gestion du profil utilisateur (affichage et suppression de compte)

**Tests :**

**Création du composant :**

- Le composant doit être créé correctement

**ngOnInit (Chargement des données utilisateur) :**

- Lorsque le composant est initialisé : on vérifie que le service [UserService.getById](vscode-file://vscode-app/c:/Users/dereg/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) est appelé avec l'ID de l'utilisateur connecté, que les informations utilisateur sont chargées et stockées dans [component.user](vscode-file://vscode-app/c:/Users/dereg/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
- La récupération de l'ID depuis la session : on vérifie que l'ID utilisateur est correctement extrait de [sessionInformation](vscode-file://vscode-app/c:/Users/dereg/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html), que l'appel API utilise le bon ID (sécurité : empêche l'affichage du profil d'un autre utilisateur)

**back (Navigation retour) :**

- Lorsqu'on clique sur le bouton retour : on vérifie que la fonction [window.history.back()](vscode-file://vscode-app/c:/Users/dereg/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) est appelée pour retourner à la page précédente

**delete (Suppression de compte) :**

- Lorsqu'un utilisateur supprime son compte : on vérifie que [UserService.delete](vscode-file://vscode-app/c:/Users/dereg/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) est appelé avec l'ID utilisateur, qu'un message de confirmation est affiché via MatSnackBar, que l'utilisateur est déconnecté ([SessionService.logOut](vscode-file://vscode-app/c:/Users/dereg/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)), que la redirection vers la page d'accueil (`/`) est effectuée
- L'appel de suppression avec le bon ID depuis la session : on vérifie que la suppression utilise l'ID de l'utilisateur connecté (sécurité : garantit qu'on supprime le bon compte)
- L'ordre d'exécution déconnexion puis redirection : on vérifie que [logOut](vscode-file://vscode-app/c:/Users/dereg/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) est appelé, que la navigation vers `/` est effectuée après la déconnexion (sécurité : l'utilisateur ne doit pas rester connecté après suppression)

**Affichage des informations utilisateur :**

- Après chargement des données : on vérifie que toutes les informations utilisateur sont disponibles dans le composant (email, firstName, lastName), que les données sont prêtes pour l'affichage dans le template

**Nombre de tests :** 8 tests

---
# Services

## `front/src/app/services/user.service.ts`
#### Teste `UserService`

expectOne vérifie qu'une seule requête a été effectuée (Pas 2 ni 0)

**Description :** Service de gestion des communications HTTP avec l'API utilisateur (opérations CRUD)

**Tests :**

**Création du service :**

- Le service doit être créé correctement

**getById (Récupération d'utilisateur par ID) :**

- Lorsqu'on récupère un utilisateur par son ID : on vérifie que la requête HTTP GET est correctement envoyée, que l'utilisateur retourné correspond aux données attendues (id, email, firstName, lastName), que la réponse est transformée en objet User
- La construction de l'URL avec l'ID utilisateur : on vérifie que l'endpoint appelé est correct (`api/user/{id}`), que la méthode HTTP utilisée est bien GET
- Gestion d'erreur 404 (utilisateur non trouvé) : on vérifie que l'erreur est correctement propagée, que le code de statut HTTP est bien 404, que le message d'erreur est récupéré

**delete (Suppression d'utilisateur) :**

- Lorsqu'on supprime un utilisateur par son ID : on vérifie que la requête HTTP DELETE est correctement envoyée, que la réponse confirme la suppression
- La construction de l'URL DELETE avec l'ID : on vérifie que l'endpoint appelé est correct (`api/user/{id}`), que la méthode HTTP utilisée est bien DELETE
- Gestion d'erreur 500 (échec de suppression) : on vérifie que l'erreur est correctement propagée, que le code de statut HTTP est bien 500, que le message d'erreur est récupéré
- Gestion d'erreur 401 (non autorisé) : on vérifie que l'erreur d'autorisation est correctement gérée, que le code de statut HTTP est bien 401, empêchant ainsi un utilisateur de supprimer le compte d'un autre

**Cohérence des endpoints API :**

- Vérification du chemin de base pour toutes les requêtes : on vérifie que tous les appels HTTP (GET et DELETE) utilisent bien le préfixe `api/user`

**Nombre de tests :** 8 tests

## `front\src\app\services\teacher.service.spec.ts`
#### Teste `TeacherService`

**Description :** Service de gestion des communications HTTP avec l'API des professeurs (affichage liste et détails)

**Tests :**

**Création du service :**

- Le service doit être créé correctement

**Get all teachers (Récupération de tous les professeurs) :**

- Lorsqu'on récupère la liste complète des professeurs : on vérifie que la requête HTTP GET est correctement envoyée vers `api/teacher`, que la liste retournée correspond aux données attendues, que le nombre de professeurs est correct
- Cas limite - liste vide : on vérifie que le service retourne un tableau vide lorsqu'aucun professeur n'existe, que la longueur du tableau est 0
- Gestion d'erreur HTTP 500 : on vérifie que l'erreur serveur est correctement propagée, que le code de statut HTTP est bien 500
- Vérification de l'endpoint API : on vérifie que l'URL appelée est bien `api/teacher`

**Get teacher detail (Récupération d'un professeur par ID) :**

- Lorsqu'on récupère un professeur par son ID : on vérifie que la requête HTTP GET est correctement envoyée vers `api/teacher/{id}`, que les données du professeur retournées sont complètes (id, firstName, lastName), que la méthode HTTP utilisée est bien GET
- Vérification de l'endpoint avec l'ID : on vérifie que l'URL construite contient bien l'ID fourni (`api/teacher/42`), que la méthode HTTP est GET
- Gestion d'erreur 404 (professeur non trouvé) : on vérifie que l'erreur est correctement propagée, que le code de statut HTTP est bien 404, que le message d'erreur indique "Not Found"
- Test avec différents IDs : on vérifie que le service gère correctement plusieurs IDs différents (1, 5, 10, 100), que l'URL est correctement construite pour chaque ID
- Vérification de la structure complète des données : on vérifie que toutes les propriétés du professeur sont présentes (id, firstName, lastName, createdAt, updatedAt), que les types de données sont corrects (number pour id, string pour les noms)
- Gestion d'erreur 401 (non autorisé) : on vérifie que l'erreur d'autorisation est correctement gérée, que le code de statut HTTP est bien 401

**Configuration du chemin API :**

- Vérification du chemin de base pour tous les endpoints : on vérifie que `all()` utilise bien `api/teacher`, que `detail()` utilise bien `api/teacher/{id}`

**Méthodes HTTP :**

- Vérification de la méthode GET pour `all()` : on vérifie que la méthode HTTP est bien GET
- Vérification de la méthode GET pour `detail()` : on vérifie que la méthode HTTP est bien GET

**Nombre de tests :** 16 tests

## `front/src/app/services/session.service.spec.ts`

#### Teste `SessionService`

**Description :** Service de gestion de l'état de session utilisateur global

Tests :
Etat initial :
- Etat initial du service (Islogged doit être à false au départ)
- Ne doit pas avoir d'information de session
- L'observable $isLogged ne doit être false

LogIn :
- Lorsque l'utilisateur se connecte : on doit vérifier si l'état  du service est mis à jour (isLogged = true), si on récupére bien les informations de l'utilisateur, On vérifie que l'observable émet bien la nouvelle valeur (true)
- Lorsque l'utilisateur se connecte en mode admin : on vérifie si l'état  du service est mis à jour (isLogged = true), si on récupére bien les informations de l'utilisateur, on vérifie qu'on soit bien en mode admin, on vérifie que l'observable émet bien la nouvelle valeur (true)

LogOut :
- Lorsque l'utilisateur se connecte, puis se déconnecte : on vérifie si l'état du service est mis à jour (isLogged = false), si les informations de la session sont bien à l'état "Undifined",  on vérifie que l'observable émet bien la nouvelle valeur (false)
- Lorsque l'utilisateur de déconnecte sans être connecté avant : on vérifie si l'état du service est mis à jour (isLogged = false), si les informations de la session sont bien à l'état "Undifined",  on vérifie que l'observable émet bien la nouvelle valeur (false)

Changement d'état de l'observable lors d'un login et suivi d'un logout :
- Lorsque l'utilisateur se connecte et se déconnecte : on vérifie que l'observable prenne bien les états (false, true, false), on vérifie qu'il y ai bien eu 3 émissions. 

**Nombre de tests :** 10 tests

## `front\src\app\services\user.service.spec.ts`
#### Teste `UserService`

**Description :** Service de gestion des communications HTTP avec l'API utilisateur (opérations CRUD)

**Tests :**

**Création du service :**

- Le service doit être créé correctement

**getById (Récupération d'utilisateur par ID) :**

- Lorsqu'on récupère un utilisateur par son ID : on vérifie que la requête HTTP GET est correctement envoyée, que l'utilisateur retourné correspond aux données attendues (id, email, firstName, lastName), que la réponse est transformée en objet User
- La construction de l'URL avec l'ID utilisateur : on vérifie que l'endpoint appelé est correct (`api/user/{id}`), que la méthode HTTP utilisée est bien GET
- Gestion d'erreur 404 (utilisateur non trouvé) : on vérifie que l'erreur est correctement propagée, que le code de statut HTTP est bien 404, que le message d'erreur est récupéré

**delete (Suppression d'utilisateur) :**

- Lorsqu'on supprime un utilisateur par son ID : on vérifie que la requête HTTP DELETE est correctement envoyée, que la réponse confirme la suppression
- La construction de l'URL DELETE avec l'ID : on vérifie que l'endpoint appelé est correct (`api/user/{id}`), que la méthode HTTP utilisée est bien DELETE
- Gestion d'erreur 500 (échec de suppression) : on vérifie que l'erreur est correctement propagée, que le code de statut HTTP est bien 500, que le message d'erreur est récupéré
- Gestion d'erreur 401 (non autorisé) : on vérifie que l'erreur d'autorisation est correctement gérée, que le code de statut HTTP est bien 401, empêchant ainsi un utilisateur de supprimer le compte d'un autre

**Cohérence des endpoints API :**

- Vérification du chemin de base pour toutes les requêtes : on vérifie que tous les appels HTTP (GET et DELETE) utilisent bien le préfixe `api/user`

**Nombre de tests :** 8 tests

---
# Guards

## `front\src\app\guards\auth.guard.spec.ts`

#### Teste `AuthGuard`

**Description :** Garde de route d'authentification - Protection des pages nécessitant une connexion utilisateur

**Tests :**

**Création du guard :**

- Le guard doit être créé correctement

**canActivate (Contrôle d'accès aux routes protégées) :**

- Autorisation d'accès si l'utilisateur est connecté : on vérifie que `canActivate()` retourne `true` quand `isLogged` est à `true`, qu'aucune redirection n'est effectuée (l'utilisateur peut accéder à la route)
- Refus d'accès et redirection si l'utilisateur n'est pas connecté : on vérifie que `canActivate()` retourne `false` quand `isLogged` est à `false`, que `Router.navigate` est appelé avec `['login']` pour rediriger vers la page de connexion
- Gestion correcte de plusieurs appels : on vérifie le comportement avec un premier appel (utilisateur non connecté → redirection), puis un deuxième appel (utilisateur connecté → accès autorisé), que le guard s'adapte dynamiquement à l'état de connexion
- Redirection systématique vers login pour utilisateur non authentifié : on vérifie qu'après plusieurs tentatives d'accès (3 fois), la redirection est toujours effectuée, que `navigate` est appelé 3 fois avec `['login']`

**Nombre de tests :** 5 tests

## `front/src/app/guards/unauth.guard.ts`

#### Teste `UnauthGuard`

**Description :** Garde de route pour pages publiques - Empêche les utilisateurs connectés d'accéder aux pages d'authentification (login/register)

**Tests :**

**Création du guard :**

- Le guard doit être créé correctement

**canActivate (Contrôle d'accès aux pages publiques) :**

- Autorisation d'accès si l'utilisateur n'est PAS connecté : on vérifie que `canActivate()` retourne `true` quand `isLogged` est à `false`, qu'aucune redirection n'est effectuée (utilisateur non connecté peut accéder à login/register)
- Refus d'accès et redirection si l'utilisateur EST connecté : on vérifie que `canActivate()` retourne `false` quand `isLogged` est à `true`, que `Router.navigate` est appelé avec `['rentals']` pour rediriger vers la liste des sessions
- Accès à la page login autorisé pour utilisateur non authentifié : on vérifie qu'un utilisateur non connecté peut accéder à la page de login, qu'aucune redirection n'est déclenchée
- Blocage d'accès à la page login pour utilisateur déjà authentifié : on vérifie qu'un utilisateur déjà connecté ne peut pas accéder à la page login, qu'il est redirigé vers `['rentals']`
- Gestion du changement d'état de session : on vérifie le comportement lors d'un changement d'état (non connecté → connecté), que le guard s'adapte dynamiquement à l'état de connexion, qu'en Phase 1 (non connecté) l'accès est autorisé, qu'en Phase 2 (connecté) l'accès est bloqué avec redirection
- Redirection cohérente des utilisateurs authentifiés : on vérifie qu'après plusieurs tentatives d'accès (3 fois) d'un utilisateur connecté, la redirection est systématiquement effectuée, que `navigate` est appelé 3 fois avec `['rentals']`

**Nombre de tests :** 7 tests

## `front\src\app\interceptors\jwt.interceptor.spec.ts`

#### Teste `JwtInterceptor`

**Description :** Intercepteur HTTP JWT - Injection automatique du token d'authentification sur toutes les requêtes API

**Tests :**

**Création de l'intercepteur :**

- L'intercepteur doit être créé correctement

**intercept (Interception et modification des requêtes HTTP) :**

- Ajout de l'en-tête Authorization quand l'utilisateur est connecté : on vérifie que l'intercepteur ajoute automatiquement l'en-tête `Authorization` sur les requêtes HTTP, que le format est correct (`Bearer test-token-123`), que cela fonctionne pour toutes les requêtes sortantes
- Pas d'ajout de l'en-tête Authorization quand l'utilisateur n'est pas connecté : on vérifie que l'intercepteur n'ajoute pas d'en-tête `Authorization` si l'utilisateur est déconnecté, que les requêtes publiques (login, register) ne sont pas modifiées
- Ajout correct de l'en-tête Authorization pour un utilisateur admin : on vérifie que l'intercepteur fonctionne également pour les utilisateurs administrateurs, que le token admin est correctement injecté (`Bearer admin-token-456`), que cela fonctionne sur les endpoints admin
- Gestion de plusieurs requêtes avec différents états de connexion : on vérifie le comportement dynamique de l'intercepteur lors de changements d'état, qu'en Phase 1 (déconnecté) aucun en-tête n'est ajouté, qu'en Phase 2 (connecté) l'en-tête est ajouté, qu'en Phase 3 (déconnecté à nouveau) l'en-tête n'est plus ajouté
- Préservation des en-têtes existants lors de l'ajout de Authorization : on vérifie que l'intercepteur n'écrase pas les en-têtes personnalisés existants (`Custom-Header`, `Content-Type`), que tous les en-têtes coexistent correctement (Authorization + en-têtes personnalisés)
- Fonctionnement avec différentes méthodes HTTP : on vérifie que l'intercepteur fonctionne avec GET, POST, PUT, DELETE, que le token est ajouté quelle que soit la méthode HTTP utilisée, que toutes les requêtes CRUD sont sécurisées automatiquement

**Nombre de tests :** 7 tests

---
# Features
## `front\src\app\features\auth\components\login\login.component.spec.ts`

#### Teste `LoginComponent`

**Description :** Composant de connexion - Point d'entrée principal de l'application (authentification utilisateur)

**Tests :**

**Création du composant :**

- Le composant doit être créé correctement

**Validation du formulaire :**

- État initial du formulaire : on vérifie que le formulaire est invalide au démarrage (champs vides)
- Validation du champ email : on vérifie que le champ email est requis (erreur `required` présente si vide), qu'un email valide rend le champ valide

**submit (Soumission du formulaire) :**

- Connexion réussie d'un utilisateur standard : on vérifie que `AuthService.login` est appelé avec les bonnes credentials (email/password), que `SessionService.logIn` est appelé avec les informations de session reçues, que la navigation vers `/sessions` est effectuée, que `onError` reste à `false`
- Gestion d'erreur de connexion (credentials invalides) : on vérifie que `AuthService.login` est appelé, que `SessionService.logIn` n'est pas appelé, que la navigation n'est pas effectuée, que `onError` passe à `true` pour afficher le message d'erreur
- Connexion après un état d'erreur : on vérifie qu'après une erreur précédente (`onError = true`), une nouvelle tentative réussie appelle bien `SessionService.logIn`, effectue la navigation vers `/sessions`
- Connexion réussie d'un utilisateur admin : on vérifie que `AuthService.login` est appelé avec les credentials admin, que `SessionService.logIn` est appelé avec les informations admin (y compris `admin: true`), que la navigation vers `/sessions` est effectuée

**Basculement de visibilité du mot de passe :**

- État initial : on vérifie que le mot de passe est masqué par défaut (`hide = true`)
- Basculement de la visibilité : on vérifie que le changement de `hide` permet d'afficher/masquer le mot de passe, que le basculement fonctionne dans les deux sens

**Gestion des erreurs :**

- Affichage du message d'erreur : on vérifie que lorsque `onError = true`, l'état est accessible pour l'affichage dans le template
- État initial sans erreur : on vérifie qu'aucune erreur n'est présente au démarrage (`onError = false`)

**Nombre de tests :** 11 tests
## `front\src\app\features\auth\components\register\register.component.spec.ts`

## ==/!\ Il y a un bug !!!==
On utilise Validators.max au lieu de Validators.maxLength
On utilise Validators.min au lieu de Validators.minLength

## ==/!\ Autre problème==, le reset de l'erreur n'est pas fait dans le composant. On est obligé de faire un component.onError = false;

#### Teste `RegisterComponent`

**Description :** Composant d'inscription - Formulaire de création de nouveaux comptes utilisateurs

**Tests :**

**Création du composant :**

- Le composant doit être créé correctement

**Initialisation du formulaire :**

- État initial avec valeurs vides : on vérifie que tous les champs (email, firstName, lastName, password) sont vides au démarrage
- Présence de tous les contrôles requis : on vérifie que tous les champs du formulaire sont définis et accessibles
- État initial de l'erreur : on vérifie que `onError` est à `false` au démarrage (aucune erreur affichée)

**Validation du formulaire :**

- Formulaire vide invalide : on vérifie que le formulaire est invalide quand tous les champs sont vides
- Champ email requis : on vérifie que l'erreur `required` est présente si le champ email est vide
- Validation du format email : on vérifie qu'un email invalide (`invalid-email`) génère une erreur de format, qu'un email valide (`test@example.com`) est accepté
- Champ firstName requis : on vérifie que l'erreur `required` est présente si le champ firstName est vide
- Champ lastName requis : on vérifie que l'erreur `required` est présente si le champ lastName est vide
- Champ password requis : on vérifie que l'erreur `required` est présente si le champ password est vide
- Validation longueur minimale firstName : on vérifie le comportement du validateur avec différentes longueurs de prénom
- Validation longueur maximale firstName : on vérifie le comportement du validateur avec des prénoms de différentes longueurs
- Validation longueur minimale lastName : on vérifie le comportement du validateur avec différentes longueurs de nom
- Validation longueur maximale lastName : on vérifie le comportement du validateur avec des noms de différentes longueurs
- Validation longueur minimale password : on vérifie le comportement du validateur avec différentes longueurs de mot de passe
- Validation longueur maximale password : on vérifie le comportement du validateur avec des mots de passe de différentes longueurs
- Formulaire valide avec données correctes : on vérifie qu'un formulaire correctement rempli (email valide, tous les champs remplis) est valide

**submit (Soumission du formulaire) :**

- Appel du service avec les valeurs du formulaire : on vérifie que `AuthService.register` est appelé avec les bonnes données (email, firstName, lastName, password)
- Navigation vers la page de connexion après succès : on vérifie que `Router.navigate` est appelé avec `['/login']` après une inscription réussie
- Gestion d'erreur lors de l'inscription : on vérifie que `onError` passe à `true` en cas d'échec, que la navigation n'est pas effectuée
- Pas de navigation en cas d'erreur : on vérifie que `Router.navigate` n'est pas appelé si l'inscription échoue (email déjà existant), que `onError` est à `true` pour afficher le message d'erreur
- Gestion des erreurs serveur : on vérifie que les erreurs HTTP 500 sont gérées correctement, que `onError` passe à `true`

**Gestion de l'état d'erreur :**

- Réinitialisation de l'erreur lors d'une nouvelle tentative : on vérifie qu'après un échec (`onError = true`), une nouvelle tentative peut réinitialiser l'état d'erreur, que le flux d'inscription peut reprendre normalement

**Tests de validation multiple :**

- Validation de tous les champs avant soumission : on vérifie qu'un formulaire invalide (email invalide, champs vides) est bien détecté, que toutes les erreurs sont présentes simultanément pour chaque champ concerné

**Nombre de tests :** 20 tests

## `front\src\app\features\auth\services\auth.service.spec.ts`

#### Teste `AuthService`

**Description :** Service d'authentification - Gestion des appels HTTP pour la connexion et l'inscription

**Tests :**

**Création du service :**

- Le service doit être créé correctement

**register (Inscription d'un nouvel utilisateur) :**

- Inscription réussie d'un nouvel utilisateur : on vérifie que la requête HTTP POST est envoyée vers `api/auth/register`, que le corps de la requête contient les données d'inscription (email, firstName, lastName, password), que la réponse est vide (void/undefined) en cas de succès
- Gestion d'erreur - email déjà existant : on vérifie que l'erreur HTTP 400 (Bad Request) est correctement propagée, que le service gère le cas où l'email est déjà utilisé
- Gestion d'erreur - données invalides : on vérifie que l'erreur HTTP 422 (Unprocessable Entity) est correctement gérée, que la validation côté serveur refuse les données invalides (email mal formaté, champs vides, mot de passe trop court)

**login (Connexion d'un utilisateur) :**

- Connexion réussie d'un utilisateur standard : on vérifie que la requête HTTP POST est envoyée vers `api/auth/login`, que le corps de la requête contient les credentials (email, password), que la réponse retourne les informations de session (token, id, username, firstName, lastName, admin), que le token JWT est bien reçu, que le flag `admin` est à `false`
- Connexion réussie d'un utilisateur administrateur : on vérifie que la requête HTTP POST est envoyée correctement, que la réponse retourne les informations de session admin, que le flag `admin` est à `true`
- Gestion d'erreur - credentials invalides : on vérifie que l'erreur HTTP 401 (Unauthorized) est correctement propagée, que le service gère le cas où le mot de passe est incorrect
- Gestion d'erreur - utilisateur non trouvé : on vérifie que l'erreur HTTP 404 (Not Found) est correctement gérée, que le service gère le cas où l'email n'existe pas en base de données
- Gestion d'erreur - requête vide : on vérifie que l'erreur HTTP 400 (Bad Request) est correctement propagée, que le service refuse les requêtes avec email et password vides

**Nombre de tests :** 9 tests
## `front\src\app\features\sessions\components\detail\detail.component.spec.ts`

#### Teste `DetailComponent`

**Description :** Composant de détail d'une session - Affichage, participation/désinscription et suppression de session

**Tests :**

**Création du composant :**

- Le composant doit être créé correctement

**Initialisation du constructeur :**

- Initialisation du sessionId depuis les paramètres de route : on vérifie que l'ID de la session est correctement extrait des paramètres d'URL
- Initialisation du userId depuis les informations de session : on vérifie que l'ID de l'utilisateur connecté est récupéré depuis `SessionService`
- Initialisation de isAdmin depuis les informations de session : on vérifie que le statut admin est correctement récupéré (false par défaut)
- Définition de isAdmin à true pour les administrateurs : on vérifie que `isAdmin` est à `true` quand l'utilisateur est admin

**ngOnInit (Chargement initial) :**

- Chargement des détails de la session à l'initialisation : on vérifie que `SessionApiService.detail` est appelé avec l'ID de la session, que les données de session sont stockées dans `component.session`
- Chargement des détails du professeur après chargement de la session : on vérifie que `TeacherService.detail` est appelé avec l'ID du professeur (teacher_id), que les données du professeur sont stockées dans `component.teacher`
- Définition de isParticipate à true si l'utilisateur participe : on vérifie que `isParticipate` est à `true` quand l'ID utilisateur est dans le tableau `users` de la session
- Définition de isParticipate à false si l'utilisateur ne participe pas : on vérifie que `isParticipate` est à `false` quand l'ID utilisateur n'est pas dans le tableau `users`

**back (Navigation retour) :**

- Navigation retour dans l'historique du navigateur : on vérifie que `window.history.back()` est appelée pour retourner à la page précédente

**delete (Suppression de session) :**

- Suppression d'une session et affichage d'un message de succès : on vérifie que `SessionApiService.delete` est appelé avec l'ID de la session, qu'un message "Session deleted !" est affiché via `MatSnackBar`, que la navigation vers la liste des sessions est effectuée
- Redirection vers la liste des sessions après suppression : on vérifie que `Router.navigate` est appelé avec `['sessions']`
- Suppression de la session correcte basée sur sessionId : on vérifie que la bonne session (par son ID) est supprimée

**participate (Participation à une session) :**

- Ajout de l'utilisateur à la session : on vérifie que `SessionApiService.participate` est appelé avec l'ID de la session et l'ID de l'utilisateur, que les détails de la session sont rechargés après participation
- Rafraîchissement des données de session après participation : on vérifie que `SessionApiService.detail` est appelé pour mettre à jour les données affichées
- Utilisation des IDs corrects pour l'utilisateur et la session : on vérifie que les bons IDs sont passés à l'API

**unParticipate (Désinscription d'une session) :**

- Retrait de l'utilisateur de la session : on vérifie que `SessionApiService.unParticipate` est appelé avec l'ID de la session et l'ID de l'utilisateur, que les détails de la session sont rechargés après désinscription
- Rafraîchissement des données de session après désinscription : on vérifie que `SessionApiService.detail` est appelé pour mettre à jour les données affichées
- Utilisation des IDs corrects pour l'utilisateur et la session : on vérifie que les bons IDs sont passés à l'API

**fetchSession (Méthode privée - mise à jour du statut de participation) :**

- Mise à jour de isParticipate quand l'utilisateur rejoint : on vérifie que `isParticipate` passe à `true` quand l'ID utilisateur est ajouté au tableau `users`
- Mise à jour de isParticipate quand l'utilisateur quitte : on vérifie que `isParticipate` passe à `false` quand l'ID utilisateur est retiré du tableau `users`

**Nombre de tests :** 22 tests

## `front\src\app\features\sessions\components\form\form.component.spec.ts`

#### Teste `FormComponent`

**Description :** Composant de formulaire de session - Création et modification de sessions (fonctionnalité administrative)

**Tests :**

**Création du composant :**

- Le composant doit être créé correctement

**ngOnInit - Contrôle d'accès admin :**

- Redirection des utilisateurs non-admin : on vérifie que les utilisateurs non-admin (`admin = false`) sont redirigés vers la liste des sessions (`/sessions`), empêchant l'accès au formulaire de création/modification
- Autorisation d'accès pour les admin : on vérifie que les utilisateurs admin (`admin = true`) peuvent accéder au formulaire, que le formulaire est correctement initialisé

**ngOnInit - Mode création :**

- Initialisation d'un formulaire vide en mode création : on vérifie que `onUpdate` est à `false`, que tous les champs du formulaire sont vides au démarrage
- Chargement de la liste des professeurs : on vérifie que `TeacherService.all` est appelé, que la liste des professeurs est disponible dans `teachers$` Observable
- Présence de tous les contrôles requis : on vérifie que le formulaire contient les champs `name`, `date`, `teacher_id`, `description`
- Définition des validateurs requis sur tous les champs : on vérifie que tous les champs ont l'erreur `required` quand ils sont vides

**ngOnInit - Mode modification :**

- Chargement de la session existante en mode modification : on vérifie que `onUpdate` est à `true`, que `SessionApiService.detail` est appelé avec l'ID de la session à modifier
- Pré-remplissage du formulaire avec les données existantes : on vérifie que le formulaire est rempli avec les données de la session (name, description, teacher_id)
- Formatage correct de la date pour l'input : on vérifie que la date est formatée au format `YYYY-MM-DD` pour l'input HTML de type date

**submit - Création de session :**

- Création d'une nouvelle session avec les données du formulaire : on vérifie que `SessionApiService.create` est appelé avec les données du formulaire (name, date, teacher_id, description)
- Affichage d'un message de succès après création : on vérifie que `MatSnackBar.open` est appelé avec le message "Session created !", avec une durée de 3000ms
- Redirection vers la liste des sessions après création : on vérifie que `Router.navigate` est appelé avec `['sessions']`

**submit - Modification de session :**

- Mise à jour de la session existante avec les données du formulaire : on vérifie que `SessionApiService.update` est appelé avec l'ID de la session et les nouvelles données
- Affichage d'un message de succès après modification : on vérifie que `MatSnackBar.open` est appelé avec le message "Session updated !", avec une durée de 3000ms
- Redirection vers la liste des sessions après modification : on vérifie que `Router.navigate` est appelé avec `['sessions']`

**Validation du formulaire :**

- Formulaire invalide quand les champs sont vides : on vérifie que `sessionForm.valid` est à `false` quand les champs requis sont vides
- Formulaire valide quand tous les champs requis sont remplis : on vérifie que `sessionForm.valid` est à `true` quand tous les champs ont des valeurs valides
- Validation de la longueur maximale de la description : on vérifie le comportement du validateur avec une description très longue (2001+ caractères)
- Acceptation d'une description dans la limite : on vérifie qu'une description de 2000 caractères (limite maximale) est acceptée

**Liste des professeurs :**

- Chargement des professeurs à l'initialisation : on vérifie que la liste contient bien 2 professeurs, que les données des professeurs sont correctes (firstName: Marie, Pierre)

**Nombre de tests :** 23 tests

## `front\src\app\features\sessions\services\session-api.service.spec.ts`

#### Teste `SessionApiService`

**Description :** Service API de gestion des sessions - Opérations CRUD sur les sessions de yoga

**Tests :**

**Création du service :**

- Le service doit être créé correctement

**all (Récupération de toutes les sessions) :**

- Récupération de toutes les sessions : on vérifie que la requête HTTP GET est envoyée vers `api/session`, que la liste retournée contient toutes les sessions (2 sessions dans le test), que les données des sessions sont complètes (id, name, description, date, teacher_id, users)
- Gestion d'une liste vide : on vérifie que le service retourne un tableau vide lorsqu'aucune session n'existe, que la longueur du tableau est 0

**detail (Récupération d'une session par ID) :**

- Récupération d'une session par son ID : on vérifie que la requête HTTP GET est envoyée vers `api/session/{id}`, que la session retournée correspond aux données attendues (id, name, users, etc.), que le nombre d'utilisateurs inscrits est correct
- Gestion d'erreur - session non trouvée : on vérifie que l'erreur HTTP 404 (Not Found) est correctement propagée, que le service gère le cas où la session n'existe pas

**create (Création d'une nouvelle session) :**

- Création d'une nouvelle session : on vérifie que la requête HTTP POST est envoyée vers `api/session`, que le corps de la requête contient les données de la session (name, description, date, teacher_id), que la réponse retourne la session créée avec son ID généré par le serveur
- Gestion d'erreur lors de la création : on vérifie que l'erreur HTTP 400 (Bad Request) est correctement gérée, que le service refuse les données invalides (nom vide, description vide, teacher_id invalide)

**update (Modification d'une session existante) :**

- Mise à jour d'une session : on vérifie que la requête HTTP PUT est envoyée vers `api/session/{id}`, que le corps de la requête contient les données modifiées, que la réponse retourne la session mise à jour, que le nom modifié est correct
- Gestion d'erreur lors de la modification : on vérifie que l'erreur HTTP 400 (Bad Request) est correctement propagée, que le service refuse les données invalides

**delete (Suppression d'une session) :**

- Suppression d'une session : on vérifie que la requête HTTP DELETE est envoyée vers `api/session/{id}`, que l'URL de la requête est correcte, que la réponse confirme la suppression (objet vide ou status 200 OK)
- Gestion d'erreur lors de la suppression : on vérifie que l'erreur HTTP 403 (Forbidden) est correctement gérée, que le service refuse la suppression si l'utilisateur n'a pas les droits

**Nombre de tests :** 11 tests

## `front/src/app/features/sessions/components/list/list.component.ts`

#### Teste `ListComponent`

**Description :** Composant de liste des sessions - Affichage de toutes les sessions de yoga disponibles

**Tests :**

**Création du composant :**

- Le composant doit être créé correctement

**sessions$ Observable (Chargement des sessions) :**

- Chargement de toutes les sessions à l'initialisation : on vérifie que l'Observable `sessions$` émet la liste complète des sessions, que les données correspondent aux sessions mockées
- Appel du service SessionApiService.all() : on vérifie que `SessionApiService.all()` est appelé lors de la création du composant pour récupérer les sessions
- Contenu correct des données de session : on vérifie que les noms des sessions sont corrects (Yoga Flow, Meditation, Yoga Restorative), que le nombre d'utilisateurs inscrits par session est exact (3, 2, 1)
- Gestion d'une liste vide : on vérifie que le composant gère correctement le cas où aucune session n'existe, que l'Observable émet un tableau vide

**user getter (Récupération des informations utilisateur) :**

- Récupération des informations de session : on vérifie que le getter `user` retourne les informations de l'utilisateur connecté depuis `SessionService`, que toutes les propriétés sont présentes (id, username, firstName, lastName, admin)
- Retour undefined si aucune session : on vérifie que le getter retourne `undefined` quand `sessionInformation` n'est pas défini
- Récupération correcte des informations admin : on vérifie que le getter fonctionne correctement pour un utilisateur administrateur, que la propriété `admin` est à `true`
- Retour toujours des informations actuelles : on vérifie que le getter retourne toujours les informations de session courantes, même si `sessionInformation` change entre deux appels

**Structure des données de session :**

- Validation des dates pour toutes les sessions : on vérifie que tous les champs de type date (date, createdAt, updatedAt) sont des instances de `Date`, que les dates sont valides
- Présence du teacher_id pour toutes les sessions : on vérifie que chaque session a un `teacher_id` défini, que c'est un nombre supérieur à 0

**Nombre de tests :** 12 tests



---