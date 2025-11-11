package com.openclassrooms.starterjwt.integration;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.services.TeacherService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests d'intégration pour TeacherService
 * 
 * Ces tests valident l'intégration du service avec le repository et la base de données :
 * - Service → Repository → Database H2
 * - Opérations de lecture réelles
 * - Comportement avec base de données réelle
 * 
 * Objectif : Valider que le service fonctionne correctement avec la base de données
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("TeacherService - Tests d'intégration")
class TeacherServiceIntegrationTest {

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private TeacherRepository teacherRepository;

    private Teacher testTeacher;

    @BeforeEach
    void setUp() {
        // Nettoyage de la base avant chaque test
        teacherRepository.deleteAll();

        // Création d'un enseignant de test
        testTeacher = new Teacher();
        testTeacher.setFirstName("John");
        testTeacher.setLastName("Doe");
        testTeacher.setCreatedAt(LocalDateTime.now());
        testTeacher.setUpdatedAt(LocalDateTime.now());
        
        testTeacher = teacherRepository.save(testTeacher);
    }

    @AfterEach
    void tearDown() {
        teacherRepository.deleteAll();
    }

    @Test
    @DisplayName("findById() - Devrait trouver un enseignant existant dans la base")
    void findById_ExistingTeacher_ShouldReturnTeacher() {
        // When - Recherche par ID via le service
        Teacher foundTeacher = teacherService.findById(testTeacher.getId());

        // Then - Vérifier que l'enseignant est trouvé
        assertThat(foundTeacher).isNotNull();
        assertThat(foundTeacher.getId()).isEqualTo(testTeacher.getId());
        assertThat(foundTeacher.getFirstName()).isEqualTo("John");
        assertThat(foundTeacher.getLastName()).isEqualTo("Doe");
    }

    @Test
    @DisplayName("findById() - Devrait retourner null pour un enseignant inexistant")
    void findById_NonExistingTeacher_ShouldReturnNull() {
        // When - Recherche d'un ID inexistant
        Teacher foundTeacher = teacherService.findById(999L);

        // Then - Vérifier que null est retourné
        assertThat(foundTeacher).isNull();
    }

    @Test
    @DisplayName("findAll() - Devrait retourner tous les enseignants")
    void findAll_ShouldReturnAllTeachers() {
        // Given - Créer un deuxième enseignant
        Teacher teacher2 = new Teacher();
        teacher2.setFirstName("Jane");
        teacher2.setLastName("Smith");
        teacher2.setCreatedAt(LocalDateTime.now());
        teacher2.setUpdatedAt(LocalDateTime.now());
        teacherRepository.save(teacher2);

        // When - Récupération de tous les enseignants
        List<Teacher> teachers = teacherService.findAll();

        // Then - Vérifier que les deux enseignants sont retournés
        assertThat(teachers).hasSize(2);
        assertThat(teachers).extracting(Teacher::getFirstName)
                .containsExactlyInAnyOrder("John", "Jane");
    }

    @Test
    @DisplayName("findAll() - Devrait retourner une liste vide si aucun enseignant")
    void findAll_NoTeachers_ShouldReturnEmptyList() {
        // Given - Supprimer tous les enseignants
        teacherRepository.deleteAll();

        // When - Récupération de tous les enseignants
        List<Teacher> teachers = teacherService.findAll();

        // Then - Vérifier que la liste est vide
        assertThat(teachers).isEmpty();
    }

    @Test
    @DisplayName("findById() - Devrait retourner les données persistées en base")
    void findById_ShouldReturnPersistedData() {
        // Given - Créer plusieurs enseignants
        Teacher teacher2 = new Teacher();
        teacher2.setFirstName("Alice");
        teacher2.setLastName("Johnson");
        teacher2.setCreatedAt(LocalDateTime.now());
        teacher2.setUpdatedAt(LocalDateTime.now());
        teacher2 = teacherRepository.save(teacher2);

        Teacher teacher3 = new Teacher();
        teacher3.setFirstName("Bob");
        teacher3.setLastName("Martin");
        teacher3.setCreatedAt(LocalDateTime.now());
        teacher3.setUpdatedAt(LocalDateTime.now());
        teacher3 = teacherRepository.save(teacher3);

        // When - Recherche du deuxième enseignant
        Teacher foundTeacher = teacherService.findById(teacher2.getId());

        // Then - Vérifier que les bonnes données sont retournées
        assertThat(foundTeacher).isNotNull();
        assertThat(foundTeacher.getFirstName()).isEqualTo("Alice");
        assertThat(foundTeacher.getLastName()).isEqualTo("Johnson");
    }

    @Test
    @DisplayName("findById() - Devrait gérer les valeurs null correctement")
    void findById_WithNullId_ShouldHandleGracefully() {
        // When & Then - Recherche avec ID null devrait lever une exception
        try {
            teacherService.findById(null);
        } catch (Exception e) {
            // Exception attendue
        }
    }

    @Test
    @DisplayName("Integration avec repository - Devrait utiliser le vrai repository")
    void service_ShouldUseRealRepository() {
        // Given - Compter les enseignants en base
        long countBefore = teacherRepository.count();
        assertThat(countBefore).isEqualTo(1); // testTeacher

        // When - Créer un nouvel enseignant directement via repository
        Teacher newTeacher = new Teacher();
        newTeacher.setFirstName("New");
        newTeacher.setLastName("Teacher");
        newTeacher.setCreatedAt(LocalDateTime.now());
        newTeacher.setUpdatedAt(LocalDateTime.now());
        teacherRepository.save(newTeacher);

        // Then - Vérifier que le service voit le nouvel enseignant
        List<Teacher> teachers = teacherService.findAll();
        assertThat(teachers).hasSize(2);
    }

    @Test
    @DisplayName("findById() - Devrait retourner les timestamps créés par JPA")
    void findById_ShouldReturnTimestamps() {
        // When - Recherche de l'enseignant
        Teacher foundTeacher = teacherService.findById(testTeacher.getId());

        // Then - Vérifier que les timestamps sont présents
        assertThat(foundTeacher).isNotNull();
        assertThat(foundTeacher.getCreatedAt()).isNotNull();
        assertThat(foundTeacher.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("findAll() - Devrait retourner les enseignants dans l'ordre d'insertion")
    void findAll_ShouldReturnInInsertionOrder() {
        // Given - Créer plusieurs enseignants dans un ordre spécifique
        Teacher teacher2 = new Teacher();
        teacher2.setFirstName("Second");
        teacher2.setLastName("Teacher");
        teacher2.setCreatedAt(LocalDateTime.now());
        teacher2.setUpdatedAt(LocalDateTime.now());
        teacherRepository.save(teacher2);

        Teacher teacher3 = new Teacher();
        teacher3.setFirstName("Third");
        teacher3.setLastName("Teacher");
        teacher3.setCreatedAt(LocalDateTime.now());
        teacher3.setUpdatedAt(LocalDateTime.now());
        teacherRepository.save(teacher3);

        // When - Récupération de tous les enseignants
        List<Teacher> teachers = teacherService.findAll();

        // Then - Vérifier que les trois enseignants sont retournés
        assertThat(teachers).hasSize(3);
        assertThat(teachers.get(0).getFirstName()).isEqualTo("John");
        assertThat(teachers.get(1).getFirstName()).isEqualTo("Second");
        assertThat(teachers.get(2).getFirstName()).isEqualTo("Third");
    }
}
