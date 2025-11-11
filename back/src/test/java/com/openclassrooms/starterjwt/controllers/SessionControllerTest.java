package com.openclassrooms.starterjwt.controllers;

/**
 * Tests unitaires pour SessionController.
 * 
 * Cette classe teste les endpoints de gestion des sessions de yoga :
 * - GET /api/session/{id} : Récupération d'une session par ID
 * - GET /api/session : Récupération de toutes les sessions
 * - POST /api/session : Création d'une nouvelle session
 * - PUT /api/session/{id} : Mise à jour d'une session
 * - DELETE /api/session/{id} : Suppression d'une session
 * - POST /api/session/{id}/participate/{userId} : Participation à une session
 * - DELETE /api/session/{id}/participate/{userId} : Annulation de participation
 * 
 * Les tests couvrent :
 * - Les cas de succès pour chaque opération
 * - La gestion des sessions non trouvées (404)
 * - La validation des ID invalides (400)
 * - La conversion entre entités et DTOs via le mapper
 */

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SessionController Unit Tests")
class SessionControllerTest {

    @Mock
    private SessionService sessionService;

    @Mock
    private SessionMapper sessionMapper;

    @InjectMocks
    private SessionController sessionController;

    private Session session;
    private SessionDto sessionDto;
    private Teacher teacher;
    private User user;

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
                .users(new ArrayList<>(Arrays.asList(user)))
                .build();

        sessionDto = new SessionDto();
        sessionDto.setId(1L);
        sessionDto.setName("Yoga Session");
        sessionDto.setDate(new Date());
        sessionDto.setDescription("Morning yoga session");
        sessionDto.setTeacher_id(1L);
        sessionDto.setUsers(Arrays.asList(1L));
    }

    @Test
    @DisplayName("Should find session by id successfully")
    void findById_Success() {
        // Given - Configuration du mock pour retourner une session existante
        // Le service retourne la session mockée
        when(sessionService.getById(1L)).thenReturn(session);
        // Le mapper convertit l'entité en DTO
        when(sessionMapper.toDto(session)).thenReturn(sessionDto);

        // When - Appel de l'endpoint avec l'ID "1"
        ResponseEntity<?> response = sessionController.findById("1");

        // Then - Vérification de la réponse
        // Vérification du code statut HTTP 200 OK
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        // Vérification que le corps de la réponse contient le DTO de la session
        assertThat(response.getBody()).isEqualTo(sessionDto);
        // Vérification que le service a été appelé avec le bon ID
        verify(sessionService, times(1)).getById(1L);
        // Vérification que le mapper a bien converti l'entité en DTO
        verify(sessionMapper, times(1)).toDto(session);
    }

    @Test
    @DisplayName("Should return not found when session does not exist")
    void findById_NotFound() {
        // Given - Configuration du mock pour simuler une session inexistante
        // Le service retourne null car la session n'existe pas
        when(sessionService.getById(1L)).thenReturn(null);

        // When - Tentative de récupération d'une session inexistante
        ResponseEntity<?> response = sessionController.findById("1");

        // Then - Vérification de la réponse d'erreur
        // Vérification du code statut HTTP 404 Not Found
        assertThat(response.getStatusCodeValue()).isEqualTo(404);
        // Vérification que le service a été interrogé
        verify(sessionService, times(1)).getById(1L);
        // Vérification que le mapper n'a pas été appelé (pas de session à convertir)
        verify(sessionMapper, never()).toDto(any(Session.class));
    }

    @Test
    @DisplayName("Should return bad request for invalid id format")
    void findById_InvalidIdFormat() {
        // Given - Pas de configuration nécessaire, on teste la validation de l'ID
        
        // When - Appel avec un ID au format invalide (non numérique)
        ResponseEntity<?> response = sessionController.findById("invalid");

        // Then - Vérification du rejet de la requête
        // Vérification du code statut HTTP 400 Bad Request
        assertThat(response.getStatusCodeValue()).isEqualTo(400);
        // Vérification que le service n'a jamais été appelé (validation échouée avant)
        verify(sessionService, never()).getById(anyLong());
    }

    @Test
    @DisplayName("Should find all sessions successfully")
    void findAll_Success() {
        // Given - Préparation de plusieurs sessions
        // Création d'une deuxième session pour tester la récupération de la liste
        Session session2 = Session.builder()
                .id(2L)
                .name("Evening Yoga")
                .date(new Date())
                .description("Evening session")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build();

        List<Session> sessions = Arrays.asList(session, session2);
        List<SessionDto> sessionDtos = Arrays.asList(sessionDto, new SessionDto());

        // Configuration du mock pour retourner la liste de sessions
        when(sessionService.findAll()).thenReturn(sessions);
        // Configuration du mapper pour convertir la liste d'entités en liste de DTOs
        when(sessionMapper.toDto(sessions)).thenReturn(sessionDtos);

        // When - Récupération de toutes les sessions
        ResponseEntity<?> response = sessionController.findAll();

        // Then - Vérification de la réponse
        // Vérification du code statut HTTP 200 OK
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        // Vérification que le corps contient la liste des DTOs
        assertThat(response.getBody()).isEqualTo(sessionDtos);
        // Vérification que le service a été appelé une fois
        verify(sessionService, times(1)).findAll();
        // Vérification que le mapper a converti la liste
        verify(sessionMapper, times(1)).toDto(sessions);
    }

    @Test
    @DisplayName("Should create session successfully")
    void create_Success() {
        // Given - Configuration pour la création d'une session
        // Le mapper convertit le DTO en entité
        when(sessionMapper.toEntity(sessionDto)).thenReturn(session);
        // Le service crée la session et la retourne
        when(sessionService.create(session)).thenReturn(session);
        // Le mapper reconvertit l'entité créée en DTO pour la réponse
        when(sessionMapper.toDto(session)).thenReturn(sessionDto);

        // When - Appel de création de session
        ResponseEntity<?> response = sessionController.create(sessionDto);

        // Then - Vérification de la création
        // Vérification du code statut HTTP 200 OK
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        // Vérification que le corps contient le DTO de la session créée
        assertThat(response.getBody()).isEqualTo(sessionDto);
        // Vérification que le DTO a été converti en entité
        verify(sessionMapper, times(1)).toEntity(sessionDto);
        // Vérification que le service a créé la session
        verify(sessionService, times(1)).create(session);
        // Vérification que l'entité a été reconvertie en DTO
        verify(sessionMapper, times(1)).toDto(session);
    }

    @Test
    @DisplayName("Should update session successfully")
    void update_Success() {
        // Given - Configuration pour la mise à jour d'une session
        // Le mapper convertit le DTO en entité
        when(sessionMapper.toEntity(sessionDto)).thenReturn(session);
        // Le service met à jour la session avec l'ID fourni
        when(sessionService.update(1L, session)).thenReturn(session);
        // Le mapper reconvertit l'entité mise à jour en DTO
        when(sessionMapper.toDto(session)).thenReturn(sessionDto);

        // When - Appel de mise à jour avec l'ID "1"
        ResponseEntity<?> response = sessionController.update("1", sessionDto);

        // Then - Vérification de la mise à jour
        // Vérification du code statut HTTP 200 OK
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        // Vérification que le corps contient le DTO de la session mise à jour
        assertThat(response.getBody()).isEqualTo(sessionDto);
        // Vérification que le service a été appelé avec le bon ID et la bonne entité
        verify(sessionService, times(1)).update(1L, session);
    }

    @Test
    @DisplayName("Should return bad request for invalid id format on update")
    void update_InvalidIdFormat() {
        // Given - Pas de configuration nécessaire, on teste la validation de l'ID
        
        // When - Tentative de mise à jour avec un ID invalide
        ResponseEntity<?> response = sessionController.update("invalid", sessionDto);

        // Then - Vérification du rejet de la requête
        // Vérification du code statut HTTP 400 Bad Request
        assertThat(response.getStatusCodeValue()).isEqualTo(400);
        // Vérification que le service n'a jamais été appelé
        verify(sessionService, never()).update(anyLong(), any(Session.class));
    }

    @Test
    @DisplayName("Should delete session successfully")
    void delete_Success() {
        // Given - Configuration pour la suppression d'une session
        // Vérification que la session existe avant suppression
        when(sessionService.getById(1L)).thenReturn(session);
        // Configuration du mock pour la suppression
        doNothing().when(sessionService).delete(1L);

        // When - Appel de suppression de la session
        ResponseEntity<?> response = sessionController.save("1");

        // Then - Vérification de la suppression
        // Vérification du code statut HTTP 200 OK
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        // Vérification que l'existence de la session a été vérifiée
        verify(sessionService, times(1)).getById(1L);
        // Vérification que la suppression a été effectuée
        verify(sessionService, times(1)).delete(1L);
    }

    @Test
    @DisplayName("Should return not found when deleting non-existent session")
    void delete_NotFound() {
        // Given - Configuration pour une session inexistante
        // Le service retourne null car la session n'existe pas
        when(sessionService.getById(1L)).thenReturn(null);

        // When - Tentative de suppression d'une session inexistante
        ResponseEntity<?> response = sessionController.save("1");

        // Then - Vérification de la réponse d'erreur
        // Vérification du code statut HTTP 404 Not Found
        assertThat(response.getStatusCodeValue()).isEqualTo(404);
        // Vérification que l'existence a été vérifiée
        verify(sessionService, times(1)).getById(1L);
        // Vérification que la suppression n'a pas été appelée
        verify(sessionService, never()).delete(anyLong());
    }

    @Test
    @DisplayName("Should return bad request for invalid id format on delete")
    void delete_InvalidIdFormat() {
        // Given - Pas de configuration nécessaire, on teste la validation de l'ID
        
        // When - Tentative de suppression avec un ID invalide
        ResponseEntity<?> response = sessionController.save("invalid");

        // Then - Vérification du rejet de la requête
        // Vérification du code statut HTTP 400 Bad Request
        assertThat(response.getStatusCodeValue()).isEqualTo(400);
        // Vérification que le service n'a jamais été appelé
        verify(sessionService, never()).delete(anyLong());
    }

    @Test
    @DisplayName("Should participate in session successfully")
    void participate_Success() {
        // Given - Configuration pour ajouter un participant à une session
        // Configuration du mock pour l'ajout de participation (méthode void)
        doNothing().when(sessionService).participate(1L, 2L);

        // When - Appel de participation (session 1, utilisateur 2)
        ResponseEntity<?> response = sessionController.participate("1", "2");

        // Then - Vérification de l'ajout de participation
        // Vérification du code statut HTTP 200 OK
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        // Vérification que le service a été appelé avec les bons IDs
        verify(sessionService, times(1)).participate(1L, 2L);
    }

    @Test
    @DisplayName("Should return bad request for invalid id format on participate")
    void participate_InvalidIdFormat() {
        // Given - Pas de configuration nécessaire, on teste la validation de l'ID
        
        // When - Tentative de participation avec un ID de session invalide
        ResponseEntity<?> response = sessionController.participate("invalid", "2");

        // Then - Vérification du rejet de la requête
        // Vérification du code statut HTTP 400 Bad Request
        assertThat(response.getStatusCodeValue()).isEqualTo(400);
        // Vérification que le service n'a jamais été appelé
        verify(sessionService, never()).participate(anyLong(), anyLong());
    }

    @Test
    @DisplayName("Should return bad request for invalid userId format on participate")
    void participate_InvalidUserIdFormat() {
        // Given - Pas de configuration nécessaire, on teste la validation de l'ID utilisateur
        
        // When - Tentative de participation avec un ID utilisateur invalide
        ResponseEntity<?> response = sessionController.participate("1", "invalid");

        // Then - Vérification du rejet de la requête
        // Vérification du code statut HTTP 400 Bad Request
        assertThat(response.getStatusCodeValue()).isEqualTo(400);
        // Vérification que le service n'a jamais été appelé
        verify(sessionService, never()).participate(anyLong(), anyLong());
    }

    @Test
    @DisplayName("Should no longer participate in session successfully")
    void noLongerParticipate_Success() {
        // Given - Configuration pour retirer un participant d'une session
        // Configuration du mock pour le retrait de participation (méthode void)
        doNothing().when(sessionService).noLongerParticipate(1L, 2L);

        // When - Appel d'annulation de participation (session 1, utilisateur 2)
        ResponseEntity<?> response = sessionController.noLongerParticipate("1", "2");

        // Then - Vérification du retrait de participation
        // Vérification du code statut HTTP 200 OK
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        // Vérification que le service a été appelé avec les bons IDs
        verify(sessionService, times(1)).noLongerParticipate(1L, 2L);
    }

    @Test
    @DisplayName("Should return bad request for invalid id format on noLongerParticipate")
    void noLongerParticipate_InvalidIdFormat() {
        // Given - Pas de configuration nécessaire, on teste la validation de l'ID
        
        // When - Tentative d'annulation avec un ID de session invalide
        ResponseEntity<?> response = sessionController.noLongerParticipate("invalid", "2");

        // Then - Vérification du rejet de la requête
        // Vérification du code statut HTTP 400 Bad Request
        assertThat(response.getStatusCodeValue()).isEqualTo(400);
        // Vérification que le service n'a jamais été appelé
        verify(sessionService, never()).noLongerParticipate(anyLong(), anyLong());
    }

    @Test
    @DisplayName("Should return bad request for invalid userId format on noLongerParticipate")
    void noLongerParticipate_InvalidUserIdFormat() {
        // Given - Pas de configuration nécessaire, on teste la validation de l'ID utilisateur
        
        // When - Tentative d'annulation avec un ID utilisateur invalide
        ResponseEntity<?> response = sessionController.noLongerParticipate("1", "invalid");

        // Then - Vérification du rejet de la requête
        // Vérification du code statut HTTP 400 Bad Request
        assertThat(response.getStatusCodeValue()).isEqualTo(400);
        // Vérification que le service n'a jamais été appelé
        verify(sessionService, never()).noLongerParticipate(anyLong(), anyLong());
    }
}
