package com.openclassrooms.starterjwt.integration;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour UserController
 * 
 * Ces tests vérifient le comportement complet de l'API des utilisateurs :
 * - Récupération d'un utilisateur par ID
 * - Suppression d'un compte utilisateur (avec vérification de l'autorisation)
 * 
 * SÉCURITÉ : Les tests vérifient que seul l'utilisateur propriétaire peut supprimer son compte
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("UserController - Tests d'intégration")
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    private User user;

    @BeforeEach
    void setUp() {
        // Nettoyage de la base avant chaque test
        userRepository.deleteAll();

        // Création d'un utilisateur de test
        user = new User();
        user.setEmail("test@example.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setPassword("password");
        user.setAdmin(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);
    }

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/user/{id} - Devrait retourner un utilisateur existant")
    void findById_Success() throws Exception {
        // When & Then - Récupération de l'utilisateur et vérification
        mockMvc.perform(get("/api/user/{id}", user.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId()))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.admin").value(false))
                // Vérification que le mot de passe n'est PAS retourné
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/user/{id} - Devrait retourner 404 pour un utilisateur inexistant")
    void findById_NotFound() throws Exception {
        // When & Then - Tentative de récupération d'un utilisateur inexistant
        mockMvc.perform(get("/api/user/{id}", 9999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/user/{id} - Devrait retourner 400 pour un ID invalide")
    void findById_InvalidId() throws Exception {
        // When & Then - Tentative avec un ID non numérique
        mockMvc.perform(get("/api/user/{id}", "invalid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    @DisplayName("DELETE /api/user/{id} - Devrait supprimer son propre compte (autorisé)")
    void delete_OwnAccount_Success() throws Exception {
        // When & Then - Suppression de son propre compte
        mockMvc.perform(delete("/api/user/{id}", user.getId()))
                .andExpect(status().isOk());

        // Vérification que l'utilisateur n'existe plus en base
        assert userRepository.findById(user.getId()).isEmpty();
    }

    @Test
    @WithMockUser(username = "other@example.com")
    @DisplayName("DELETE /api/user/{id} - Devrait interdire la suppression du compte d'un autre utilisateur")
    void delete_OtherUserAccount_Unauthorized() throws Exception {
        // When & Then - Tentative de suppression du compte d'un autre utilisateur
        mockMvc.perform(delete("/api/user/{id}", user.getId()))
                .andExpect(status().isUnauthorized());

        // Vérification que l'utilisateur existe toujours en base
        assert userRepository.findById(user.getId()).isPresent();
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/user/{id} - Devrait retourner 404 pour un utilisateur inexistant")
    void delete_NotFound() throws Exception {
        // When & Then - Tentative de suppression d'un utilisateur inexistant
        mockMvc.perform(delete("/api/user/{id}", 9999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/user/{id} - Devrait retourner 400 pour un ID invalide")
    void delete_InvalidId() throws Exception {
        // When & Then - Tentative avec un ID non numérique
        mockMvc.perform(delete("/api/user/{id}", "invalid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/user/{id} - Devrait retourner les informations complètes de l'utilisateur")
    void findById_CompleteInfo() throws Exception {
        // When & Then - Vérification de toutes les propriétés
        mockMvc.perform(get("/api/user/{id}", user.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.firstName").exists())
                .andExpect(jsonPath("$.lastName").exists())
                .andExpect(jsonPath("$.admin").exists())
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.updatedAt").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/user/{id} - Ne devrait JAMAIS retourner le mot de passe")
    void findById_NoPasswordInResponse() throws Exception {
        // When & Then - Vérification que le mot de passe est absent
        mockMvc.perform(get("/api/user/{id}", user.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.password").doesNotExist());
    }
}
