package com.openclassrooms.starterjwt.models;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Teacher Model Unit Tests")
class TeacherTest {

    @Test
    @DisplayName("Should create teacher with builder")
    void builder_CreatesTeacher() {
        // When
        Teacher teacher = Teacher.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .build();

        // Then
        assertThat(teacher).isNotNull();
        assertThat(teacher.getId()).isEqualTo(1L);
        assertThat(teacher.getFirstName()).isEqualTo("John");
        assertThat(teacher.getLastName()).isEqualTo("Doe");
    }

    @Test
    @DisplayName("Should set and get properties")
    void settersAndGetters_Work() {
        // Given
        Teacher teacher = new Teacher();

        // When
        teacher.setId(2L);
        teacher.setFirstName("Jane");
        teacher.setLastName("Smith");

        // Then
        assertThat(teacher.getId()).isEqualTo(2L);
        assertThat(teacher.getFirstName()).isEqualTo("Jane");
        assertThat(teacher.getLastName()).isEqualTo("Smith");
    }

    @Test
    @DisplayName("Should support method chaining")
    void methodChaining_Works() {
        // When
        Teacher teacher = new Teacher()
                .setId(3L)
                .setFirstName("Bob")
                .setLastName("Johnson");

        // Then
        assertThat(teacher.getId()).isEqualTo(3L);
        assertThat(teacher.getFirstName()).isEqualTo("Bob");
        assertThat(teacher.getLastName()).isEqualTo("Johnson");
    }

    @Test
    @DisplayName("Should equals return true for same id")
    void equals_SameId_ReturnsTrue() {
        // Given
        Teacher teacher1 = Teacher.builder().id(1L).firstName("John").lastName("Doe").build();
        Teacher teacher2 = Teacher.builder().id(1L).firstName("Jane").lastName("Smith").build();

        // When & Then
        assertThat(teacher1).isEqualTo(teacher2);
    }

    @Test
    @DisplayName("Should equals return false for different id")
    void equals_DifferentId_ReturnsFalse() {
        // Given
        Teacher teacher1 = Teacher.builder().id(1L).firstName("John").lastName("Doe").build();
        Teacher teacher2 = Teacher.builder().id(2L).firstName("John").lastName("Doe").build();

        // When & Then
        assertThat(teacher1).isNotEqualTo(teacher2);
    }

    @Test
    @DisplayName("Should hashCode be same for same id")
    void hashCode_SameId_ReturnsSameHashCode() {
        // Given
        Teacher teacher1 = Teacher.builder().id(1L).firstName("John").lastName("Doe").build();
        Teacher teacher2 = Teacher.builder().id(1L).firstName("Jane").lastName("Smith").build();

        // When & Then
        assertThat(teacher1.hashCode()).isEqualTo(teacher2.hashCode());
    }

    @Test
    @DisplayName("Should toString contain relevant information")
    void toString_ContainsInformation() {
        // Given
        Teacher teacher = Teacher.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .build();

        // When
        String teacherString = teacher.toString();

        // Then
        assertThat(teacherString).contains("Teacher");
        assertThat(teacherString).contains("John");
        assertThat(teacherString).contains("Doe");
    }

    @Test
    @DisplayName("Should create teacher with all args constructor")
    void allArgsConstructor_CreatesTeacher() {
        // When - Order: id, lastName, firstName, createdAt, updatedAt
        Teacher teacher = new Teacher(1L, "Doe", "John", null, null);

        // Then
        assertThat(teacher).isNotNull();
        assertThat(teacher.getId()).isEqualTo(1L);
        assertThat(teacher.getFirstName()).isEqualTo("John");
        assertThat(teacher.getLastName()).isEqualTo("Doe");
    }

    @Test
    @DisplayName("Should create teacher with no args constructor")
    void noArgsConstructor_CreatesTeacher() {
        // When
        Teacher teacher = new Teacher();

        // Then
        assertThat(teacher).isNotNull();
    }
}
