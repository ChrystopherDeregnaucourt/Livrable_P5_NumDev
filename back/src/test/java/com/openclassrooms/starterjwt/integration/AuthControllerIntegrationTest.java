package com.openclassrooms.starterjwt.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour AuthController
 * 
 * Ces tests vérifient le comportement complet du système d'authentification :
 * - Avec une vraie base de données H2 en mémoire
 * - Avec le contexte Spring complet chargé
 * - Avec les vrais composants (repositories, services, encodeurs, JWT, etc.)
 * 
 * Objectif : Valider l'intégration complète des couches (Controller → Service → Repository → Database)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AuthController - Tests d'intégration")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Nettoyage de la base avant chaque test
        userRepository.deleteAll();

        // Création d'un utilisateur de test en base
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setAdmin(false);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());
        
        userRepository.save(testUser);
    }

    @AfterEach
    void tearDown() {
        // Nettoyage après chaque test
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("POST /api/auth/login - Devrait authentifier un utilisateur existant")
    void authenticateUser_Success() throws Exception {
        // Given - Préparation de la requête de login
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        // When & Then - Appel de l'API et vérification de la réponse
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                // Vérification du code statut HTTP 200 OK
                .andExpect(status().isOk())
                // Vérification que le token JWT est présent
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.token").isNotEmpty())
                // Vérification du type de token
                .andExpect(jsonPath("$.type").value("Bearer"))
                // Vérification de l'ID utilisateur
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                // Vérification de l'email
                .andExpect(jsonPath("$.username").value("test@example.com"))
                // Vérification du prénom
                .andExpect(jsonPath("$.firstName").value("John"))
                // Vérification du nom
                .andExpect(jsonPath("$.lastName").value("Doe"))
                // Vérification que l'utilisateur n'est pas admin
                .andExpect(jsonPath("$.admin").value(false));
    }

    @Test
    @DisplayName("POST /api/auth/login - Devrait authentifier un utilisateur admin")
    void authenticateUser_AdminUser_Success() throws Exception {
        // Given - Création d'un utilisateur admin
        User adminUser = new User();
        adminUser.setEmail("admin@example.com");
        adminUser.setFirstName("Admin");
        adminUser.setLastName("User");
        adminUser.setPassword(passwordEncoder.encode("admin123"));
        adminUser.setAdmin(true);
        adminUser.setCreatedAt(LocalDateTime.now());
        adminUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(adminUser);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("admin@example.com");
        loginRequest.setPassword("admin123");

        // When & Then - Vérification que l'admin flag est bien à true
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.admin").value(true));
    }

    @Test
    @DisplayName("POST /api/auth/login - Devrait échouer avec un mot de passe incorrect")
    void authenticateUser_WrongPassword_Failure() throws Exception {
        // Given - Requête avec mauvais mot de passe
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("wrongpassword");

        // When & Then - Vérification du rejet (401 Unauthorized)
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/login - Devrait échouer avec un email inexistant")
    void authenticateUser_UserNotFound_Failure() throws Exception {
        // Given - Requête avec email inexistant
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("notfound@example.com");
        loginRequest.setPassword("password123");

        // When & Then - Vérification du rejet (401 Unauthorized)
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/register - Devrait créer un nouvel utilisateur")
    void registerUser_Success() throws Exception {
        // Given - Préparation de la requête d'inscription
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("newuser@example.com");
        signupRequest.setFirstName("Jane");
        signupRequest.setLastName("Smith");
        signupRequest.setPassword("newpassword123");

        // When & Then - Appel de l'API et vérification de la réponse
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                // Vérification du code statut HTTP 200 OK
                .andExpect(status().isOk())
                // Vérification du message de succès
                .andExpect(jsonPath("$.message").value("User registered successfully!"));

        // Vérification que l'utilisateur a bien été créé en base
        User createdUser = userRepository.findByEmail("newuser@example.com").orElse(null);
        assert createdUser != null;
        assert createdUser.getEmail().equals("newuser@example.com");
        assert createdUser.getFirstName().equals("Jane");
        assert createdUser.getLastName().equals("Smith");
        // Vérification que le mot de passe est bien encodé
        assert !createdUser.getPassword().equals("newpassword123");
        assert passwordEncoder.matches("newpassword123", createdUser.getPassword());
    }

    @Test
    @DisplayName("POST /api/auth/register - Devrait échouer si l'email existe déjà")
    void registerUser_EmailAlreadyExists_Failure() throws Exception {
        // Given - Requête avec un email déjà existant
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("test@example.com"); // Email déjà utilisé par testUser
        signupRequest.setFirstName("Jane");
        signupRequest.setLastName("Smith");
        signupRequest.setPassword("password123");

        // When & Then - Vérification du rejet (400 Bad Request)
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                // Vérification du code statut HTTP 400 Bad Request
                .andExpect(status().isBadRequest())
                // Vérification du message d'erreur
                .andExpect(jsonPath("$.message").value("Error: Email is already taken!"));
    }

    @Test
    @DisplayName("POST /api/auth/register - Devrait encoder le mot de passe correctement")
    void registerUser_PasswordEncoded() throws Exception {
        // Given - Inscription d'un nouvel utilisateur
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("encoded@example.com");
        signupRequest.setFirstName("Encoded");
        signupRequest.setLastName("User");
        signupRequest.setPassword("plainpassword");

        // When - Création de l'utilisateur
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // Then - Vérification que le mot de passe est encodé en base
        User savedUser = userRepository.findByEmail("encoded@example.com").orElse(null);
        assert savedUser != null;
        // Le mot de passe ne doit pas être stocké en clair
        assert !savedUser.getPassword().equals("plainpassword");
        // Le mot de passe doit être validé avec l'encodeur
        assert passwordEncoder.matches("plainpassword", savedUser.getPassword());
    }

    @Test
    @DisplayName("POST /api/auth/login - Devrait valider les champs obligatoires")
    void authenticateUser_ValidationErrors() throws Exception {
        // Given - Requête avec champs vides
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("");
        loginRequest.setPassword("");

        // When & Then - Vérification du rejet pour champs invalides
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register - Devrait valider le format de l'email")
    void registerUser_InvalidEmailFormat() throws Exception {
        // Given - Requête avec email invalide
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("invalidemail"); // Format email invalide
        signupRequest.setFirstName("Jane");
        signupRequest.setLastName("Smith");
        signupRequest.setPassword("password123");

        // When & Then - Vérification du rejet pour format email invalide
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }
}
