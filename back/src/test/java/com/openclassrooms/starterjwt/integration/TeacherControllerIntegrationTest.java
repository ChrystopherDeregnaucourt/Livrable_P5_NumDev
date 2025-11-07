package com.openclassrooms.starterjwt.integration;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
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

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour TeacherController
 * 
 * Ces tests vérifient le comportement complet de l'API des professeurs :
 * - Récupération de la liste des professeurs
 * - Récupération d'un professeur par ID
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("TeacherController - Tests d'intégration")
class TeacherControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TeacherRepository teacherRepository;

    private Teacher teacher1;
    private Teacher teacher2;

    @BeforeEach
    void setUp() {
        // Nettoyage de la base avant chaque test
        teacherRepository.deleteAll();

        // Création de professeurs de test
        teacher1 = new Teacher();
        teacher1.setFirstName("Marie");
        teacher1.setLastName("Dubois");
        teacher1.setCreatedAt(LocalDateTime.now());
        teacher1.setUpdatedAt(LocalDateTime.now());
        teacher1 = teacherRepository.save(teacher1);

        teacher2 = new Teacher();
        teacher2.setFirstName("Pierre");
        teacher2.setLastName("Martin");
        teacher2.setCreatedAt(LocalDateTime.now());
        teacher2.setUpdatedAt(LocalDateTime.now());
        teacher2 = teacherRepository.save(teacher2);
    }

    @AfterEach
    void tearDown() {
        teacherRepository.deleteAll();
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/teacher/{id} - Devrait retourner un professeur existant")
    void findById_Success() throws Exception {
        // When & Then - Récupération du professeur et vérification
        mockMvc.perform(get("/api/teacher/{id}", teacher1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(teacher1.getId()))
                .andExpect(jsonPath("$.firstName").value("Marie"))
                .andExpect(jsonPath("$.lastName").value("Dubois"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/teacher/{id} - Devrait retourner 404 pour un professeur inexistant")
    void findById_NotFound() throws Exception {
        // When & Then - Tentative de récupération d'un professeur inexistant
        mockMvc.perform(get("/api/teacher/{id}", 9999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/teacher/{id} - Devrait retourner 400 pour un ID invalide")
    void findById_InvalidId() throws Exception {
        // When & Then - Tentative avec un ID non numérique
        mockMvc.perform(get("/api/teacher/{id}", "invalid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/teacher - Devrait retourner tous les professeurs")
    void findAll_Success() throws Exception {
        // When & Then - Récupération de tous les professeurs
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].firstName").value("Marie"))
                .andExpect(jsonPath("$[0].lastName").value("Dubois"))
                .andExpect(jsonPath("$[1].firstName").value("Pierre"))
                .andExpect(jsonPath("$[1].lastName").value("Martin"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/teacher - Devrait retourner une liste vide si aucun professeur")
    void findAll_Empty() throws Exception {
        // Given - Suppression de tous les professeurs
        teacherRepository.deleteAll();

        // When & Then - Vérification que la liste est vide
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/teacher/{id} - Devrait retourner les informations complètes du professeur")
    void findById_CompleteInfo() throws Exception {
        // When & Then - Vérification de toutes les propriétés
        mockMvc.perform(get("/api/teacher/{id}", teacher1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.firstName").exists())
                .andExpect(jsonPath("$.lastName").exists())
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.updatedAt").exists());
    }
}
