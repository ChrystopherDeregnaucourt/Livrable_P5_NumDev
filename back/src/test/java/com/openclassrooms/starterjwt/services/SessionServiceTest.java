package com.openclassrooms.starterjwt.services;

/**
 * Tests unitaires pour SessionService.
 * 
 * Cette classe teste la couche service de gestion des sessions :
 * - Création, mise à jour et suppression de sessions
 * - Récupération des sessions (par ID ou toutes)
 * - Gestion de la participation aux sessions
 * - Gestion de l'annulation de participation
 * 
 * Les tests couvrent :
 * - Les opérations CRUD standards
 * - La logique métier de participation (pas de doublon, vérification d'existence)
 * - Les exceptions métier (NotFoundException, BadRequestException)
 * - La validation des données
 */

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SessionService Unit Tests")
class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;

    private Session session;
    private User user;
    private Teacher teacher;

    @BeforeEach
    void setUp() {
        teacher = Teacher.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .build();

        user = User.builder()
                .id(1L)
                .email("user@example.com")
                .firstName("Jane")
                .lastName("Smith")
                .password("password")
                .admin(false)
                .build();

        session = Session.builder()
                .id(1L)
                .name("Yoga Session")
                .date(new Date())
                .description("Morning yoga session")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Should create session successfully")
    void create_Success() {
        // Given
        when(sessionRepository.save(session)).thenReturn(session);

        // When
        Session result = sessionService.create(session);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(session);
        verify(sessionRepository, times(1)).save(session);
    }

    @Test
    @DisplayName("Should delete session successfully")
    void delete_Success() {
        // Given
        doNothing().when(sessionRepository).deleteById(1L);

        // When
        sessionService.delete(1L);

        // Then
        verify(sessionRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should find all sessions successfully")
    void findAll_Success() {
        // Given
        Session session2 = Session.builder()
                .id(2L)
                .name("Evening Yoga")
                .date(new Date())
                .description("Evening session")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build();

        List<Session> sessions = Arrays.asList(session, session2);
        when(sessionRepository.findAll()).thenReturn(sessions);

        // When
        List<Session> result = sessionService.findAll();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(session, session2);
        verify(sessionRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should get session by id successfully")
    void getById_Success() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        // When
        Session result = sessionService.getById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(session);
        verify(sessionRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should return null when session not found")
    void getById_NotFound() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        Session result = sessionService.getById(1L);

        // Then
        assertThat(result).isNull();
        verify(sessionRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should update session successfully")
    void update_Success() {
        // Given
        Session updatedSession = Session.builder()
                .id(1L)
                .name("Updated Yoga Session")
                .date(new Date())
                .description("Updated description")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build();

        when(sessionRepository.save(any(Session.class))).thenReturn(updatedSession);

        // When
        Session result = sessionService.update(1L, updatedSession);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Updated Yoga Session");
        verify(sessionRepository, times(1)).save(updatedSession);
    }

    @Test
    @DisplayName("Should participate in session successfully")
    void participate_Success() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        // When
        sessionService.participate(1L, 1L);

        // Then
        assertThat(session.getUsers()).contains(user);
        verify(sessionRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findById(1L);
        verify(sessionRepository, times(1)).save(session);
    }

    @Test
    @DisplayName("Should throw NotFoundException when session not found on participate")
    void participate_SessionNotFound() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> sessionService.participate(1L, 1L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, times(1)).findById(1L);
        verify(userRepository, never()).findById(anyLong());
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    @DisplayName("Should throw NotFoundException when user not found on participate")
    void participate_UserNotFound() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> sessionService.participate(1L, 1L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findById(1L);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when user already participates")
    void participate_AlreadyParticipates() {
        // Given
        session.getUsers().add(user);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // When & Then
        assertThatThrownBy(() -> sessionService.participate(1L, 1L))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findById(1L);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    @DisplayName("Should no longer participate in session successfully")
    void noLongerParticipate_Success() {
        // Given
        session.getUsers().add(user);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        // When
        sessionService.noLongerParticipate(1L, 1L);

        // Then
        assertThat(session.getUsers()).doesNotContain(user);
        verify(sessionRepository, times(1)).findById(1L);
        verify(sessionRepository, times(1)).save(session);
    }

    @Test
    @DisplayName("Should throw NotFoundException when session not found on noLongerParticipate")
    void noLongerParticipate_SessionNotFound() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 1L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, times(1)).findById(1L);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when user does not participate")
    void noLongerParticipate_UserNotParticipating() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        // When & Then
        assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 1L))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, times(1)).findById(1L);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    @DisplayName("Should handle multiple users in session")
    void participate_MultipleUsers() {
        // Given
        User user2 = User.builder()
                .id(2L)
                .email("user2@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .admin(false)
                .build();

        session.getUsers().add(user2);
        
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        // When
        sessionService.participate(1L, 1L);

        // Then
        assertThat(session.getUsers()).hasSize(2);
        assertThat(session.getUsers()).contains(user, user2);
    }
}
