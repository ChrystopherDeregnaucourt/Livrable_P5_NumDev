
---
# Tests Unitaires

---

  
## Controllers
  

### `AuthControllerTest.java`

#### Teste `AuthController`

**Description:** Tests unitaires pour le contrôleur d'authentification. Teste les endpoints POST /api/auth/login (authentification) et POST /api/auth/register (inscription). Valide la génération de tokens JWT, l'enregistrement des utilisateurs, la gestion des erreurs (email déjà existant) et l'encodage des mots de passe.

**Tests:**

**Authentification utilisateur:**
- Test d'authentification réussie avec génération de token JWT : vérification du token, de l'ID utilisateur, username, prénom, nom et statut admin. Validation que les services (AuthenticationManager, JwtUtils, UserRepository) sont bien appelés
- Test d'authentification d'un utilisateur admin : vérification que le flag admin est à true dans la réponse JWT
- Test de gestion d'un utilisateur non trouvé en base : vérification que l'admin est false par défaut quand l'utilisateur n'est pas en base

**Inscription utilisateur:**
- Test d'inscription réussie : vérification que l'email n'existe pas, que le mot de passe est encodé, que l'utilisateur est sauvegardé et que le message de succès est retourné
- Test d'échec d'inscription avec email existant : vérification du code 400 et du message "Error: Email is already taken!". Validation que les méthodes d'encodage et de sauvegarde ne sont pas appelées
- Test de l'encodage correct du mot de passe : vérification que le PasswordEncoder encode bien le mot de passe brut et que le mot de passe encodé est sauvegardé en base
  
**Nombre de tests:** 6 tests

  
### `SessionControllerTest.java`

#### Teste `SessionController`

**Description:** Tests unitaires pour le contrôleur de gestion des sessions de yoga. Teste les endpoints GET /api/session/{id}, GET /api/session, POST /api/session, PUT /api/session/{id}, DELETE /api/session/{id}, POST /api/session/{id}/participate/{userId} et DELETE /api/session/{id}/participate/{userId}. Couvre les cas de succès, les sessions non trouvées (404), les ID invalides (400) et la conversion entre entités et DTOs via le mapper.

**Tests:**

**Récupération de sessions:**
- Test de récupération réussie d'une session par ID : vérification du code 200, du corps de réponse contenant le DTO, et des appels au service et mapper
- Test de retour 404 pour une session inexistante : vérification que le mapper n'est pas appelé
- Test de retour 400 pour un ID invalide (non numérique) : vérification que le service n'est jamais appelé
- Test de récupération de toutes les sessions : vérification du code 200, du corps contenant la liste des DTOs, et des appels au service et mapper

**Création et modification:**
- Test de création réussie d'une session : vérification de la conversion DTO→entité→DTO et des appels au mapper et service
- Test de mise à jour réussie d'une session : vérification du code 200, du DTO mis à jour et de l'appel au service avec le bon ID
- Test de retour 400 pour un ID invalide lors de la mise à jour

**Suppression:**
- Test de suppression réussie d'une session : vérification de l'existence de la session avant suppression et de l'appel à delete
- Test de retour 404 lors de la suppression d'une session inexistante : vérification que delete n'est pas appelé
- Test de retour 400 pour un ID invalide lors de la suppression

**Participation:**
- Test d'ajout réussi d'un participant : vérification du code 200 et de l'appel au service avec les bons IDs
- Test de retour 400 pour un ID de session invalide lors de la participation
- Test de retour 400 pour un ID utilisateur invalide lors de la participation
- Test de retrait réussi d'un participant : vérification du code 200 et de l'appel au service
- Test de retour 400 pour un ID de session invalide lors du retrait
- Test de retour 400 pour un ID utilisateur invalide lors du retrait

**Nombre de tests:** 16 tests


### `TeacherControllerTest.java`

#### Teste `TeacherController`

**Description:** Tests unitaires pour le contrôleur de l'API publique des professeurs. Teste les endpoints GET /api/teacher/{id} (récupération d'un professeur par ID) et GET /api/teacher (récupération de tous les professeurs). Couvre la gestion des erreurs (404, 400) et la conversion entité→DTO.

**Tests:**

**Récupération d'un professeur:**
- Test de récupération réussie d'un professeur par ID : vérification du code 200, du DTO retourné, et des appels au service et mapper
- Test de retour 404 pour un professeur inexistant : vérification que le mapper n'est pas appelé
- Test de retour 400 pour un ID invalide (non numérique) : vérification que le service n'est jamais appelé
- Test de gestion des IDs négatifs : vérification du code 404 et de l'appel au service
- Test de retour des informations complètes du professeur : vérification de l'ID, prénom et nom dans le DTO
- Test de gestion de l'ID = 0 : vérification du code 404
- Test de gestion des IDs avec espaces : vérification du code 400 (NumberFormatException)

**Récupération de tous les professeurs:**
- Test de récupération de tous les professeurs : vérification du code 200, de la liste des DTOs, et des appels au service et mapper
- Test de retour d'une liste vide si aucun professeur : vérification du code 200 avec liste vide
- Test de retour du bon nombre de professeurs : vérification de la taille de la liste
- Test de mapping correct de tous les professeurs : vérification des données (prénom, nom) de chaque professeur dans la liste

**Nombre de tests:** 11 tests


### `UserControllerTest.java`

#### Teste `UserController`

**Description:** Tests unitaires pour le contrôleur REST de gestion des utilisateurs. Teste les endpoints GET /api/user/{id} (récupération d'un utilisateur) et DELETE /api/user/{id} (suppression de compte). **IMPORTANCE CRITIQUE** pour la sécurité : vérifie qu'un utilisateur ne peut supprimer que son propre compte, avec vérification de l'email de l'utilisateur connecté via JWT.

**Tests:**

**Récupération d'utilisateur:**
- Test de récupération réussie d'un utilisateur existant : vérification du code 200, du DTO retourné (sans mot de passe), et des appels au service et mapper
- Test de retour 404 pour un utilisateur inexistant : vérification que le mapper n'est pas appelé
- Test de retour 400 pour un ID invalide (non numérique) : vérification que le service n'est jamais appelé
- Test de gestion des IDs négatifs : vérification du code 404
- Test de retour des informations complètes de l'utilisateur : vérification de l'ID, email, prénom, nom et statut admin (sans mot de passe)

**Suppression de compte (SÉCURITÉ CRITIQUE):**
- Test de suppression réussie de son propre compte : vérification de l'autorisation basée sur l'email identique et de l'appel à delete
- Test de refus de suppression du compte d'un autre utilisateur (401 Unauthorized) : vérification que delete n'est PAS appelé pour protéger les comptes
- Test de retour 404 pour un utilisateur inexistant lors de la suppression
- Test de retour 400 pour un ID invalide lors de la suppression
- Test d'interdiction de supprimer le compte d'un autre utilisateur : création d'un second utilisateur et vérification du refus (401)
- Test de gestion de la sensibilité à la casse des emails : vérification que "TEST@EXAMPLE.COM" ≠ "test@example.com" (401)
- Test de succès avec correspondance exacte de l'email : vérification du code 200 et de la suppression


**Nombre de tests:** 12 tests


**Spécificité:** Ces tests sont essentiels pour la sécurité de l'application. Ils valident que l'autorisation est correctement implémentée via la comparaison de l'email de l'utilisateur connecté (récupéré du JWT via SecurityContext) avec l'email de l'utilisateur à supprimer.

  

---

## Services

### `SessionServiceTest.java`

#### Teste `SessionService`

**Description:** Tests unitaires pour le service de gestion des sessions. Teste les opérations CRUD (création, mise à jour, suppression, récupération par ID et toutes), la gestion de la participation des utilisateurs aux sessions et l'annulation de participation. Couvre la logique métier (pas de doublon de participation, vérification d'existence) et les exceptions (NotFoundException, BadRequestException).

**Tests:**

**Opérations CRUD:**
- Test de création réussie d'une session : vérification que la session retournée correspond à celle créée et que save est appelé
- Test de suppression réussie d'une session : vérification de l'appel à deleteById
- Test de récupération de toutes les sessions : vérification de la taille de la liste et du contenu
- Test de récupération d'une session par ID : vérification que la session retournée correspond
- Test de retour null pour une session inexistante
- Test de mise à jour réussie d'une session : vérification de l'ID et du nom mis à jour

**Participation aux sessions:**
- Test d'ajout réussi d'un participant : vérification que l'utilisateur est ajouté à la liste des participants et que save est appelé
- Test d'exception NotFoundException si la session n'existe pas lors de la participation : vérification que save n'est pas appelé
- Test d'exception NotFoundException si l'utilisateur n'existe pas lors de la participation
- Test d'exception BadRequestException si l'utilisateur participe déjà : vérification que save n'est pas appelé

**Annulation de participation:**
- Test de retrait réussi d'un participant : vérification que l'utilisateur est retiré de la liste et que save est appelé
- Test d'exception NotFoundException si la session n'existe pas lors du retrait
- Test d'exception BadRequestException si l'utilisateur ne participe pas : vérification que save n'est pas appelé

**Cas complexes:**

- Test de gestion de plusieurs utilisateurs dans une session : vérification de la taille de la liste après ajout de deux utilisateurs

**Nombre de tests:** 14 tests


### `TeacherServiceTest.java`

#### Teste `TeacherService`

**Description:** Tests unitaires pour le service de gestion des professeurs. Teste la logique métier de récupération de tous les professeurs et d'un professeur par ID, ainsi que la gestion des cas limites (liste vide, IDs négatifs ou zéro).

**Tests:**

**Récupération de tous les professeurs:**
- Test de retour de tous les professeurs : vérification de la taille de la liste (2), des prénoms et de l'appel au repository
- Test de retour d'une liste vide si aucun professeur : vérification de la liste vide et de l'appel au repository
- Test que le repository est appelé une seule fois
- Test de retour d'une liste avec tous les professeurs (3 professeurs) : vérification de la taille et du prénom du troisième

**Récupération par ID:**
- Test de retour du professeur quand il existe : vérification de l'ID, prénom, nom et de l'appel au repository
- Test de retour null quand le professeur n'existe pas : vérification de l'appel au repository
- Test de gestion des IDs négatifs : vérification du retour null
- Test que le repository est appelé une seule fois
- Test de retour d'un professeur avec toutes ses propriétés : vérification de l'ID, prénom, nom, createdAt et updatedAt
- Test de gestion de l'ID = 0 : vérification du retour null
- Test de retour du bon professeur parmi plusieurs : vérification des données du professeur #2

**Injection de dépendances:**
- Test que le service utilise bien le repository injecté : vérification des appels pour findAll et findById

**Nombre de tests:** 11 tests


### `UserServiceTest.java`

#### Teste `UserService`

**Description:** Tests unitaires pour le service de gestion des utilisateurs. Teste la logique métier de récupération des utilisateurs par ID et de suppression de comptes, ainsi que la gestion des cas limites (utilisateur inexistant, IDs négatifs ou zéro).

**Tests:**

**Récupération par ID:**
- Test de retour de l'utilisateur quand il existe : vérification de l'ID, email, prénom, nom et de l'appel au repository
- Test de retour null quand l'utilisateur n'existe pas : vérification de l'appel au repository
- Test de gestion des IDs négatifs : vérification du retour null
- Test de retour d'un utilisateur admin : vérification du flag admin et de l'email
- Test que le repository est appelé une seule fois
- Test de retour d'un utilisateur avec toutes ses propriétés : vérification de l'ID, email, prénom, nom, mot de passe, admin, createdAt et updatedAt
- Test de gestion de l'ID = 0 : vérification du retour null

**Suppression:**
- Test de suppression d'un utilisateur par ID : vérification de l'appel à deleteById
- Test que deleteById est appelé avec le bon ID : vérification de l'appel avec l'ID 42L
- Test de gestion de la suppression d'un utilisateur inexistant : vérification de l'appel à deleteById même si l'utilisateur n'existe pas
- Test que la méthode delete est void : vérification qu'aucune valeur n'est retournée
- Test de suppression de plusieurs utilisateurs : vérification des appels à deleteById pour les IDs 1L, 2L et 3L
- Test de gestion de l'ID = 0 lors de la suppression

**Injection de dépendances:**
- Test que le service utilise bien le repository injecté : vérification de l'appel à findById

**Nombre de tests:** 13 tests

  
---

## Models


### `UserTest.java`

#### Teste `User`

**Description:** Tests unitaires pour le modèle User (entité JPA). Teste le builder Lombok, les getters/setters, le chaînage de méthodes, equals() basé sur l'ID uniquement, hashCode() et toString(). Valide le bon fonctionnement du code généré par Lombok et des annotations JPA.

**Tests:**

**Construction:**
- Test de création d'un utilisateur avec le builder : vérification de toutes les propriétés (ID, email, prénom, nom, mot de passe, admin)
- Test de création avec le constructeur RequiredArgsConstructor : vérification des champs obligatoires
- Test des setters et getters : vérification de la modification et récupération des valeurs
- Test du chaînage de méthodes (fluent setters) : vérification que les setters retournent l'instance

**Equals et hashCode:**
- Test d'égalité pour le même ID : deux utilisateurs avec ID=1 mais données différentes doivent être égaux
- Test d'inégalité pour des IDs différents : deux utilisateurs avec ID différent mais mêmes données doivent être différents
- Test que hashCode est identique pour le même ID : vérification de la cohérence equals/hashCode

**ToString:**
- Test que toString contient les informations pertinentes : vérification de la présence de "User" et de l'email

**Cas spéciaux:**
- Test de création d'un utilisateur admin : vérification du flag admin à true

**Nombre de tests:** 9 tests


### `SessionTest.java`

#### Teste `Session`

**Description:** Tests unitaires pour le modèle Session (entité JPA). Teste le builder Lombok, les getters/setters, le chaînage de méthodes, equals() basé sur l'ID uniquement, hashCode(), toString() et la gestion de la liste d'utilisateurs participants.

**Tests:**

**Construction:**
- Test de création d'une session avec le builder : vérification de toutes les propriétés (ID, nom, date, description, teacher, users)
- Test des setters et getters : vérification de la modification et récupération des valeurs
- Test du chaînage de méthodes (fluent setters) : vérification que les setters retournent l'instance

**Equals et hashCode:**
- Test d'égalité pour le même ID : deux sessions avec ID=1 mais données différentes doivent être égales
- Test d'inégalité pour des IDs différents : deux sessions avec ID différent mais mêmes données doivent être différentes
- Test que hashCode est identique pour le même ID : vérification de la cohérence equals/hashCode

**ToString:**
- Test que toString contient les informations pertinentes : vérification de la présence de "Session" et du nom de la session

**Gestion des utilisateurs:**
- Test de gestion d'une liste vide d'utilisateurs : vérification que la liste est bien vide
- Test de gestion de plusieurs utilisateurs : vérification de la taille (2) et du contenu de la liste

**Nombre de tests:** 9 tests

### `TeacherTest.java`

#### Teste `Teacher`

**Description:** Tests unitaires pour le modèle Teacher (entité JPA). Teste le builder Lombok, les getters/setters, le chaînage de méthodes, equals() basé sur l'ID uniquement, hashCode() et toString(). Valide le bon fonctionnement du code généré par Lombok.

**Tests:**

**Construction:**
- Test de création d'un professeur avec le builder : vérification de l'ID, prénom et nom
- Test des setters et getters : vérification de la modification et récupération des valeurs
- Test du chaînage de méthodes (fluent setters) : vérification que les setters retournent l'instance
- Test de création avec le constructeur AllArgsConstructor : vérification de l'ordre des paramètres (id, lastName, firstName, createdAt, updatedAt)
- Test de création avec le constructeur NoArgsConstructor : vérification que l'objet est créé

**Equals et hashCode:**
- Test d'égalité pour le même ID : deux professeurs avec ID=1 mais données différentes doivent être égaux
- Test d'inégalité pour des IDs différents : deux professeurs avec ID différent mais mêmes données doivent être différents
- Test que hashCode est identique pour le même ID : vérification de la cohérence equals/hashCode

**ToString:**
- Test que toString contient les informations pertinentes : vérification de la présence de "Teacher", prénom et nom

**Nombre de tests:** 9 tests

  


---
## Security

  

### `JwtUtilsTest.java`

#### Teste `JwtUtils`

**Description:** Tests unitaires pour l'utilitaire de gestion des tokens JWT. Teste la génération de tokens à partir d'une authentification, la validation de tokens (valides, expirés, malformés, non signés), l'extraction du nom d'utilisateur et la gestion des erreurs de signature et d'expiration. Utilise ReflectionTestUtils pour injecter les propriétés privées (jwtSecret, jwtExpirationMs).

**Tests:**

**Génération et extraction:**
- Test de génération réussie d'un token JWT : vérification que le token n'est pas null/vide et qu'il a 3 parties (header.payload.signature)
- Test d'extraction du username depuis le token : vérification que le username extrait correspond à "test@example.com"
- Test de génération de tokens différents pour différents utilisateurs : vérification que les tokens sont différents et que les usernames extraits sont corrects

**Validation:**
- Test de validation réussie d'un token valide : vérification que validateJwtToken retourne true
- Test de rejet d'un token malformé : vérification que validateJwtToken retourne false
- Test de rejet d'un token vide : vérification que validateJwtToken retourne false
- Test de rejet d'un token avec signature invalide : vérification que validateJwtToken retourne false (token signé avec "wrongSecret")
- Test de rejet d'un token expiré : vérification que validateJwtToken retourne false (token expiré il y a 5 secondes)
- Test de rejet d'un token non supporté : vérification que validateJwtToken retourne false (token sans signature)

**Cas spéciaux:**
- Test de gestion des caractères spéciaux dans le username : vérification que "user+tag@example.co.uk" est correctement extrait

**Nombre de tests:** 10 tests

  
### `AuthTokenFilterTest.java`

#### Teste `AuthTokenFilter`

**Description:** Tests unitaires pour le filtre d'authentification JWT. Teste l'authentification avec un token JWT valide, le rejet des tokens invalides, la gestion de l'absence de header Authorization, les formats invalides et les exceptions lors de l'authentification.

**Tests:**

**Authentification réussie:**
- Test d'authentification réussie avec token valide : vérification que le SecurityContext contient l'authentification, que les services sont appelés et que le filtre continue
- Test de définition des détails d'authentification dans le contexte : vérification que les détails ne sont pas null

**Rejets et erreurs:**
- Test de rejet avec token invalide : vérification que le SecurityContext reste null et que getUserNameFromJwtToken n'est pas appelé
- Test de rejet sans header Authorization : vérification que validateJwtToken n'est pas appelé
- Test de rejet sans préfixe "Bearer" : vérification que validateJwtToken n'est pas appelé
- Test de rejet avec "Bearer " vide : vérification que le SecurityContext reste null
- Test de gestion d'exception lors de l'authentification : vérification que le SecurityContext reste null et que le filtre continue

**Continuité du filtre:**
- Test que le filtre continue toujours la chaîne même en cas d'échec : vérification de l'appel à doFilter

**Nombre de tests:** 8 tests


### `AuthEntryPointJwtTest.java`

#### Teste `AuthEntryPointJwt`

**Description:** Tests unitaires pour le point d'entrée d'authentification JWT (gestion des erreurs 401). Teste la définition du statut HTTP 401 Unauthorized, du content-type JSON et la gestion de différents messages d'exception et chemins de servlet.

**Tests:**

**Gestion des erreurs 401:**
- Test de déclenchement avec erreur Unauthorized : vérification de la définition du content-type, du statut 401 et de l'appel à getOutputStream
- Test de définition du bon statut HTTP 401 : vérification de setStatus(401)
- Test de définition du bon content-type : vérification de setContentType("application/json")
- Test de gestion de différents messages d'exception : vérification du statut 401 avec un message personnalisé
- Test de gestion de différents chemins de servlet : vérification de l'appel à getServletPath

**Nombre de tests:** 5 tests

  

### `UserDetailsServiceImplTest.java`

#### Teste `UserDetailsServiceImpl`

**Description:** Tests unitaires pour le service de chargement des détails utilisateur (Spring Security). Teste le chargement d'un utilisateur par username (email), la génération d'exception UsernameNotFoundException si l'utilisateur n'existe pas, et la gestion de différents formats d'email.

**Tests:**

**Chargement réussi:**
- Test de chargement réussi d'un utilisateur par username : vérification du username, mot de passe, ID, prénom, nom et appel au repository
- Test de chargement d'un utilisateur admin : vérification du flag admin à true

**Gestion des erreurs:**
- Test d'exception UsernameNotFoundException si l'utilisateur n'existe pas : vérification du message d'erreur "User Not Found with email: notfound@example.com"

**Cas spéciaux:**
- Test de gestion de différents formats d'email : vérification du chargement avec "user.name+tag@example.co.uk"

**Nombre de tests:** 4 tests

  

### `UserDetailsImplTest.java`

#### Teste `UserDetailsImpl`

**Description:** Tests unitaires pour l'implémentation des détails utilisateur (Spring Security). Teste le builder, les méthodes de UserDetails (getAuthorities, isAccountNonExpired, isAccountNonLocked, isCredentialsNonExpired, isEnabled), equals() basé sur l'ID et la gestion des valeurs null.

**Tests:**

**Construction:**
- Test de construction avec le builder : vérification de toutes les propriétés (ID, username, prénom, nom, mot de passe, admin)
- Test de construction d'un utilisateur admin : vérification du flag admin à true
- Test de gestion du champ admin null : vérification que getAdmin retourne null

**Méthodes UserDetails:**
- Test que getAuthorities retourne une collection vide : vérification de la collection vide
- Test que isAccountNonExpired retourne true : vérification de la valeur true
- Test que isAccountNonLocked retourne true : vérification de la valeur true
- Test que isCredentialsNonExpired retourne true : vérification de la valeur true
- Test que isEnabled retourne true : vérification de la valeur true

**Equals:**
- Test d'égalité pour le même ID : deux UserDetailsImpl avec ID=1 mais données différentes doivent être égaux
- Test d'inégalité pour des IDs différents : vérification que equals retourne false
- Test d'égalité avec le même objet : vérification que equals retourne true
- Test d'égalité avec null : vérification que equals retourne false
- Test d'égalité avec une classe différente : vérification que equals retourne false

**Nombre de tests:** 12 tests

  


---

## Payload

  
### `LoginRequestTest.java`

#### Teste `LoginRequest`

**Description:** Tests unitaires pour l'objet de requête de connexion (DTO). Teste les setters/getters pour email et password, et la gestion des valeurs null et vides.

**Tests:**

**Setters et getters:**
- Test de set et get email : vérification que la valeur est correctement stockée et récupérée
- Test de set et get password : vérification que la valeur est correctement stockée et récupérée
- Test de création d'une LoginRequest complète : vérification de l'email et du mot de passe

**Gestion des valeurs null et vides:**
- Test de gestion d'un email null : vérification que getEmail retourne null
- Test de gestion d'un password null : vérification que getPassword retourne null
- Test de gestion d'un email vide : vérification que getEmail retourne une chaîne vide
- Test de gestion d'un password vide : vérification que getPassword retourne une chaîne vide

**Nombre de tests:** 7 tests

  

### `SignupRequestTest.java`

#### Teste `SignupRequest`

**Description:** Tests unitaires pour l'objet de requête d'inscription (DTO). Teste les setters/getters pour email, firstName, lastName et password, la gestion des valeurs null et vides, et les méthodes equals/hashCode/toString générées par Lombok.

**Tests:**

**Setters et getters:**
- Test de set et get email : vérification que la valeur est correctement stockée et récupérée
- Test de set et get firstName : vérification que la valeur est correctement stockée et récupérée
- Test de set et get lastName : vérification que la valeur est correctement stockée et récupérée
- Test de set et get password : vérification que la valeur est correctement stockée et récupérée
- Test de création d'une SignupRequest complète : vérification de tous les champs

**Gestion des valeurs null et vides:**
- Test de gestion d'un email null : vérification que getEmail retourne null
- Test de gestion d'un firstName null : vérification que getFirstName retourne null
- Test de gestion d'un lastName null : vérification que getLastName retourne null
- Test de gestion d'un password null : vérification que getPassword retourne null
- Test de gestion de chaînes vides : vérification que tous les getters retournent des chaînes vides

**Lombok:**
- Test de equals et hashCode de Lombok : vérification que deux objets identiques sont égaux et ont le même hashCode
- Test de toString de Lombok : vérification que la chaîne contient email, firstName et lastName

**Nombre de tests:** 12 tests


### `JwtResponseTest.java`

#### Teste `JwtResponse`

**Description:** Tests unitaires pour l'objet de réponse JWT (DTO). Teste le constructeur, les setters/getters pour toutes les propriétés (token, type, id, username, firstName, lastName, admin), et la valeur par défaut "Bearer" pour le type.

**Tests:**

**Construction:**
- Test de création avec le constructeur : vérification de toutes les propriétés (token, type="Bearer", ID, username, prénom, nom, admin)

**Setters et getters:**
- Test de set et get token : vérification de la modification et récupération du token
- Test de set et get type : vérification de la modification du type
- Test de set et get id : vérification de la modification de l'ID
- Test de set et get username : vérification de la modification du username
- Test de set et get firstName : vérification de la modification du prénom
- Test de set et get lastName : vérification de la modification du nom
- Test de set et get admin : vérification de la modification du flag admin

**Valeurs par défaut:**
- Test que le type est "Bearer" par défaut : vérification de la valeur par défaut

**Cas spéciaux:**
- Test de création d'une réponse pour un admin : vérification du flag admin à true

**Nombre de tests:** 10 tests

  

### `MessageResponseTest.java`

#### Teste `MessageResponse`

**Description:** Tests unitaires pour l'objet de réponse de message (DTO). Teste le constructeur, les setters/getters, et la gestion des valeurs null et vides.

**Tests:**

**Construction et modification:**
- Test de création avec le constructeur : vérification que le message est correctement stocké
- Test de set et get message : vérification de la modification et récupération du message

**Gestion des valeurs null et vides:**
- Test de gestion d'un message vide : vérification que getMessage retourne une chaîne vide
- Test de gestion d'un message null : vérification que getMessage retourne null

**Cas d'usage:**
- Test de création d'un message d'erreur : vérification de la présence de "Error" et du message complet
- Test de création d'un message de succès : vérification de la présence de "successfully"

**Nombre de tests:** 6 tests

  

---

  

## Résumé

**Total des fichiers de tests unitaires:** 19 fichiers

**Répartition par catégorie:**
- **Controllers:** 4 fichiers (AuthController, SessionController, TeacherController, UserController)
- **Services:** 3 fichiers (SessionService, TeacherService, UserService)
- **Models:** 3 fichiers (User, Session, Teacher)
- **Security:** 5 fichiers (JwtUtils, AuthTokenFilter, AuthEntryPointJwt, UserDetailsServiceImpl, UserDetailsImpl)
- **Payload:** 4 fichiers (LoginRequest, SignupRequest, JwtResponse, MessageResponse)

**Total approximatif de tests unitaires:** ~145 tests

**Technologies utilisées:**
- JUnit 5 (Jupiter)
- Mockito
- AssertJ
- Spring Boot Test
- ReflectionTestUtils (pour JwtUtils)

**Points clés:**
- Tous les tests utilisent des mocks (pas de base de données)
- Isolation complète de chaque composant
- Couverture des cas de succès et d'échec
- Validation de la sécurité (notamment UserController)
- Tests des DTOs et des conversions