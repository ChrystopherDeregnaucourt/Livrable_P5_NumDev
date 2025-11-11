package com.openclassrooms.starterjwt.models;

/**
 * Tests unitaires pour le modèle User.
 * 
 * Cette classe teste l'entité JPA User qui représente un utilisateur :
 * - Builder Lombok pour la construction d'objets
 * - Getters et Setters générés par Lombok
 * - Méthode equals() basée sur l'ID uniquement (@EqualsAndHashCode(of = {"id"}))
 * - Méthode toString() générée
 * 
 * Ces tests valident le bon fonctionnement du code généré par Lombok
 * et des annotations JPA.
 */

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("User Model Unit Tests")
class UserTest {

    @Test
    @DisplayName("Should create user with builder")
    void builder_CreatesUser() {
        // When
        User user = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .admin(false)
                .build();

        // Then
        assertThat(user).isNotNull();
        assertThat(user.getId()).isEqualTo(1L);
        assertThat(user.getEmail()).isEqualTo("test@example.com");
        assertThat(user.getFirstName()).isEqualTo("John");
        assertThat(user.getLastName()).isEqualTo("Doe");
        assertThat(user.getPassword()).isEqualTo("password");
        assertThat(user.isAdmin()).isFalse();
    }

    @Test
    @DisplayName("Should create user with required args constructor")
    void requiredArgsConstructor_CreatesUser() {
        // When
        User user = new User("test@example.com", "Doe", "John", "password", false);

        // Then
        assertThat(user).isNotNull();
        assertThat(user.getEmail()).isEqualTo("test@example.com");
        assertThat(user.getFirstName()).isEqualTo("John");
        assertThat(user.getLastName()).isEqualTo("Doe");
        assertThat(user.getPassword()).isEqualTo("password");
        assertThat(user.isAdmin()).isFalse();
    }

    @Test
    @DisplayName("Should set and get properties")
    void settersAndGetters_Work() {
        // Given
        User user = new User();

        // When
        user.setId(2L);
        user.setEmail("new@example.com");
        user.setFirstName("Jane");
        user.setLastName("Smith");
        user.setPassword("newPassword");
        user.setAdmin(true);

        // Then
        assertThat(user.getId()).isEqualTo(2L);
        assertThat(user.getEmail()).isEqualTo("new@example.com");
        assertThat(user.getFirstName()).isEqualTo("Jane");
        assertThat(user.getLastName()).isEqualTo("Smith");
        assertThat(user.getPassword()).isEqualTo("newPassword");
        assertThat(user.isAdmin()).isTrue();
    }

    @Test
    @DisplayName("Should support method chaining")
    void methodChaining_Works() {
        // When
        User user = new User()
                .setId(3L)
                .setEmail("chain@example.com")
                .setFirstName("Chain")
                .setLastName("Test")
                .setPassword("password")
                .setAdmin(false);

        // Then
        assertThat(user.getId()).isEqualTo(3L);
        assertThat(user.getEmail()).isEqualTo("chain@example.com");
    }

    @Test
    @DisplayName("Should equals return true for same id")
    void equals_SameId_ReturnsTrue() {
        // Given
        User user1 = User.builder().id(1L).email("test1@example.com").firstName("John").lastName("Doe").password("pass").admin(false).build();
        User user2 = User.builder().id(1L).email("test2@example.com").firstName("Jane").lastName("Smith").password("pass2").admin(true).build();

        // When & Then
        assertThat(user1).isEqualTo(user2);
    }

    @Test
    @DisplayName("Should equals return false for different id")
    void equals_DifferentId_ReturnsFalse() {
        // Given
        User user1 = User.builder().id(1L).email("test@example.com").firstName("John").lastName("Doe").password("pass").admin(false).build();
        User user2 = User.builder().id(2L).email("test@example.com").firstName("John").lastName("Doe").password("pass").admin(false).build();

        // When & Then
        assertThat(user1).isNotEqualTo(user2);
    }

    @Test
    @DisplayName("Should hashCode be same for same id")
    void hashCode_SameId_ReturnsSameHashCode() {
        // Given
        User user1 = User.builder().id(1L).email("test1@example.com").firstName("John").lastName("Doe").password("pass").admin(false).build();
        User user2 = User.builder().id(1L).email("test2@example.com").firstName("Jane").lastName("Smith").password("pass2").admin(true).build();

        // When & Then
        assertThat(user1.hashCode()).isEqualTo(user2.hashCode());
    }

    @Test
    @DisplayName("Should toString contain relevant information")
    void toString_ContainsInformation() {
        // Given
        User user = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .admin(false)
                .build();

        // When
        String userString = user.toString();

        // Then
        assertThat(userString).contains("User");
        assertThat(userString).contains("test@example.com");
    }

    @Test
    @DisplayName("Should create admin user")
    void createAdminUser() {
        // When
        User admin = User.builder()
                .id(1L)
                .email("admin@example.com")
                .firstName("Admin")
                .lastName("User")
                .password("adminPass")
                .admin(true)
                .build();

        // Then
        assertThat(admin.isAdmin()).isTrue();
    }
}
