package com.openclassrooms.starterjwt.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour SessionController
 * 
 * Ces tests vérifient le comportement complet du système de gestion des sessions :
 * - CRUD complet sur les sessions
 * - Gestion de la participation des utilisateurs aux sessions
 * - Avec authentification Spring Security simulée
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("SessionController - Tests d'intégration")
class SessionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Teacher teacher;
    private User user;
    private Session session;

    @BeforeEach
    void setUp() {
        // Nettoyage de la base avant chaque test
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();

        // Création d'un professeur
        teacher = new Teacher();
        teacher.setFirstName("Marie");
        teacher.setLastName("Dubois");
        teacher.setCreatedAt(LocalDateTime.now());
        teacher.setUpdatedAt(LocalDateTime.now());
        teacher = teacherRepository.save(teacher);

        // Création d'un utilisateur
        user = new User();
        user.setEmail("user@example.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setPassword("password");
        user.setAdmin(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        // Création d'une session
        session = new Session();
        session.setName("Yoga Matinal");
        session.setDate(new Date());
        session.setDescription("Session de yoga du matin");
        session.setTeacher(teacher);
        session.setUsers(new ArrayList<>());
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        session = sessionRepository.save(session);
    }

    @AfterEach
    void tearDown() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/session/{id} - Devrait retourner une session existante")
    void findById_Success() throws Exception {
        // When & Then - Récupération de la session et vérification
        mockMvc.perform(get("/api/session/{id}", session.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(session.getId()))
                .andExpect(jsonPath("$.name").value("Yoga Matinal"))
                .andExpect(jsonPath("$.description").value("Session de yoga du matin"))
                .andExpect(jsonPath("$.teacher_id").value(teacher.getId()));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/session/{id} - Devrait retourner 404 pour une session inexistante")
    void findById_NotFound() throws Exception {
        // When & Then - Tentative de récupération d'une session inexistante
        mockMvc.perform(get("/api/session/{id}", 9999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/session/{id} - Devrait retourner 400 pour un ID invalide")
    void findById_InvalidId() throws Exception {
        // When & Then - Tentative avec un ID non numérique
        mockMvc.perform(get("/api/session/{id}", "invalid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/session - Devrait retourner toutes les sessions")
    void findAll_Success() throws Exception {
        // Given - Création d'une deuxième session
        Session session2 = new Session();
        session2.setName("Yoga du soir");
        session2.setDate(new Date());
        session2.setDescription("Session de yoga du soir");
        session2.setTeacher(teacher);
        session2.setUsers(new ArrayList<>());
        session2.setCreatedAt(LocalDateTime.now());
        session2.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session2);

        // When & Then - Récupération de toutes les sessions
        mockMvc.perform(get("/api/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Yoga Matinal"))
                .andExpect(jsonPath("$[1].name").value("Yoga du soir"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/session - Devrait créer une nouvelle session")
    void create_Success() throws Exception {
        // Given - Préparation d'une nouvelle session
        SessionDto newSessionDto = new SessionDto();
        newSessionDto.setName("Nouvelle session");
        newSessionDto.setDate(new Date());
        newSessionDto.setDescription("Description de la nouvelle session");
        newSessionDto.setTeacher_id(teacher.getId());
        newSessionDto.setUsers(new ArrayList<>());

        // When & Then - Création et vérification
        mockMvc.perform(post("/api/session")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newSessionDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nouvelle session"))
                .andExpect(jsonPath("$.description").value("Description de la nouvelle session"));

        // Vérification en base
        assert sessionRepository.count() == 2;
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /api/session/{id} - Devrait mettre à jour une session")
    void update_Success() throws Exception {
        // Given - Préparation de la mise à jour
        SessionDto updateDto = new SessionDto();
        updateDto.setName("Session modifiée");
        updateDto.setDate(session.getDate());
        updateDto.setDescription("Description modifiée");
        updateDto.setTeacher_id(teacher.getId());
        updateDto.setUsers(new ArrayList<>());

        // When & Then - Mise à jour et vérification
        mockMvc.perform(put("/api/session/{id}", session.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Session modifiée"))
                .andExpect(jsonPath("$.description").value("Description modifiée"));
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /api/session/{id} - Devrait retourner 400 pour un ID invalide")
    void update_InvalidId() throws Exception {
        // Given - DTO de mise à jour
        SessionDto updateDto = new SessionDto();
        updateDto.setName("Session");

        // When & Then - Tentative avec ID invalide
        mockMvc.perform(put("/api/session/{id}", "invalid")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/session/{id} - Devrait supprimer une session")
    void delete_Success() throws Exception {
        // When & Then - Suppression et vérification
        mockMvc.perform(delete("/api/session/{id}", session.getId()))
                .andExpect(status().isOk());

        // Vérification que la session n'existe plus
        assert sessionRepository.findById(session.getId()).isEmpty();
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/session/{id} - Devrait retourner 404 pour une session inexistante")
    void delete_NotFound() throws Exception {
        // When & Then - Tentative de suppression d'une session inexistante
        mockMvc.perform(delete("/api/session/{id}", 9999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/session/{id}/participate/{userId} - Devrait ajouter un participant")
    void participate_Success() throws Exception {
        // When & Then - Ajout de participation
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", 
                session.getId(), user.getId()))
                .andExpect(status().isOk());

        // Vérification que l'utilisateur participe à la session
        Session updatedSession = sessionRepository.findById(session.getId()).orElseThrow();
        assert updatedSession.getUsers().size() == 1;
        assert updatedSession.getUsers().get(0).getId().equals(user.getId());
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/session/{id}/participate/{userId} - Devrait retirer un participant")
    void noLongerParticipate_Success() throws Exception {
        // Given - Ajout d'abord de l'utilisateur à la session
        session.getUsers().add(user);
        sessionRepository.save(session);

        // When & Then - Retrait de participation
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", 
                session.getId(), user.getId()))
                .andExpect(status().isOk());

        // Vérification que l'utilisateur ne participe plus
        Session updatedSession = sessionRepository.findById(session.getId()).orElseThrow();
        assert updatedSession.getUsers().isEmpty();
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/session/{id}/participate/{userId} - Devrait retourner 400 pour ID invalide")
    void participate_InvalidId() throws Exception {
        // When & Then - Tentative avec ID de session invalide
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", 
                "invalid", user.getId()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/session/{id}/participate/{userId} - Devrait retourner 400 pour user ID invalide")
    void noLongerParticipate_InvalidUserId() throws Exception {
        // When & Then - Tentative avec ID utilisateur invalide
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", 
                session.getId(), "invalid"))
                .andExpect(status().isBadRequest());
    }
}
