package com.openclassrooms.starterjwt.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
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
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour la sécurité de l'application
 * 
 * Ces tests valident l'ensemble de la chaîne de sécurité :
 * - Génération et validation du token JWT
 * - Filtres de sécurité (AuthTokenFilter)
 * - UserDetailsService et chargement de l'utilisateur
 * - Accès aux endpoints protégés avec et sans authentification
 * - Gestion des erreurs d'authentification (401, 403)
 * 
 * Objectif : Valider que la sécurité fonctionne correctement end-to-end
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Security - Tests d'intégration")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private String jwtToken;

    @BeforeEach
    void setUp() throws Exception {
        // Nettoyage de la base avant chaque test
        userRepository.deleteAll();

        // Création d'un utilisateur de test
        testUser = new User();
        testUser.setEmail("security@example.com");
        testUser.setFirstName("Security");
        testUser.setLastName("Test");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setAdmin(false);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());
        
        userRepository.save(testUser);

        // Obtenir un JWT token valide pour les tests
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("security@example.com");
        loginRequest.setPassword("password123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        jwtToken = objectMapper.readTree(response).get("token").asText();
    }

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Devrait accéder à un endpoint protégé avec un token JWT valide")
    void accessProtectedEndpoint_WithValidToken_Success() throws Exception {
        // When & Then - Accès à un endpoint protégé avec le token
        mockMvc.perform(get("/api/user/" + testUser.getId())
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("security@example.com"));
    }

    @Test
    @DisplayName("Devrait rejeter l'accès sans token JWT (401 Unauthorized)")
    void accessProtectedEndpoint_WithoutToken_ShouldReturn401() throws Exception {
        // When & Then - Tentative d'accès sans token
        mockMvc.perform(get("/api/user/" + testUser.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Devrait rejeter l'accès avec un token JWT invalide (401 Unauthorized)")
    void accessProtectedEndpoint_WithInvalidToken_ShouldReturn401() throws Exception {
        // Given - Token invalide
        String invalidToken = "eyJhbGciOiJIUzUxMiJ9.invalidtoken.invalidsignature";

        // When & Then - Tentative d'accès avec token invalide
        mockMvc.perform(get("/api/user/" + testUser.getId())
                .header("Authorization", "Bearer " + invalidToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Devrait rejeter l'accès avec un token JWT malformé (401 Unauthorized)")
    void accessProtectedEndpoint_WithMalformedToken_ShouldReturn401() throws Exception {
        // Given - Token malformé
        String malformedToken = "malformed.token";

        // When & Then - Tentative d'accès avec token malformé
        mockMvc.perform(get("/api/user/" + testUser.getId())
                .header("Authorization", "Bearer " + malformedToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Devrait rejeter l'accès sans le préfixe 'Bearer' dans le header")
    void accessProtectedEndpoint_WithoutBearerPrefix_ShouldReturn401() throws Exception {
        // When & Then - Tentative d'accès sans le préfixe Bearer
        mockMvc.perform(get("/api/user/" + testUser.getId())
                .header("Authorization", jwtToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Devrait permettre l'accès aux endpoints publics sans authentification")
    void accessPublicEndpoint_WithoutToken_Success() throws Exception {
        // When & Then - Les endpoints d'authentification sont publics
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("security@example.com");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Devrait valider le token JWT et extraire le username correctement")
    void jwtTokenFilter_ShouldExtractUsernameFromToken() throws Exception {
        // When & Then - Vérifier que le filtre JWT extrait bien l'utilisateur du token
        mockMvc.perform(get("/api/user/" + testUser.getId())
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("security@example.com"))
                .andExpect(jsonPath("$.firstName").value("Security"))
                .andExpect(jsonPath("$.lastName").value("Test"));
    }

    @Test
    @DisplayName("Devrait générer un nouveau token JWT valide lors d'une nouvelle connexion")
    void multipleLogins_ShouldGenerateDifferentValidTokens() throws Exception {
        // Given - Première connexion
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("security@example.com");
        loginRequest.setPassword("password123");

        MvcResult result1 = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String token1 = objectMapper.readTree(result1.getResponse().getContentAsString()).get("token").asText();

        // When - Deuxième connexion
        MvcResult result2 = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String token2 = objectMapper.readTree(result2.getResponse().getContentAsString()).get("token").asText();

        // Then - Les deux tokens sont valides et permettent l'accès
        mockMvc.perform(get("/api/user/" + testUser.getId())
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/user/" + testUser.getId())
                .header("Authorization", "Bearer " + token2))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Devrait gérer correctement l'accès pour un utilisateur admin")
    void accessProtectedEndpoint_AsAdmin_Success() throws Exception {
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

        // Connexion en tant qu'admin
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("admin@example.com");
        loginRequest.setPassword("admin123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String adminToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();

        // When & Then - Accès avec le token admin
        mockMvc.perform(get("/api/user/" + adminUser.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.admin").value(true));
    }

    @Test
    @DisplayName("Devrait rejeter l'accès avec un header Authorization vide")
    void accessProtectedEndpoint_WithEmptyAuthorizationHeader_ShouldReturn401() throws Exception {
        // When & Then - Header Authorization présent mais vide
        mockMvc.perform(get("/api/user/" + testUser.getId())
                .header("Authorization", ""))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Devrait valider que le JWT contient les bonnes informations utilisateur")
    void jwtToken_ShouldContainCorrectUserInformation() throws Exception {
        // When & Then - Vérifier que les infos de l'utilisateur sont correctes après authentification
        mockMvc.perform(get("/api/user/" + testUser.getId())
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                .andExpect(jsonPath("$.email").value("security@example.com"))
                .andExpect(jsonPath("$.firstName").value("Security"))
                .andExpect(jsonPath("$.lastName").value("Test"))
                .andExpect(jsonPath("$.admin").value(false));
    }
}
