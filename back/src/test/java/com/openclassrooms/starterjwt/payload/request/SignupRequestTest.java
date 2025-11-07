package com.openclassrooms.starterjwt.payload.request;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("SignupRequest Unit Tests")
class SignupRequestTest {

    @Test
    @DisplayName("Should set and get email")
    void setAndGetEmail() {
        // Given
        SignupRequest request = new SignupRequest();

        // When
        request.setEmail("test@example.com");

        // Then
        assertThat(request.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("Should set and get firstName")
    void setAndGetFirstName() {
        // Given
        SignupRequest request = new SignupRequest();

        // When
        request.setFirstName("John");

        // Then
        assertThat(request.getFirstName()).isEqualTo("John");
    }

    @Test
    @DisplayName("Should set and get lastName")
    void setAndGetLastName() {
        // Given
        SignupRequest request = new SignupRequest();

        // When
        request.setLastName("Doe");

        // Then
        assertThat(request.getLastName()).isEqualTo("Doe");
    }

    @Test
    @DisplayName("Should set and get password")
    void setAndGetPassword() {
        // Given
        SignupRequest request = new SignupRequest();

        // When
        request.setPassword("password123");

        // Then
        assertThat(request.getPassword()).isEqualTo("password123");
    }

    @Test
    @DisplayName("Should create complete SignupRequest")
    void createCompleteSignupRequest() {
        // Given
        SignupRequest request = new SignupRequest();

        // When
        request.setEmail("newuser@example.com");
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setPassword("securePassword123");

        // Then
        assertThat(request.getEmail()).isEqualTo("newuser@example.com");
        assertThat(request.getFirstName()).isEqualTo("Jane");
        assertThat(request.getLastName()).isEqualTo("Smith");
        assertThat(request.getPassword()).isEqualTo("securePassword123");
    }

    @Test
    @DisplayName("Should handle null email")
    void handleNullEmail() {
        // Given
        SignupRequest request = new SignupRequest();

        // When
        request.setEmail(null);

        // Then
        assertThat(request.getEmail()).isNull();
    }

    @Test
    @DisplayName("Should handle null firstName")
    void handleNullFirstName() {
        // Given
        SignupRequest request = new SignupRequest();

        // When
        request.setFirstName(null);

        // Then
        assertThat(request.getFirstName()).isNull();
    }

    @Test
    @DisplayName("Should handle null lastName")
    void handleNullLastName() {
        // Given
        SignupRequest request = new SignupRequest();

        // When
        request.setLastName(null);

        // Then
        assertThat(request.getLastName()).isNull();
    }

    @Test
    @DisplayName("Should handle null password")
    void handleNullPassword() {
        // Given
        SignupRequest request = new SignupRequest();

        // When
        request.setPassword(null);

        // Then
        assertThat(request.getPassword()).isNull();
    }

    @Test
    @DisplayName("Should handle empty strings")
    void handleEmptyStrings() {
        // Given
        SignupRequest request = new SignupRequest();

        // When
        request.setEmail("");
        request.setFirstName("");
        request.setLastName("");
        request.setPassword("");

        // Then
        assertThat(request.getEmail()).isEmpty();
        assertThat(request.getFirstName()).isEmpty();
        assertThat(request.getLastName()).isEmpty();
        assertThat(request.getPassword()).isEmpty();
    }

    @Test
    @DisplayName("Should support equals and hashCode from Lombok")
    void testEqualsAndHashCode() {
        // Given
        SignupRequest request1 = new SignupRequest();
        request1.setEmail("test@example.com");
        request1.setFirstName("John");
        request1.setLastName("Doe");
        request1.setPassword("password");

        SignupRequest request2 = new SignupRequest();
        request2.setEmail("test@example.com");
        request2.setFirstName("John");
        request2.setLastName("Doe");
        request2.setPassword("password");

        // Then
        assertThat(request1).isEqualTo(request2);
        assertThat(request1.hashCode()).isEqualTo(request2.hashCode());
    }

    @Test
    @DisplayName("Should support toString from Lombok")
    void testToString() {
        // Given
        SignupRequest request = new SignupRequest();
        request.setEmail("test@example.com");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPassword("password");

        // When
        String requestString = request.toString();

        // Then
        assertThat(requestString).contains("test@example.com");
        assertThat(requestString).contains("John");
        assertThat(requestString).contains("Doe");
    }
}
