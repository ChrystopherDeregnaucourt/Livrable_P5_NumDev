package com.openclassrooms.starterjwt.payload.response;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JwtResponse Unit Tests")
class JwtResponseTest {

    @Test
    @DisplayName("Should create JwtResponse with constructor")
    void constructor_CreatesJwtResponse() {
        // When
        JwtResponse response = new JwtResponse(
                "jwt.token.here",
                1L,
                "test@example.com",
                "John",
                "Doe",
                false
        );

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt.token.here");
        assertThat(response.getType()).isEqualTo("Bearer");
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("test@example.com");
        assertThat(response.getFirstName()).isEqualTo("John");
        assertThat(response.getLastName()).isEqualTo("Doe");
        assertThat(response.getAdmin()).isFalse();
    }

    @Test
    @DisplayName("Should set and get token")
    void setAndGetToken() {
        // Given
        JwtResponse response = new JwtResponse("token", 1L, "user@example.com", "John", "Doe", false);

        // When
        response.setToken("new.token");

        // Then
        assertThat(response.getToken()).isEqualTo("new.token");
    }

    @Test
    @DisplayName("Should set and get type")
    void setAndGetType() {
        // Given
        JwtResponse response = new JwtResponse("token", 1L, "user@example.com", "John", "Doe", false);

        // When
        response.setType("CustomType");

        // Then
        assertThat(response.getType()).isEqualTo("CustomType");
    }

    @Test
    @DisplayName("Should set and get id")
    void setAndGetId() {
        // Given
        JwtResponse response = new JwtResponse("token", 1L, "user@example.com", "John", "Doe", false);

        // When
        response.setId(2L);

        // Then
        assertThat(response.getId()).isEqualTo(2L);
    }

    @Test
    @DisplayName("Should set and get username")
    void setAndGetUsername() {
        // Given
        JwtResponse response = new JwtResponse("token", 1L, "user@example.com", "John", "Doe", false);

        // When
        response.setUsername("newuser@example.com");

        // Then
        assertThat(response.getUsername()).isEqualTo("newuser@example.com");
    }

    @Test
    @DisplayName("Should set and get firstName")
    void setAndGetFirstName() {
        // Given
        JwtResponse response = new JwtResponse("token", 1L, "user@example.com", "John", "Doe", false);

        // When
        response.setFirstName("Jane");

        // Then
        assertThat(response.getFirstName()).isEqualTo("Jane");
    }

    @Test
    @DisplayName("Should set and get lastName")
    void setAndGetLastName() {
        // Given
        JwtResponse response = new JwtResponse("token", 1L, "user@example.com", "John", "Doe", false);

        // When
        response.setLastName("Smith");

        // Then
        assertThat(response.getLastName()).isEqualTo("Smith");
    }

    @Test
    @DisplayName("Should set and get admin")
    void setAndGetAdmin() {
        // Given
        JwtResponse response = new JwtResponse("token", 1L, "user@example.com", "John", "Doe", false);

        // When
        response.setAdmin(true);

        // Then
        assertThat(response.getAdmin()).isTrue();
    }

    @Test
    @DisplayName("Should default type to Bearer")
    void defaultTypeIsBearer() {
        // When
        JwtResponse response = new JwtResponse("token", 1L, "user@example.com", "John", "Doe", false);

        // Then
        assertThat(response.getType()).isEqualTo("Bearer");
    }

    @Test
    @DisplayName("Should create admin user response")
    void createAdminResponse() {
        // When
        JwtResponse response = new JwtResponse(
                "admin.token",
                2L,
                "admin@example.com",
                "Admin",
                "User",
                true
        );

        // Then
        assertThat(response.getAdmin()).isTrue();
        assertThat(response.getUsername()).isEqualTo("admin@example.com");
    }
}
