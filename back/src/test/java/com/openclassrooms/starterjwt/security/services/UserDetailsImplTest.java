package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("UserDetailsImpl Unit Tests")
class UserDetailsImplTest {

    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("encodedPassword")
                .admin(false)
                .build();
    }

    @Test
    @DisplayName("Should build UserDetailsImpl correctly")
    void builder_Success() {
        // Then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getId()).isEqualTo(1L);
        assertThat(userDetails.getUsername()).isEqualTo("test@example.com");
        assertThat(userDetails.getFirstName()).isEqualTo("John");
        assertThat(userDetails.getLastName()).isEqualTo("Doe");
        assertThat(userDetails.getPassword()).isEqualTo("encodedPassword");
        assertThat(userDetails.getAdmin()).isFalse();
    }

    @Test
    @DisplayName("Should return empty authorities collection")
    void getAuthorities_ReturnsEmptyCollection() {
        // When
        Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();

        // Then
        assertThat(authorities).isNotNull();
        assertThat(authorities).isEmpty();
    }

    @Test
    @DisplayName("Should return account non expired as true")
    void isAccountNonExpired_ReturnsTrue() {
        // When
        boolean isAccountNonExpired = userDetails.isAccountNonExpired();

        // Then
        assertThat(isAccountNonExpired).isTrue();
    }

    @Test
    @DisplayName("Should return account non locked as true")
    void isAccountNonLocked_ReturnsTrue() {
        // When
        boolean isAccountNonLocked = userDetails.isAccountNonLocked();

        // Then
        assertThat(isAccountNonLocked).isTrue();
    }

    @Test
    @DisplayName("Should return credentials non expired as true")
    void isCredentialsNonExpired_ReturnsTrue() {
        // When
        boolean isCredentialsNonExpired = userDetails.isCredentialsNonExpired();

        // Then
        assertThat(isCredentialsNonExpired).isTrue();
    }

    @Test
    @DisplayName("Should return enabled as true")
    void isEnabled_ReturnsTrue() {
        // When
        boolean isEnabled = userDetails.isEnabled();

        // Then
        assertThat(isEnabled).isTrue();
    }

    @Test
    @DisplayName("Should equals return true for same id")
    void equals_SameId_ReturnsTrue() {
        // Given
        UserDetailsImpl sameUser = UserDetailsImpl.builder()
                .id(1L)
                .username("different@example.com")
                .firstName("Different")
                .lastName("User")
                .password("differentPassword")
                .admin(true)
                .build();

        // When
        boolean isEqual = userDetails.equals(sameUser);

        // Then
        assertThat(isEqual).isTrue();
    }

    @Test
    @DisplayName("Should equals return false for different id")
    void equals_DifferentId_ReturnsFalse() {
        // Given
        UserDetailsImpl differentUser = UserDetailsImpl.builder()
                .id(2L)
                .username("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("encodedPassword")
                .admin(false)
                .build();

        // When
        boolean isEqual = userDetails.equals(differentUser);

        // Then
        assertThat(isEqual).isFalse();
    }

    @Test
    @DisplayName("Should equals return true for same object")
    void equals_SameObject_ReturnsTrue() {
        // When
        boolean isEqual = userDetails.equals(userDetails);

        // Then
        assertThat(isEqual).isTrue();
    }

    @Test
    @DisplayName("Should equals return false for null")
    void equals_Null_ReturnsFalse() {
        // When
        boolean isEqual = userDetails.equals(null);

        // Then
        assertThat(isEqual).isFalse();
    }

    @Test
    @DisplayName("Should equals return false for different class")
    void equals_DifferentClass_ReturnsFalse() {
        // Given
        String differentObject = "Not a UserDetailsImpl";

        // When
        boolean isEqual = userDetails.equals(differentObject);

        // Then
        assertThat(isEqual).isFalse();
    }

    @Test
    @DisplayName("Should build admin user correctly")
    void builder_AdminUser() {
        // Given
        UserDetailsImpl adminUser = UserDetailsImpl.builder()
                .id(2L)
                .username("admin@example.com")
                .firstName("Admin")
                .lastName("User")
                .password("adminPassword")
                .admin(true)
                .build();

        // Then
        assertThat(adminUser).isNotNull();
        assertThat(adminUser.getAdmin()).isTrue();
        assertThat(adminUser.getId()).isEqualTo(2L);
    }

    @Test
    @DisplayName("Should handle null admin field")
    void builder_NullAdmin() {
        // Given
        UserDetailsImpl userWithNullAdmin = UserDetailsImpl.builder()
                .id(3L)
                .username("test@example.com")
                .firstName("Test")
                .lastName("User")
                .password("password")
                .admin(null)
                .build();

        // Then
        assertThat(userWithNullAdmin.getAdmin()).isNull();
    }
}
