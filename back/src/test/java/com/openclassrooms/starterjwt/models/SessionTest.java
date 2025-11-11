package com.openclassrooms.starterjwt.models;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Session Model Unit Tests")
class SessionTest {

    @Test
    @DisplayName("Should create session with builder")
    void builder_CreatesSession() {
        // Given
        Date date = new Date();
        Teacher teacher = Teacher.builder().id(1L).firstName("John").lastName("Doe").build();
        User user = User.builder().id(1L).email("user@example.com").firstName("Jane").lastName("Smith").password("pass").admin(false).build();
        List<User> users = new ArrayList<>(Arrays.asList(user));

        // When
        Session session = Session.builder()
                .id(1L)
                .name("Yoga Session")
                .date(date)
                .description("Morning yoga")
                .teacher(teacher)
                .users(users)
                .build();

        // Then
        assertThat(session).isNotNull();
        assertThat(session.getId()).isEqualTo(1L);
        assertThat(session.getName()).isEqualTo("Yoga Session");
        assertThat(session.getDate()).isEqualTo(date);
        assertThat(session.getDescription()).isEqualTo("Morning yoga");
        assertThat(session.getTeacher()).isEqualTo(teacher);
        assertThat(session.getUsers()).hasSize(1);
        assertThat(session.getUsers()).contains(user);
    }

    @Test
    @DisplayName("Should set and get properties")
    void settersAndGetters_Work() {
        // Given
        Session session = new Session();
        Date date = new Date();
        Teacher teacher = Teacher.builder().id(1L).firstName("John").lastName("Doe").build();
        User user = User.builder().id(1L).email("user@example.com").firstName("Jane").lastName("Smith").password("pass").admin(false).build();
        List<User> users = new ArrayList<>(Arrays.asList(user));

        // When
        session.setId(2L);
        session.setName("Evening Yoga");
        session.setDate(date);
        session.setDescription("Evening session");
        session.setTeacher(teacher);
        session.setUsers(users);

        // Then
        assertThat(session.getId()).isEqualTo(2L);
        assertThat(session.getName()).isEqualTo("Evening Yoga");
        assertThat(session.getDate()).isEqualTo(date);
        assertThat(session.getDescription()).isEqualTo("Evening session");
        assertThat(session.getTeacher()).isEqualTo(teacher);
        assertThat(session.getUsers()).hasSize(1);
    }

    @Test
    @DisplayName("Should support method chaining")
    void methodChaining_Works() {
        // Given
        Date date = new Date();
        Teacher teacher = Teacher.builder().id(1L).firstName("John").lastName("Doe").build();

        // When
        Session session = new Session()
                .setId(3L)
                .setName("Power Yoga")
                .setDate(date)
                .setDescription("Intense session")
                .setTeacher(teacher)
                .setUsers(new ArrayList<>());

        // Then
        assertThat(session.getId()).isEqualTo(3L);
        assertThat(session.getName()).isEqualTo("Power Yoga");
    }

    @Test
    @DisplayName("Should equals return true for same id")
    void equals_SameId_ReturnsTrue() {
        // Given
        Session session1 = Session.builder().id(1L).name("Session 1").date(new Date()).description("Desc 1").build();
        Session session2 = Session.builder().id(1L).name("Session 2").date(new Date()).description("Desc 2").build();

        // When & Then
        assertThat(session1).isEqualTo(session2);
    }

    @Test
    @DisplayName("Should equals return false for different id")
    void equals_DifferentId_ReturnsFalse() {
        // Given
        Session session1 = Session.builder().id(1L).name("Session").date(new Date()).description("Desc").build();
        Session session2 = Session.builder().id(2L).name("Session").date(new Date()).description("Desc").build();

        // When & Then
        assertThat(session1).isNotEqualTo(session2);
    }

    @Test
    @DisplayName("Should hashCode be same for same id")
    void hashCode_SameId_ReturnsSameHashCode() {
        // Given
        Session session1 = Session.builder().id(1L).name("Session 1").date(new Date()).description("Desc 1").build();
        Session session2 = Session.builder().id(1L).name("Session 2").date(new Date()).description("Desc 2").build();

        // When & Then
        assertThat(session1.hashCode()).isEqualTo(session2.hashCode());
    }

    @Test
    @DisplayName("Should toString contain relevant information")
    void toString_ContainsInformation() {
        // Given
        Session session = Session.builder()
                .id(1L)
                .name("Yoga Session")
                .date(new Date())
                .description("Morning yoga")
                .build();

        // When
        String sessionString = session.toString();

        // Then
        assertThat(sessionString).contains("Session");
        assertThat(sessionString).contains("Yoga Session");
    }

    @Test
    @DisplayName("Should handle empty users list")
    void emptyUsersList() {
        // When
        Session session = Session.builder()
                .id(1L)
                .name("Empty Session")
                .date(new Date())
                .description("No participants")
                .users(new ArrayList<>())
                .build();

        // Then
        assertThat(session.getUsers()).isEmpty();
    }

    @Test
    @DisplayName("Should handle multiple users")
    void multipleUsers() {
        // Given
        User user1 = User.builder().id(1L).email("user1@example.com").firstName("User").lastName("One").password("pass").admin(false).build();
        User user2 = User.builder().id(2L).email("user2@example.com").firstName("User").lastName("Two").password("pass").admin(false).build();
        List<User> users = new ArrayList<>(Arrays.asList(user1, user2));

        // When
        Session session = Session.builder()
                .id(1L)
                .name("Popular Session")
                .date(new Date())
                .description("Many participants")
                .users(users)
                .build();

        // Then
        assertThat(session.getUsers()).hasSize(2);
        assertThat(session.getUsers()).contains(user1, user2);
    }
}
