package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Tests d'intégration pour UserController - REST API Utilisateurs
 * 
 * IMPORTANCE CRITIQUE : ⭐⭐⭐⭐⭐
 * 
 * RÔLE : Ce controller expose les endpoints REST pour la gestion des utilisateurs.
 * Il gère des opérations sensibles nécessitant une sécurité maximale.
 * 
 * ENDPOINTS TESTÉS :
 * - GET /api/user/{id} : Récupération d'un utilisateur par ID
 * - DELETE /api/user/{id} : Suppression d'un compte utilisateur
 * 
 * TESTS ESSENTIELS POUR LA SÉCURITÉ :
 * 
 * 1. AUTORISATION (critique) :
 *    - Un utilisateur ne peut supprimer QUE son propre compte
 *    - Vérification que l'email de l'utilisateur connecté (JWT) correspond à l'utilisateur à supprimer
 *    - Test d'UNAUTHORIZE si tentative de suppression du compte d'un autre utilisateur
 * 
 * 2. VALIDATION DES ENTRÉES :
 *    - ID utilisateur valide (format numérique)
 *    - ID non valide → BadRequest (400)
 *    - Utilisateur inexistant → NotFound (404)
 * 
 * 3. GESTION DES ERREURS :
 *    - 200 OK : succès
 *    - 400 BAD_REQUEST : ID invalide
 *    - 401 UNAUTHORIZED : pas autorisé à supprimer
 *    - 404 NOT_FOUND : utilisateur inexistant
 * 
 * ARCHITECTURE :
 * - Controller (couche REST) → Service (logique métier) → Repository (accès données)
 * - Séparation Entity (JPA) et DTO (exposition API)
 * - Utilisation de MapStruct pour mapper Entity → DTO
 * 
 * SÉCURITÉ :
 * - Authentification JWT obligatoire (filtre Spring Security)
 * - Autorisation vérifiée via email de l'utilisateur connecté
 * - Pas de données sensibles exposées (mot de passe jamais retourné)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserController - Tests d'intégration")
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private UserMapper userMapper;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private UserController userController;

    private User mockUser;
    private UserDto mockUserDto;

    /**
     * Configuration des données de test avant chaque test
     * Initialise un utilisateur mock et son DTO
     */
    @BeforeEach
    void setUp() {
        // Création d'un utilisateur mock
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("test@example.com");
        mockUser.setFirstName("John");
        mockUser.setLastName("Doe");
        mockUser.setPassword("hashedPassword");
        mockUser.setAdmin(false);
        mockUser.setCreatedAt(LocalDateTime.now());
        mockUser.setUpdatedAt(LocalDateTime.now());

        // Création d'un UserDto mock
        mockUserDto = new UserDto();
        mockUserDto.setId(1L);
        mockUserDto.setEmail("test@example.com");
        mockUserDto.setFirstName("John");
        mockUserDto.setLastName("Doe");
        mockUserDto.setAdmin(false);
    }

    /**
     * TEST : Récupération d'un utilisateur existant
     * 
     * SCÉNARIO NOMINAL : GET /api/user/{id} avec un ID valide
     * Vérifie que l'utilisateur est correctement retourné avec statut 200 OK
     * 
     * IMPORTANT : Le DTO ne contient PAS le mot de passe (sécurité)
     */
    @Test
    @DisplayName("GET /api/user/{id} - Devrait retourner l'utilisateur avec succès")
    void findById_ShouldReturnUser_WhenUserExists() {
        // Arrange - Configuration du mock pour retourner un utilisateur existant
        // Le service retourne l'utilisateur mocké
        when(userService.findById(1L)).thenReturn(mockUser);
        // Le mapper convertit l'entité en DTO (sans le mot de passe)
        when(userMapper.toDto(mockUser)).thenReturn(mockUserDto);

        // Act - Appel de l'endpoint avec l'ID "1"
        ResponseEntity<?> response = userController.findById("1");

        // Assert - Vérification de la réponse
        // Vérification du code statut HTTP 200 OK
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // Vérification que le corps de la réponse n'est pas null
        assertNotNull(response.getBody());
        // Vérification que le DTO retourné correspond au DTO attendu
        assertEquals(mockUserDto, response.getBody());
        // Vérification que le service a été appelé avec le bon ID
        verify(userService, times(1)).findById(1L);
        // Vérification que le mapper a converti l'entité en DTO
        verify(userMapper, times(1)).toDto(mockUser);
    }

    /**
     * TEST : Utilisateur inexistant
     * 
     * GESTION D'ERREUR : GET /api/user/{id} avec un ID qui n'existe pas en base
     * Doit retourner 404 NOT_FOUND
     * 
     * Important pour l'UX : message d'erreur clair côté front
     */
    @Test
    @DisplayName("GET /api/user/{id} - Devrait retourner 404 si utilisateur inexistant")
    void findById_ShouldReturn404_WhenUserNotFound() {
        // Arrange - Configuration pour simuler un utilisateur inexistant
        // Le service retourne null car l'utilisateur n'existe pas
        when(userService.findById(999L)).thenReturn(null);

        // Act - Tentative de récupération d'un utilisateur inexistant
        ResponseEntity<?> response = userController.findById("999");

        // Assert - Vérification de la réponse d'erreur
        // Vérification du code statut HTTP 404 Not Found
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        // Vérification que le service a été interrogé
        verify(userService, times(1)).findById(999L);
        // Vérification que le mapper n'a pas été appelé (pas d'utilisateur à convertir)
        verify(userMapper, never()).toDto(any(User.class));
    }

    /**
     * TEST : Validation de l'ID
     * 
     * SÉCURITÉ : GET /api/user/{id} avec un ID non numérique (ex: "invalid", "abc")
     * Doit retourner 400 BAD_REQUEST pour empêcher les injections
     * 
     * Critique pour éviter les attaques par injection ou les plantages
     */
    @Test
    @DisplayName("GET /api/user/{id} - Devrait retourner 400 pour ID invalide")
    void findById_ShouldReturn400_WhenIdIsInvalid() {
        // Arrange - Pas de configuration nécessaire, on teste la validation de l'ID
        
        // Act - Appel avec un ID au format invalide (non numérique)
        ResponseEntity<?> response = userController.findById("invalid");

        // Assert - Vérification du rejet de la requête
        // Vérification du code statut HTTP 400 Bad Request
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        // Vérification que le service n'a jamais été appelé (validation échouée avant)
        verify(userService, never()).findById(anyLong());
    }

    @Test
    @DisplayName("GET /api/user/{id} - Devrait gérer les IDs négatifs")
    void findById_ShouldHandleNegativeId() {
        // Arrange - Configuration pour tester un ID négatif
        // Le service retourne null pour un ID négatif
        when(userService.findById(-1L)).thenReturn(null);

        // Act - Appel avec un ID négatif
        ResponseEntity<?> response = userController.findById("-1");

        // Assert - Vérification que l'ID négatif est traité comme inexistant
        // Vérification du code statut HTTP 404 Not Found
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        // Vérification que le service a été appelé avec l'ID négatif
        verify(userService, times(1)).findById(-1L);
    }

    @Test
    @DisplayName("DELETE /api/user/{id} - Devrait supprimer avec succès quand l'utilisateur est autorisé")
    void delete_ShouldSucceed_WhenUserIsAuthorized() {
        // Arrange - Configuration pour un utilisateur autorisé à se supprimer
        // Simulation du contexte de sécurité avec l'email de l'utilisateur connecté
        setupSecurityContext("test@example.com");
        // Le service retourne l'utilisateur avec le même email
        when(userService.findById(1L)).thenReturn(mockUser);
        // Configuration du mock pour la suppression (méthode void)
        doNothing().when(userService).delete(1L);

        // Act - Appel de suppression du compte
        ResponseEntity<?> response = userController.save("1");

        // Assert - Vérification de la suppression réussie
        // Vérification du code statut HTTP 200 OK
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // Vérification que l'utilisateur a été récupéré pour vérifier l'autorisation
        verify(userService, times(1)).findById(1L);
        // Vérification que la suppression a été effectuée
        verify(userService, times(1)).delete(1L);
    }

    @Test
    @DisplayName("DELETE /api/user/{id} - Devrait retourner 401 quand l'utilisateur n'est pas autorisé")
    void delete_ShouldReturn401_WhenUserIsUnauthorized() {
        // Arrange - Configuration pour un utilisateur NON autorisé
        // L'utilisateur connecté a un email différent de celui à supprimer
        setupSecurityContext("other@example.com"); // Email différent
        // Le service retourne l'utilisateur avec email "test@example.com"
        when(userService.findById(1L)).thenReturn(mockUser); // mockUser a email "test@example.com"

        // Act - Tentative de suppression d'un compte d'un autre utilisateur
        ResponseEntity<?> response = userController.save("1");

        // Assert - Vérification du refus de suppression (sécurité)
        // Vérification du code statut HTTP 401 Unauthorized
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        // Vérification que l'utilisateur a été récupéré pour vérifier l'autorisation
        verify(userService, times(1)).findById(1L);
        // Vérification que la suppression n'a PAS été effectuée (sécurité)
        verify(userService, never()).delete(anyLong());
    }

    @Test
    @DisplayName("DELETE /api/user/{id} - Devrait retourner 404 si utilisateur inexistant")
    void delete_ShouldReturn404_WhenUserNotFound() {
        // Arrange - Configuration pour un utilisateur inexistant
        // userService.findById() retourne null par défaut (comportement du mock Mockito)
        // Pas besoin de setup security context car le controller retourne 404 avant de vérifier l'auth

        // Act - Tentative de suppression d'un utilisateur inexistant
        ResponseEntity<?> response = userController.save("999");

        // Assert - Vérification de la réponse d'erreur
        // Vérification du code statut HTTP 404 Not Found
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        // Vérification que le service a été interrogé
        verify(userService, times(1)).findById(999L);
        // Vérification que la suppression n'a pas été appelée
        verify(userService, never()).delete(anyLong());
    }

    @Test
    @DisplayName("DELETE /api/user/{id} - Devrait retourner 400 pour ID invalide")
    void delete_ShouldReturn400_WhenIdIsInvalid() {
        // Arrange - Pas de configuration nécessaire, on teste la validation de l'ID
        
        // Act - Tentative de suppression avec un ID invalide
        ResponseEntity<?> response = userController.save("invalid");

        // Assert - Vérification du rejet de la requête
        // Vérification du code statut HTTP 400 Bad Request
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        // Vérification que le service n'a jamais été appelé (validation échouée avant)
        verify(userService, never()).findById(anyLong());
        verify(userService, never()).delete(anyLong());
    }

    @Test
    @DisplayName("DELETE /api/user/{id} - Devrait empêcher la suppression du compte d'un autre utilisateur")
    void delete_ShouldPreventDeletionOfOtherUserAccount() {
        // Arrange - Configuration pour tester la sécurité (interdiction de supprimer un autre compte)
        // Création d'un autre utilisateur avec un email différent
        User otherUser = new User();
        otherUser.setId(2L);
        otherUser.setEmail("other@example.com");
        otherUser.setFirstName("Jane");
        otherUser.setLastName("Smith");

        // L'utilisateur connecté est "test@example.com"
        setupSecurityContext("test@example.com");
        // Mais on essaie de supprimer l'utilisateur "other@example.com"
        when(userService.findById(2L)).thenReturn(otherUser);

        // Act - Tentative de suppression du compte de quelqu'un d'autre
        ResponseEntity<?> response = userController.save("2");

        // Assert - Vérification que la suppression est refusée (sécurité critique)
        // Vérification du code statut HTTP 401 Unauthorized
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        // Vérification que l'utilisateur a été récupéré pour la vérification
        verify(userService, times(1)).findById(2L);
        // Vérification que la suppression n'a PAS été effectuée (protection)
        verify(userService, never()).delete(2L);
    }

    @Test
    @DisplayName("DELETE /api/user/{id} - Devrait gérer correctement les emails avec casse différente")
    void delete_ShouldHandleCaseSensitiveEmails() {
        // Arrange - Test de la sensibilité à la casse des emails
        // L'utilisateur connecté a l'email en majuscules
        setupSecurityContext("TEST@EXAMPLE.COM");
        // Mais l'utilisateur en base a l'email en minuscules
        when(userService.findById(1L)).thenReturn(mockUser); // email: test@example.com

        // Act - Tentative de suppression avec casse différente
        ResponseEntity<?> response = userController.save("1");

        // Assert - Vérification que la comparaison est sensible à la casse
        // La comparaison est sensible à la casse, donc devrait échouer
        // Vérification du code statut HTTP 401 Unauthorized
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        // Vérification que la suppression n'a pas été effectuée
        verify(userService, never()).delete(anyLong());
    }

    @Test
    @DisplayName("DELETE /api/user/{id} - Devrait réussir avec le bon email (casse identique)")
    void delete_ShouldSucceedWithExactEmailMatch() {
        // Arrange - Test de la correspondance exacte de l'email
        // L'utilisateur connecté a exactement le même email que l'utilisateur à supprimer
        setupSecurityContext("test@example.com"); // Exactement le même email
        when(userService.findById(1L)).thenReturn(mockUser);
        // Configuration de la suppression
        doNothing().when(userService).delete(1L);

        // Act - Suppression avec email correspondant exactement
        ResponseEntity<?> response = userController.save("1");

        // Assert - Vérification du succès
        // Vérification du code statut HTTP 200 OK
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // Vérification que la suppression a été effectuée
        verify(userService, times(1)).delete(1L);
    }

    @Test
    @DisplayName("GET /api/user/{id} - Devrait retourner toutes les informations utilisateur")
    void findById_ShouldReturnCompleteUserInfo() {
        // Arrange - Configuration pour vérifier le contenu complet du DTO
        // Le service retourne l'utilisateur complet
        when(userService.findById(1L)).thenReturn(mockUser);
        // Le mapper convertit avec toutes les propriétés (sauf le mot de passe)
        when(userMapper.toDto(mockUser)).thenReturn(mockUserDto);

        // Act - Récupération de l'utilisateur
        ResponseEntity<?> response = userController.findById("1");

        // Assert - Vérification détaillée du contenu
        // Vérification du code statut HTTP 200 OK
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // Cast du corps de la réponse en UserDto
        UserDto returnedDto = (UserDto) response.getBody();
        assertNotNull(returnedDto);
        // Vérification de l'ID utilisateur
        assertEquals(1L, returnedDto.getId());
        // Vérification de l'email
        assertEquals("test@example.com", returnedDto.getEmail());
        // Vérification du prénom
        assertEquals("John", returnedDto.getFirstName());
        // Vérification du nom de famille
        assertEquals("Doe", returnedDto.getLastName());
        // Vérification du statut admin
        assertFalse(returnedDto.isAdmin());
    }

    /**
     * Méthode utilitaire pour configurer le contexte de sécurité
     * Simule un utilisateur connecté avec l'email fourni
     */
    private void setupSecurityContext(String email) {
        // Configuration du mock UserDetails avec l'email de l'utilisateur connecté
        when(userDetails.getUsername()).thenReturn(email);
        // Configuration du mock Authentication pour retourner les UserDetails
        when(authentication.getPrincipal()).thenReturn(userDetails);
        // Configuration du contexte de sécurité pour retourner l'Authentication
        when(securityContext.getAuthentication()).thenReturn(authentication);
        // Injection du contexte de sécurité dans le SecurityContextHolder
        SecurityContextHolder.setContext(securityContext);
    }
}
