package com.openclassrooms.starterjwt.payload.request;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("LoginRequest Unit Tests")
class LoginRequestTest {

    @Test
    @DisplayName("Should set and get email")
    void setAndGetEmail() {
        // Given
        LoginRequest request = new LoginRequest();

        // When
        request.setEmail("test@example.com");

        // Then
        assertThat(request.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("Should set and get password")
    void setAndGetPassword() {
        // Given
        LoginRequest request = new LoginRequest();

        // When
        request.setPassword("password123");

        // Then
        assertThat(request.getPassword()).isEqualTo("password123");
    }

    @Test
    @DisplayName("Should create LoginRequest and set all fields")
    void createLoginRequest() {
        // Given
        LoginRequest request = new LoginRequest();

        // When
        request.setEmail("user@example.com");
        request.setPassword("securePassword");

        // Then
        assertThat(request.getEmail()).isEqualTo("user@example.com");
        assertThat(request.getPassword()).isEqualTo("securePassword");
    }

    @Test
    @DisplayName("Should handle null email")
    void handleNullEmail() {
        // Given
        LoginRequest request = new LoginRequest();

        // When
        request.setEmail(null);

        // Then
        assertThat(request.getEmail()).isNull();
    }

    @Test
    @DisplayName("Should handle null password")
    void handleNullPassword() {
        // Given
        LoginRequest request = new LoginRequest();

        // When
        request.setPassword(null);

        // Then
        assertThat(request.getPassword()).isNull();
    }

    @Test
    @DisplayName("Should handle empty email")
    void handleEmptyEmail() {
        // Given
        LoginRequest request = new LoginRequest();

        // When
        request.setEmail("");

        // Then
        assertThat(request.getEmail()).isEmpty();
    }

    @Test
    @DisplayName("Should handle empty password")
    void handleEmptyPassword() {
        // Given
        LoginRequest request = new LoginRequest();

        // When
        request.setPassword("");

        // Then
        assertThat(request.getPassword()).isEmpty();
    }
}
