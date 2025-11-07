package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour UserService
 * 
 * JUSTIFICATION : Tests ESSENTIELS pour la logique métier
 * - Récupération des utilisateurs par ID
 * - Suppression de comptes utilisateurs
 * - Gestion des cas limites (utilisateur inexistant)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService - Tests unitaires")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("test@example.com");
        mockUser.setFirstName("John");
        mockUser.setLastName("Doe");
        mockUser.setPassword("hashedPassword");
        mockUser.setAdmin(false);
        mockUser.setCreatedAt(LocalDateTime.now());
        mockUser.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("findById - Devrait retourner l'utilisateur quand il existe")
    void findById_ShouldReturnUser_WhenUserExists() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        // Act
        User result = userService.findById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("John", result.getFirstName());
        assertEquals("Doe", result.getLastName());
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("findById - Devrait retourner null quand l'utilisateur n'existe pas")
    void findById_ShouldReturnNull_WhenUserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        User result = userService.findById(999L);

        // Assert
        assertNull(result);
        verify(userRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("findById - Devrait gérer les IDs négatifs")
    void findById_ShouldHandleNegativeIds() {
        // Arrange
        when(userRepository.findById(-1L)).thenReturn(Optional.empty());

        // Act
        User result = userService.findById(-1L);

        // Assert
        assertNull(result);
        verify(userRepository, times(1)).findById(-1L);
    }

    @Test
    @DisplayName("findById - Devrait retourner un utilisateur admin")
    void findById_ShouldReturnAdminUser() {
        // Arrange
        User adminUser = new User();
        adminUser.setId(2L);
        adminUser.setEmail("admin@example.com");
        adminUser.setFirstName("Admin");
        adminUser.setLastName("User");
        adminUser.setAdmin(true);

        when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));

        // Act
        User result = userService.findById(2L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isAdmin());
        assertEquals("admin@example.com", result.getEmail());
        verify(userRepository, times(1)).findById(2L);
    }

    @Test
    @DisplayName("findById - Devrait appeler le repository une seule fois")
    void findById_ShouldCallRepositoryOnce() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        // Act
        userService.findById(1L);

        // Assert
        verify(userRepository, times(1)).findById(1L);
        verifyNoMoreInteractions(userRepository);
    }

    @Test
    @DisplayName("delete - Devrait supprimer l'utilisateur par ID")
    void delete_ShouldDeleteUser_ById() {
        // Arrange
        doNothing().when(userRepository).deleteById(1L);

        // Act
        userService.delete(1L);

        // Assert
        verify(userRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("delete - Devrait appeler deleteById avec le bon ID")
    void delete_ShouldCallDeleteByIdWithCorrectId() {
        // Arrange
        Long userId = 42L;
        doNothing().when(userRepository).deleteById(userId);

        // Act
        userService.delete(userId);

        // Assert
        verify(userRepository, times(1)).deleteById(42L);
        verifyNoMoreInteractions(userRepository);
    }

    @Test
    @DisplayName("delete - Devrait gérer la suppression d'un utilisateur inexistant")
    void delete_ShouldHandleNonExistentUser() {
        // Arrange
        doNothing().when(userRepository).deleteById(999L);

        // Act
        userService.delete(999L);

        // Assert
        verify(userRepository, times(1)).deleteById(999L);
    }

    @Test
    @DisplayName("delete - Ne devrait jamais retourner de valeur")
    void delete_ShouldNotReturnValue() {
        // Arrange
        doNothing().when(userRepository).deleteById(1L);

        // Act
        userService.delete(1L);

        // Assert - La méthode est void, donc pas de retour à vérifier
        verify(userRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("findById - Devrait retourner un utilisateur avec toutes ses propriétés")
    void findById_ShouldReturnUserWithAllProperties() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        // Act
        User result = userService.findById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("John", result.getFirstName());
        assertEquals("Doe", result.getLastName());
        assertEquals("hashedPassword", result.getPassword());
        assertFalse(result.isAdmin());
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getUpdatedAt());
    }

    @Test
    @DisplayName("delete - Devrait pouvoir supprimer plusieurs utilisateurs")
    void delete_ShouldAllowDeletingMultipleUsers() {
        // Arrange
        doNothing().when(userRepository).deleteById(anyLong());

        // Act
        userService.delete(1L);
        userService.delete(2L);
        userService.delete(3L);

        // Assert
        verify(userRepository, times(1)).deleteById(1L);
        verify(userRepository, times(1)).deleteById(2L);
        verify(userRepository, times(1)).deleteById(3L);
        verify(userRepository, times(3)).deleteById(anyLong());
    }

    @Test
    @DisplayName("findById - Devrait gérer ID = 0")
    void findById_ShouldHandleZeroId() {
        // Arrange
        when(userRepository.findById(0L)).thenReturn(Optional.empty());

        // Act
        User result = userService.findById(0L);

        // Assert
        assertNull(result);
        verify(userRepository, times(1)).findById(0L);
    }

    @Test
    @DisplayName("delete - Devrait gérer ID = 0")
    void delete_ShouldHandleZeroId() {
        // Arrange
        doNothing().when(userRepository).deleteById(0L);

        // Act
        userService.delete(0L);

        // Assert
        verify(userRepository, times(1)).deleteById(0L);
    }

    @Test
    @DisplayName("Service devrait utiliser le repository injecté")
    void service_ShouldUseInjectedRepository() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        // Act
        User result = userService.findById(1L);

        // Assert
        assertNotNull(result);
        verify(userRepository).findById(1L);
    }
}
