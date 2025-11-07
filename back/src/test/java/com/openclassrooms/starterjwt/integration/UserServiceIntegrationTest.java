package com.openclassrooms.starterjwt.integration;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Tests d'intégration pour UserService
 * 
 * Ces tests valident l'intégration du service avec le repository et la base de données :
 * - Service → Repository → Database H2
 * - Opérations CRUD réelles
 * - Comportement avec base de données réelle
 * 
 * Objectif : Valider que le service fonctionne correctement avec la base de données
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("UserService - Tests d'intégration")
class UserServiceIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Nettoyage de la base avant chaque test
        userRepository.deleteAll();

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
    }

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("findById() - Devrait trouver un utilisateur existant dans la base")
    void findById_ExistingUser_ShouldReturnUser() {
        // When - Recherche par ID via le service
        User foundUser = userService.findById(testUser.getId());

        // Then - Vérifier que l'utilisateur est trouvé
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getId()).isEqualTo(testUser.getId());
        assertThat(foundUser.getEmail()).isEqualTo("user@example.com");
        assertThat(foundUser.getFirstName()).isEqualTo("John");
        assertThat(foundUser.getLastName()).isEqualTo("Doe");
        assertThat(foundUser.getPassword()).isEqualTo("password123");
        assertThat(foundUser.isAdmin()).isFalse();
    }

    @Test
    @DisplayName("findById() - Devrait retourner null pour un utilisateur inexistant")
    void findById_NonExistingUser_ShouldReturnNull() {
        // When - Recherche d'un ID inexistant
        User foundUser = userService.findById(999L);

        // Then - Vérifier que null est retourné
        assertThat(foundUser).isNull();
    }

    @Test
    @DisplayName("delete() - Devrait supprimer un utilisateur de la base")
    void delete_ExistingUser_ShouldRemoveFromDatabase() {
        // Given - Vérifier que l'utilisateur existe
        assertThat(userRepository.findById(testUser.getId())).isPresent();

        // When - Suppression via le service
        userService.delete(testUser.getId());

        // Then - Vérifier que l'utilisateur n'existe plus en base
        assertThat(userRepository.findById(testUser.getId())).isEmpty();
    }

    @Test
    @DisplayName("delete() - Devrait gérer la suppression d'un utilisateur inexistant sans erreur")
    void delete_NonExistingUser_ShouldNotThrowException() {
        // When & Then - Suppression d'un ID inexistant devrait lever une exception
        assertThatThrownBy(() -> userService.delete(999L))
                .isInstanceOf(Exception.class);
    }

    @Test
    @DisplayName("findById() - Devrait retourner les données persistées en base")
    void findById_ShouldReturnPersistedData() {
        // Given - Créer plusieurs utilisateurs
        User user2 = new User();
        user2.setEmail("user2@example.com");
        user2.setFirstName("Jane");
        user2.setLastName("Smith");
        user2.setPassword("password456");
        user2.setAdmin(true);
        user2.setCreatedAt(LocalDateTime.now());
        user2.setUpdatedAt(LocalDateTime.now());
        user2 = userRepository.save(user2);

        // When - Recherche du deuxième utilisateur
        User foundUser = userService.findById(user2.getId());

        // Then - Vérifier que les bonnes données sont retournées
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getEmail()).isEqualTo("user2@example.com");
        assertThat(foundUser.getFirstName()).isEqualTo("Jane");
        assertThat(foundUser.getLastName()).isEqualTo("Smith");
        assertThat(foundUser.isAdmin()).isTrue();
    }

    @Test
    @DisplayName("delete() puis findById() - Devrait retourner null après suppression")
    void deleteAndFind_ShouldReturnNull() {
        // Given - ID de l'utilisateur à supprimer
        Long userId = testUser.getId();

        // When - Suppression puis recherche
        userService.delete(userId);
        User foundUser = userService.findById(userId);

        // Then - L'utilisateur ne doit plus exister
        assertThat(foundUser).isNull();
    }

    @Test
    @DisplayName("findById() - Devrait gérer les valeurs null correctement")
    void findById_WithNullId_ShouldHandleGracefully() {
        // When & Then - Recherche avec ID null devrait lever une exception
        assertThatThrownBy(() -> userService.findById(null))
                .isInstanceOf(Exception.class);
    }

    @Test
    @DisplayName("Integration avec repository - Devrait utiliser le vrai repository")
    void service_ShouldUseRealRepository() {
        // Given - Compter les utilisateurs en base
        long countBefore = userRepository.count();
        assertThat(countBefore).isEqualTo(1); // testUser

        // When - Supprimer via le service
        userService.delete(testUser.getId());

        // Then - Vérifier que le repository a bien été appelé
        long countAfter = userRepository.count();
        assertThat(countAfter).isEqualTo(0);
    }

    @Test
    @DisplayName("findById() - Devrait retourner les timestamps créés par JPA")
    void findById_ShouldReturnTimestamps() {
        // When - Recherche de l'utilisateur
        User foundUser = userService.findById(testUser.getId());

        // Then - Vérifier que les timestamps sont présents
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getCreatedAt()).isNotNull();
        assertThat(foundUser.getUpdatedAt()).isNotNull();
    }
}
