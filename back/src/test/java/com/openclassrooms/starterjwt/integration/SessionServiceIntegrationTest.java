package com.openclassrooms.starterjwt.integration;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.services.SessionService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Tests d'intégration pour SessionService
 * 
 * Ces tests valident l'intégration du service avec les repositories et la base de données :
 * - Service → Repositories → Database H2
 * - Opérations CRUD réelles
 * - Gestion des relations (Session ↔ Teacher, Session ↔ Users)
 * - Gestion des participations utilisateurs
 * 
 * Objectif : Valider la logique métier complexe avec la vraie base de données
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("SessionService - Tests d'intégration")
class SessionServiceIntegrationTest {

    @Autowired
    private SessionService sessionService;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    private Session testSession;
    private Teacher testTeacher;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Nettoyage de la base avant chaque test
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();

        // Création d'un enseignant de test
        testTeacher = new Teacher();
        testTeacher.setFirstName("John");
        testTeacher.setLastName("Doe");
        testTeacher.setCreatedAt(LocalDateTime.now());
        testTeacher.setUpdatedAt(LocalDateTime.now());
        testTeacher = teacherRepository.save(testTeacher);

        // Création d'un utilisateur de test
        testUser = new User();
        testUser.setEmail("user@example.com");
        testUser.setFirstName("Jane");
        testUser.setLastName("Smith");
        testUser.setPassword("password123");
        testUser.setAdmin(false);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());
        testUser = userRepository.save(testUser);

        // Création d'une session de test
        testSession = new Session();
        testSession.setName("Yoga Session");
        testSession.setDate(new Date());
        testSession.setDescription("Test session");
        testSession.setTeacher(testTeacher);
        testSession.setUsers(new ArrayList<>());
        testSession.setCreatedAt(LocalDateTime.now());
        testSession.setUpdatedAt(LocalDateTime.now());
        testSession = sessionRepository.save(testSession);
    }

    @AfterEach
    void tearDown() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();
    }

    @Test
    @DisplayName("create() - Devrait créer une nouvelle session en base")
    void create_NewSession_ShouldPersistToDatabase() {
        // Given - Nouvelle session
        Session newSession = new Session();
        newSession.setName("New Yoga Session");
        newSession.setDate(new Date());
        newSession.setDescription("New test session");
        newSession.setTeacher(testTeacher);
        newSession.setUsers(new ArrayList<>());

        // When - Création via le service
        Session createdSession = sessionService.create(newSession);

        // Then - Vérifier que la session est bien créée
        assertThat(createdSession).isNotNull();
        assertThat(createdSession.getId()).isNotNull();
        assertThat(createdSession.getName()).isEqualTo("New Yoga Session");
        
        // Vérifier que la session existe bien en base
        Session foundInDb = sessionRepository.findById(createdSession.getId()).orElse(null);
        assertThat(foundInDb).isNotNull();
        assertThat(foundInDb.getName()).isEqualTo("New Yoga Session");
    }

    @Test
    @DisplayName("getById() - Devrait trouver une session existante")
    void getById_ExistingSession_ShouldReturnSession() {
        // When - Recherche par ID
        Session foundSession = sessionService.getById(testSession.getId());

        // Then - Vérifier que la session est trouvée
        assertThat(foundSession).isNotNull();
        assertThat(foundSession.getId()).isEqualTo(testSession.getId());
        assertThat(foundSession.getName()).isEqualTo("Yoga Session");
        assertThat(foundSession.getTeacher()).isNotNull();
        assertThat(foundSession.getTeacher().getId()).isEqualTo(testTeacher.getId());
    }

    @Test
    @DisplayName("getById() - Devrait retourner null pour une session inexistante")
    void getById_NonExistingSession_ShouldReturnNull() {
        // When - Recherche d'un ID inexistant
        Session foundSession = sessionService.getById(999L);

        // Then - Vérifier que null est retourné
        assertThat(foundSession).isNull();
    }

    @Test
    @DisplayName("findAll() - Devrait retourner toutes les sessions")
    void findAll_ShouldReturnAllSessions() {
        // Given - Créer une deuxième session
        Session session2 = new Session();
        session2.setName("Second Session");
        session2.setDate(new Date());
        session2.setDescription("Second test session");
        session2.setTeacher(testTeacher);
        session2.setUsers(new ArrayList<>());
        sessionRepository.save(session2);

        // When - Récupération de toutes les sessions
        List<Session> sessions = sessionService.findAll();

        // Then - Vérifier que les deux sessions sont retournées
        assertThat(sessions).hasSize(2);
        assertThat(sessions).extracting(Session::getName)
                .containsExactlyInAnyOrder("Yoga Session", "Second Session");
    }

    @Test
    @DisplayName("update() - Devrait mettre à jour une session existante")
    void update_ExistingSession_ShouldPersistChanges() {
        // Given - Modification de la session
        Session updatedSession = new Session();
        updatedSession.setName("Updated Yoga Session");
        updatedSession.setDate(new Date());
        updatedSession.setDescription("Updated description");
        updatedSession.setTeacher(testTeacher);
        updatedSession.setUsers(new ArrayList<>());

        // When - Mise à jour via le service
        Session result = sessionService.update(testSession.getId(), updatedSession);

        // Then - Vérifier que la mise à jour est persistée
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testSession.getId());
        assertThat(result.getName()).isEqualTo("Updated Yoga Session");
        
        // Vérifier en base
        Session foundInDb = sessionRepository.findById(testSession.getId()).orElse(null);
        assertThat(foundInDb).isNotNull();
        assertThat(foundInDb.getName()).isEqualTo("Updated Yoga Session");
    }

    @Test
    @DisplayName("delete() - Devrait supprimer une session de la base")
    void delete_ExistingSession_ShouldRemoveFromDatabase() {
        // Given - Vérifier que la session existe
        assertThat(sessionRepository.findById(testSession.getId())).isPresent();

        // When - Suppression via le service
        sessionService.delete(testSession.getId());

        // Then - Vérifier que la session n'existe plus
        assertThat(sessionRepository.findById(testSession.getId())).isEmpty();
    }

    @Test
    @DisplayName("participate() - Devrait ajouter un utilisateur à une session")
    void participate_ValidUserAndSession_ShouldAddUserToSession() {
        // When - Ajout de l'utilisateur à la session
        sessionService.participate(testSession.getId(), testUser.getId());

        // Then - Vérifier que l'utilisateur est bien ajouté
        Session updatedSession = sessionRepository.findById(testSession.getId()).orElse(null);
        assertThat(updatedSession).isNotNull();
        assertThat(updatedSession.getUsers()).hasSize(1);
        assertThat(updatedSession.getUsers().get(0).getId()).isEqualTo(testUser.getId());
    }

    @Test
    @DisplayName("participate() - Devrait lever NotFoundException si la session n'existe pas")
    void participate_NonExistingSession_ShouldThrowNotFoundException() {
        // When & Then - Participation à une session inexistante
        assertThatThrownBy(() -> sessionService.participate(999L, testUser.getId()))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("participate() - Devrait lever NotFoundException si l'utilisateur n'existe pas")
    void participate_NonExistingUser_ShouldThrowNotFoundException() {
        // When & Then - Participation d'un utilisateur inexistant
        assertThatThrownBy(() -> sessionService.participate(testSession.getId(), 999L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("participate() - Devrait lever BadRequestException si l'utilisateur participe déjà")
    void participate_UserAlreadyParticipating_ShouldThrowBadRequestException() {
        // Given - L'utilisateur participe déjà à la session
        sessionService.participate(testSession.getId(), testUser.getId());

        // When & Then - Tentative de participation à nouveau
        assertThatThrownBy(() -> sessionService.participate(testSession.getId(), testUser.getId()))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("noLongerParticipate() - Devrait retirer un utilisateur d'une session")
    void noLongerParticipate_ParticipatingUser_ShouldRemoveUserFromSession() {
        // Given - L'utilisateur participe à la session
        sessionService.participate(testSession.getId(), testUser.getId());
        
        // Vérifier que l'utilisateur participe
        Session sessionBefore = sessionRepository.findById(testSession.getId()).orElse(null);
        assertThat(sessionBefore.getUsers()).hasSize(1);

        // When - Retrait de la participation
        sessionService.noLongerParticipate(testSession.getId(), testUser.getId());

        // Then - Vérifier que l'utilisateur n'est plus dans la session
        Session sessionAfter = sessionRepository.findById(testSession.getId()).orElse(null);
        assertThat(sessionAfter).isNotNull();
        assertThat(sessionAfter.getUsers()).isEmpty();
    }

    @Test
    @DisplayName("noLongerParticipate() - Devrait lever NotFoundException si la session n'existe pas")
    void noLongerParticipate_NonExistingSession_ShouldThrowNotFoundException() {
        // When & Then - Retrait de participation d'une session inexistante
        assertThatThrownBy(() -> sessionService.noLongerParticipate(999L, testUser.getId()))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("noLongerParticipate() - Devrait lever BadRequestException si l'utilisateur ne participe pas")
    void noLongerParticipate_UserNotParticipating_ShouldThrowBadRequestException() {
        // When & Then - Retrait alors que l'utilisateur ne participe pas
        assertThatThrownBy(() -> sessionService.noLongerParticipate(testSession.getId(), testUser.getId()))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("participate() - Devrait gérer plusieurs utilisateurs dans une session")
    void participate_MultipleUsers_ShouldAddAllUsers() {
        // Given - Créer un deuxième utilisateur
        User user2 = new User();
        user2.setEmail("user2@example.com");
        user2.setFirstName("Bob");
        user2.setLastName("Martin");
        user2.setPassword("password456");
        user2.setAdmin(false);
        user2.setCreatedAt(LocalDateTime.now());
        user2.setUpdatedAt(LocalDateTime.now());
        user2 = userRepository.save(user2);

        // When - Ajout de deux utilisateurs
        sessionService.participate(testSession.getId(), testUser.getId());
        sessionService.participate(testSession.getId(), user2.getId());

        // Then - Vérifier que les deux utilisateurs participent
        Session updatedSession = sessionRepository.findById(testSession.getId()).orElse(null);
        assertThat(updatedSession).isNotNull();
        assertThat(updatedSession.getUsers()).hasSize(2);
        assertThat(updatedSession.getUsers())
                .extracting(User::getId)
                .containsExactlyInAnyOrder(testUser.getId(), user2.getId());
    }

    @Test
    @DisplayName("Integration complète - Cycle de vie complet d'une session")
    void fullLifecycle_CreateUpdateParticipateDelete() {
        // 1. Créer une session
        Session newSession = new Session();
        newSession.setName("Full Lifecycle Session");
        newSession.setDate(new Date());
        newSession.setDescription("Test full lifecycle");
        newSession.setTeacher(testTeacher);
        newSession.setUsers(new ArrayList<>());
        Session created = sessionService.create(newSession);
        assertThat(created.getId()).isNotNull();

        // 2. Ajouter un participant
        sessionService.participate(created.getId(), testUser.getId());
        Session withParticipant = sessionService.getById(created.getId());
        assertThat(withParticipant.getUsers()).hasSize(1);

        // 3. Mettre à jour la session
        Session toUpdate = new Session();
        toUpdate.setName("Updated Full Lifecycle Session");
        toUpdate.setDate(new Date());
        toUpdate.setDescription("Updated");
        toUpdate.setTeacher(testTeacher);
        toUpdate.setUsers(withParticipant.getUsers());
        Session updated = sessionService.update(created.getId(), toUpdate);
        assertThat(updated.getName()).isEqualTo("Updated Full Lifecycle Session");

        // 4. Retirer le participant
        sessionService.noLongerParticipate(created.getId(), testUser.getId());
        Session withoutParticipant = sessionService.getById(created.getId());
        assertThat(withoutParticipant.getUsers()).isEmpty();

        // 5. Supprimer la session
        sessionService.delete(created.getId());
        assertThat(sessionRepository.findById(created.getId())).isEmpty();
    }
}
