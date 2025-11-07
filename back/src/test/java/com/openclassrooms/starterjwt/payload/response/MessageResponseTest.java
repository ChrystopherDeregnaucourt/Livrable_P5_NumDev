package com.openclassrooms.starterjwt.payload.response;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("MessageResponse Unit Tests")
class MessageResponseTest {

    @Test
    @DisplayName("Should create MessageResponse with constructor")
    void constructor_CreatesMessageResponse() {
        // When
        MessageResponse response = new MessageResponse("Success message");

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getMessage()).isEqualTo("Success message");
    }

    @Test
    @DisplayName("Should set and get message")
    void setAndGetMessage() {
        // Given
        MessageResponse response = new MessageResponse("Initial message");

        // When
        response.setMessage("Updated message");

        // Then
        assertThat(response.getMessage()).isEqualTo("Updated message");
    }

    @Test
    @DisplayName("Should handle empty message")
    void handleEmptyMessage() {
        // When
        MessageResponse response = new MessageResponse("");

        // Then
        assertThat(response.getMessage()).isEmpty();
    }

    @Test
    @DisplayName("Should handle null message")
    void handleNullMessage() {
        // When
        MessageResponse response = new MessageResponse(null);

        // Then
        assertThat(response.getMessage()).isNull();
    }

    @Test
    @DisplayName("Should create error message response")
    void createErrorMessage() {
        // When
        MessageResponse response = new MessageResponse("Error: Email is already taken!");

        // Then
        assertThat(response.getMessage()).contains("Error");
        assertThat(response.getMessage()).isEqualTo("Error: Email is already taken!");
    }

    @Test
    @DisplayName("Should create success message response")
    void createSuccessMessage() {
        // When
        MessageResponse response = new MessageResponse("User registered successfully!");

        // Then
        assertThat(response.getMessage()).contains("successfully");
    }
}
