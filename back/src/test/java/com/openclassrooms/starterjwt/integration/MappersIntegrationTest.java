package com.openclassrooms.starterjwt.integration;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.mapper.UserMapper;
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
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests d'intégration pour les Mappers MapStruct
 * 
 * Ces tests valident le mapping entre entités et DTOs :
 * - Avec les vrais mappers générés par MapStruct
 * - Avec les services injectés (pour SessionMapper)
 * - Avec le contexte Spring complet
 * 
 * Objectif : Valider que les mappers générés fonctionnent correctement
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Mappers - Tests d'intégration")
class MappersIntegrationTest {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private TeacherMapper teacherMapper;

    @Autowired
    private SessionMapper sessionMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SessionRepository sessionRepository;

    private User testUser;
    private Teacher testTeacher;
    private Session testSession;

    @BeforeEach
    void setUp() {
        // Nettoyage de la base avant chaque test
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();

        // Création d'un utilisateur de test
        testUser = new User();
        testUser.setEmail("user@example.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setPassword("password123");
        testUser.setAdmin(false);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());
        testUser = userRepository.save(testUser);

        // Création d'un enseignant de test
        testTeacher = new Teacher();
        testTeacher.setFirstName("Jane");
        testTeacher.setLastName("Smith");
        testTeacher.setCreatedAt(LocalDateTime.now());
        testTeacher.setUpdatedAt(LocalDateTime.now());
        testTeacher = teacherRepository.save(testTeacher);

        // Création d'une session de test
        testSession = new Session();
        testSession.setName("Yoga Session");
        testSession.setDate(new Date());
        testSession.setDescription("Test session description");
        testSession.setTeacher(testTeacher);
        testSession.setUsers(new ArrayList<>(Arrays.asList(testUser)));
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

    // ==================== UserMapper Tests ====================

    @Test
    @DisplayName("UserMapper.toDto() - Devrait mapper User vers UserDto correctement")
    void userMapperToDto_ShouldMapAllFields() {
        // When - Mapping vers DTO
        UserDto userDto = userMapper.toDto(testUser);

        // Then - Vérifier que tous les champs sont mappés
        assertThat(userDto).isNotNull();
        assertThat(userDto.getId()).isEqualTo(testUser.getId());
        assertThat(userDto.getEmail()).isEqualTo("user@example.com");
        assertThat(userDto.getFirstName()).isEqualTo("John");
        assertThat(userDto.getLastName()).isEqualTo("Doe");
        assertThat(userDto.isAdmin()).isFalse();
        assertThat(userDto.getPassword()).isEqualTo("password123");
        assertThat(userDto.getCreatedAt()).isNotNull();
        assertThat(userDto.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("UserMapper.toEntity() - Devrait mapper UserDto vers User correctement")
    void userMapperToEntity_ShouldMapAllFields() {
        // Given - Créer un UserDto
        UserDto userDto = new UserDto();
        userDto.setEmail("newuser@example.com");
        userDto.setFirstName("Alice");
        userDto.setLastName("Johnson");
        userDto.setPassword("newpassword");
        userDto.setAdmin(true);

        // When - Mapping vers entité
        User user = userMapper.toEntity(userDto);

        // Then - Vérifier que tous les champs sont mappés
        assertThat(user).isNotNull();
        assertThat(user.getEmail()).isEqualTo("newuser@example.com");
        assertThat(user.getFirstName()).isEqualTo("Alice");
        assertThat(user.getLastName()).isEqualTo("Johnson");
        assertThat(user.getPassword()).isEqualTo("newpassword");
        assertThat(user.isAdmin()).isTrue();
    }

    @Test
    @DisplayName("UserMapper - Devrait gérer les valeurs null")
    void userMapperToDto_WithNullUser_ShouldReturnNull() {
        // When - Mapping d'un objet null
        User nullUser = null;
        UserDto userDto = userMapper.toDto(nullUser);

        // Then - Devrait retourner null
        assertThat(userDto).isNull();
    }

    // ==================== TeacherMapper Tests ====================

    @Test
    @DisplayName("TeacherMapper.toDto() - Devrait mapper Teacher vers TeacherDto correctement")
    void teacherMapperToDto_ShouldMapAllFields() {
        // When - Mapping vers DTO
        TeacherDto teacherDto = teacherMapper.toDto(testTeacher);

        // Then - Vérifier que tous les champs sont mappés
        assertThat(teacherDto).isNotNull();
        assertThat(teacherDto.getId()).isEqualTo(testTeacher.getId());
        assertThat(teacherDto.getFirstName()).isEqualTo("Jane");
        assertThat(teacherDto.getLastName()).isEqualTo("Smith");
        assertThat(teacherDto.getCreatedAt()).isNotNull();
        assertThat(teacherDto.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("TeacherMapper.toEntity() - Devrait mapper TeacherDto vers Teacher correctement")
    void teacherMapperToEntity_ShouldMapAllFields() {
        // Given - Créer un TeacherDto
        TeacherDto teacherDto = new TeacherDto();
        teacherDto.setFirstName("Bob");
        teacherDto.setLastName("Martin");

        // When - Mapping vers entité
        Teacher teacher = teacherMapper.toEntity(teacherDto);

        // Then - Vérifier que tous les champs sont mappés
        assertThat(teacher).isNotNull();
        assertThat(teacher.getFirstName()).isEqualTo("Bob");
        assertThat(teacher.getLastName()).isEqualTo("Martin");
    }

    @Test
    @DisplayName("TeacherMapper - Devrait gérer les valeurs null")
    void teacherMapperToDto_WithNullTeacher_ShouldReturnNull() {
        // When - Mapping d'un objet null
        Teacher nullTeacher = null;
        TeacherDto teacherDto = teacherMapper.toDto(nullTeacher);

        // Then - Devrait retourner null
        assertThat(teacherDto).isNull();
    }

    // ==================== SessionMapper Tests ====================

    @Test
    @DisplayName("SessionMapper.toDto() - Devrait mapper Session vers SessionDto correctement")
    void sessionMapperToDto_ShouldMapAllFields() {
        // When - Mapping vers DTO
        SessionDto sessionDto = sessionMapper.toDto(testSession);

        // Then - Vérifier que tous les champs sont mappés
        assertThat(sessionDto).isNotNull();
        assertThat(sessionDto.getId()).isEqualTo(testSession.getId());
        assertThat(sessionDto.getName()).isEqualTo("Yoga Session");
        assertThat(sessionDto.getDescription()).isEqualTo("Test session description");
        assertThat(sessionDto.getDate()).isNotNull();
        assertThat(sessionDto.getTeacher_id()).isEqualTo(testTeacher.getId());
        assertThat(sessionDto.getUsers()).hasSize(1);
        assertThat(sessionDto.getUsers().get(0)).isEqualTo(testUser.getId());
        assertThat(sessionDto.getCreatedAt()).isNotNull();
        assertThat(sessionDto.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("SessionMapper.toDto() - Devrait mapper une session sans utilisateurs")
    void sessionMapperToDto_WithoutUsers_ShouldMapCorrectly() {
        // Given - Session sans utilisateurs
        testSession.setUsers(new ArrayList<>());
        testSession = sessionRepository.save(testSession);

        // When - Mapping vers DTO
        SessionDto sessionDto = sessionMapper.toDto(testSession);

        // Then - Vérifier que la liste d'utilisateurs est vide
        assertThat(sessionDto).isNotNull();
        assertThat(sessionDto.getUsers()).isEmpty();
    }

    @Test
    @DisplayName("SessionMapper.toEntity() - Devrait mapper SessionDto vers Session correctement")
    void sessionMapperToEntity_ShouldMapAllFields() {
        // Given - Créer un SessionDto
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("New Session");
        sessionDto.setDescription("New description");
        sessionDto.setDate(new Date());
        sessionDto.setTeacher_id(testTeacher.getId());
        sessionDto.setUsers(Arrays.asList(testUser.getId()));

        // When - Mapping vers entité
        Session session = sessionMapper.toEntity(sessionDto);

        // Then - Vérifier que tous les champs sont mappés
        assertThat(session).isNotNull();
        assertThat(session.getName()).isEqualTo("New Session");
        assertThat(session.getDescription()).isEqualTo("New description");
        assertThat(session.getDate()).isNotNull();
        assertThat(session.getTeacher()).isNotNull();
        assertThat(session.getTeacher().getId()).isEqualTo(testTeacher.getId());
        assertThat(session.getUsers()).hasSize(1);
        assertThat(session.getUsers().get(0).getId()).isEqualTo(testUser.getId());
    }

    @Test
    @DisplayName("SessionMapper.toEntity() - Devrait gérer une liste d'utilisateurs vide")
    void sessionMapperToEntity_WithEmptyUsers_ShouldMapCorrectly() {
        // Given - SessionDto sans utilisateurs
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("Empty Users Session");
        sessionDto.setDescription("No users");
        sessionDto.setDate(new Date());
        sessionDto.setTeacher_id(testTeacher.getId());
        sessionDto.setUsers(new ArrayList<>());

        // When - Mapping vers entité
        Session session = sessionMapper.toEntity(sessionDto);

        // Then - Vérifier que la liste d'utilisateurs est vide
        assertThat(session).isNotNull();
        assertThat(session.getUsers()).isEmpty();
    }

    @Test
    @DisplayName("SessionMapper.toEntity() - Devrait gérer les utilisateurs null")
    void sessionMapperToEntity_WithNullUsers_ShouldMapCorrectly() {
        // Given - SessionDto avec users = null
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("Null Users Session");
        sessionDto.setDescription("Null users");
        sessionDto.setDate(new Date());
        sessionDto.setTeacher_id(testTeacher.getId());
        sessionDto.setUsers(null);

        // When - Mapping vers entité
        Session session = sessionMapper.toEntity(sessionDto);

        // Then - Devrait gérer gracieusement
        assertThat(session).isNotNull();
        assertThat(session.getUsers()).isEmpty();
    }

    @Test
    @DisplayName("SessionMapper - Devrait gérer les valeurs null")
    void sessionMapperToDto_WithNullSession_ShouldReturnNull() {
        // When - Mapping d'un objet null
        Session nullSession = null;
        SessionDto sessionDto = sessionMapper.toDto(nullSession);

        // Then - Devrait retourner null
        assertThat(sessionDto).isNull();
    }

    @Test
    @DisplayName("SessionMapper.toEntity() puis toDto() - Devrait être cohérent (round-trip)")
    void sessionMapperRoundTrip_ShouldBeConsistent() {
        // Given - Créer un SessionDto
        SessionDto originalDto = new SessionDto();
        originalDto.setName("Round Trip Session");
        originalDto.setDescription("Testing round trip");
        originalDto.setDate(new Date());
        originalDto.setTeacher_id(testTeacher.getId());
        originalDto.setUsers(Arrays.asList(testUser.getId()));

        // When - toEntity puis toDto
        Session session = sessionMapper.toEntity(originalDto);
        SessionDto resultDto = sessionMapper.toDto(session);

        // Then - Vérifier que les données sont cohérentes
        assertThat(resultDto.getName()).isEqualTo(originalDto.getName());
        assertThat(resultDto.getDescription()).isEqualTo(originalDto.getDescription());
        assertThat(resultDto.getTeacher_id()).isEqualTo(originalDto.getTeacher_id());
        assertThat(resultDto.getUsers()).hasSize(1);
        assertThat(resultDto.getUsers().get(0)).isEqualTo(testUser.getId());
    }

    @Test
    @DisplayName("SessionMapper.toDto() - Devrait mapper plusieurs utilisateurs correctement")
    void sessionMapperToDto_WithMultipleUsers_ShouldMapAllUsers() {
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

        // Ajouter le deuxième utilisateur à la session
        testSession.getUsers().add(user2);
        testSession = sessionRepository.save(testSession);

        // When - Mapping vers DTO
        SessionDto sessionDto = sessionMapper.toDto(testSession);

        // Then - Vérifier que les deux utilisateurs sont mappés
        assertThat(sessionDto.getUsers()).hasSize(2);
        assertThat(sessionDto.getUsers()).containsExactlyInAnyOrder(testUser.getId(), user2.getId());
    }

    @Test
    @DisplayName("Mappers - Intégration complète avec services")
    void mappersIntegration_WithServices_ShouldWork() {
        // Given - SessionMapper utilise UserService et TeacherService
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("Integration Session");
        sessionDto.setDescription("Testing integration with services");
        sessionDto.setDate(new Date());
        sessionDto.setTeacher_id(testTeacher.getId());
        sessionDto.setUsers(Arrays.asList(testUser.getId()));

        // When - Mapping vers entité (utilise les services injectés)
        Session session = sessionMapper.toEntity(sessionDto);

        // Then - Vérifier que les entités sont chargées via les services
        assertThat(session.getTeacher()).isNotNull();
        assertThat(session.getTeacher().getFirstName()).isEqualTo("Jane");
        assertThat(session.getUsers()).hasSize(1);
        assertThat(session.getUsers().get(0).getFirstName()).isEqualTo("John");
    }
}
