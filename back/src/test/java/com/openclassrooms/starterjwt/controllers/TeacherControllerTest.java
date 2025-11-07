package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.services.TeacherService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Tests d'intégration pour TeacherController
 * 
 * JUSTIFICATION : Tests pour l'API publique des professeurs
 * - Récupération de la liste complète des professeurs
 * - Récupération d'un professeur par ID
 * - Gestion des erreurs (404, 400)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TeacherController - Tests d'intégration")
class TeacherControllerTest {

    @Mock
    private TeacherService teacherService;

    @Mock
    private TeacherMapper teacherMapper;

    @InjectMocks
    private TeacherController teacherController;

    private Teacher mockTeacher1;
    private Teacher mockTeacher2;
    private TeacherDto mockTeacherDto1;
    private TeacherDto mockTeacherDto2;
    private List<Teacher> mockTeachers;
    private List<TeacherDto> mockTeacherDtos;

    @BeforeEach
    void setUp() {
        // Création des teachers mock
        mockTeacher1 = new Teacher();
        mockTeacher1.setId(1L);
        mockTeacher1.setFirstName("Marie");
        mockTeacher1.setLastName("Dubois");
        mockTeacher1.setCreatedAt(LocalDateTime.now());
        mockTeacher1.setUpdatedAt(LocalDateTime.now());

        mockTeacher2 = new Teacher();
        mockTeacher2.setId(2L);
        mockTeacher2.setFirstName("Pierre");
        mockTeacher2.setLastName("Martin");
        mockTeacher2.setCreatedAt(LocalDateTime.now());
        mockTeacher2.setUpdatedAt(LocalDateTime.now());

        mockTeachers = Arrays.asList(mockTeacher1, mockTeacher2);

        // Création des DTOs mock
        mockTeacherDto1 = new TeacherDto();
        mockTeacherDto1.setId(1L);
        mockTeacherDto1.setFirstName("Marie");
        mockTeacherDto1.setLastName("Dubois");

        mockTeacherDto2 = new TeacherDto();
        mockTeacherDto2.setId(2L);
        mockTeacherDto2.setFirstName("Pierre");
        mockTeacherDto2.setLastName("Martin");

        mockTeacherDtos = Arrays.asList(mockTeacherDto1, mockTeacherDto2);
    }

    @Test
    @DisplayName("GET /api/teacher/{id} - Devrait retourner le professeur avec succès")
    void findById_ShouldReturnTeacher_WhenTeacherExists() {
        // Arrange - Configuration du mock pour retourner un professeur existant
        // Le service retourne le professeur mocké
        when(teacherService.findById(1L)).thenReturn(mockTeacher1);
        // Le mapper convertit l'entité en DTO
        when(teacherMapper.toDto(mockTeacher1)).thenReturn(mockTeacherDto1);

        // Act - Appel de l'endpoint avec l'ID "1"
        ResponseEntity<?> response = teacherController.findById("1");

        // Assert - Vérification de la réponse
        // Vérification du code statut HTTP 200 OK
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // Vérification que le corps de la réponse n'est pas null
        assertNotNull(response.getBody());
        // Vérification que le DTO retourné correspond au DTO attendu
        assertEquals(mockTeacherDto1, response.getBody());
        // Vérification que le service a été appelé avec le bon ID
        verify(teacherService, times(1)).findById(1L);
        // Vérification que le mapper a converti l'entité en DTO
        verify(teacherMapper, times(1)).toDto(mockTeacher1);
    }

    @Test
    @DisplayName("GET /api/teacher/{id} - Devrait retourner 404 si professeur inexistant")
    void findById_ShouldReturn404_WhenTeacherNotFound() {
        // Arrange - Configuration pour simuler un professeur inexistant
        // Le service retourne null car le professeur n'existe pas
        when(teacherService.findById(999L)).thenReturn(null);

        // Act - Tentative de récupération d'un professeur inexistant
        ResponseEntity<?> response = teacherController.findById("999");

        // Assert - Vérification de la réponse d'erreur
        // Vérification du code statut HTTP 404 Not Found
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        // Vérification que le service a été interrogé
        verify(teacherService, times(1)).findById(999L);
        // Vérification que le mapper n'a pas été appelé (pas de professeur à convertir)
        verify(teacherMapper, never()).toDto(any(Teacher.class));
    }

    @Test
    @DisplayName("GET /api/teacher/{id} - Devrait retourner 400 pour ID invalide")
    void findById_ShouldReturn400_WhenIdIsInvalid() {
        // Arrange - Pas de configuration nécessaire, on teste la validation de l'ID
        
        // Act - Appel avec un ID au format invalide (non numérique)
        ResponseEntity<?> response = teacherController.findById("invalid");

        // Assert - Vérification du rejet de la requête
        // Vérification du code statut HTTP 400 Bad Request
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        // Vérification que le service n'a jamais été appelé (validation échouée avant)
        verify(teacherService, never()).findById(anyLong());
    }

    @Test
    @DisplayName("GET /api/teacher/{id} - Devrait gérer les IDs négatifs")
    void findById_ShouldHandleNegativeId() {
        // Arrange - Configuration pour tester un ID négatif
        // Le service retourne null pour un ID négatif
        when(teacherService.findById(-1L)).thenReturn(null);

        // Act - Appel avec un ID négatif
        ResponseEntity<?> response = teacherController.findById("-1");

        // Assert - Vérification que l'ID négatif est traité comme inexistant
        // Vérification du code statut HTTP 404 Not Found
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        // Vérification que le service a été appelé avec l'ID négatif
        verify(teacherService, times(1)).findById(-1L);
    }

    @Test
    @DisplayName("GET /api/teacher/{id} - Devrait retourner les informations complètes du professeur")
    void findById_ShouldReturnCompleteTeacherInfo() {
        // Arrange - Configuration pour vérifier le contenu du DTO retourné
        // Le service retourne le professeur complet
        when(teacherService.findById(1L)).thenReturn(mockTeacher1);
        // Le mapper convertit avec toutes les propriétés
        when(teacherMapper.toDto(mockTeacher1)).thenReturn(mockTeacherDto1);

        // Act - Récupération du professeur
        ResponseEntity<?> response = teacherController.findById("1");

        // Assert - Vérification détaillée du contenu
        // Vérification du code statut HTTP 200 OK
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // Cast du corps de la réponse en TeacherDto
        TeacherDto returnedDto = (TeacherDto) response.getBody();
        assertNotNull(returnedDto);
        // Vérification de l'ID du professeur
        assertEquals(1L, returnedDto.getId());
        // Vérification du prénom
        assertEquals("Marie", returnedDto.getFirstName());
        // Vérification du nom de famille
        assertEquals("Dubois", returnedDto.getLastName());
    }

    @Test
    @DisplayName("GET /api/teacher - Devrait retourner tous les professeurs")
    void findAll_ShouldReturnAllTeachers() {
        // Arrange - Configuration pour retourner plusieurs professeurs
        // Le service retourne la liste de professeurs mockée
        when(teacherService.findAll()).thenReturn(mockTeachers);
        // Le mapper convertit la liste d'entités en liste de DTOs
        when(teacherMapper.toDto(mockTeachers)).thenReturn(mockTeacherDtos);

        // Act - Récupération de tous les professeurs
        ResponseEntity<?> response = teacherController.findAll();

        // Assert - Vérification de la réponse
        // Vérification du code statut HTTP 200 OK
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // Vérification que le corps de la réponse n'est pas null
        assertNotNull(response.getBody());
        // Vérification que la liste retournée correspond aux DTOs attendus
        assertEquals(mockTeacherDtos, response.getBody());
        // Vérification que le service a été appelé une fois
        verify(teacherService, times(1)).findAll();
        // Vérification que le mapper a converti la liste
        verify(teacherMapper, times(1)).toDto(mockTeachers);
    }

    @Test
    @DisplayName("GET /api/teacher - Devrait retourner une liste vide si aucun professeur")
    void findAll_ShouldReturnEmptyList_WhenNoTeachers() {
        // Arrange - Configuration pour simuler l'absence de professeurs
        // Le service retourne une liste vide
        when(teacherService.findAll()).thenReturn(Arrays.asList());
        // Le mapper retourne également une liste vide
        when(teacherMapper.toDto(Arrays.asList())).thenReturn(Arrays.asList());

        // Act - Récupération de tous les professeurs (aucun n'existe)
        ResponseEntity<?> response = teacherController.findAll();

        // Assert - Vérification de la liste vide
        // Vérification du code statut HTTP 200 OK (pas d'erreur, juste vide)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // Cast de la réponse en liste de TeacherDto
        @SuppressWarnings("unchecked")
        List<TeacherDto> result = (List<TeacherDto>) response.getBody();
        assertNotNull(result);
        // Vérification que la liste est bien vide
        assertTrue(result.isEmpty());
        // Vérification que le service a été interrogé
        verify(teacherService, times(1)).findAll();
    }

    @Test
    @DisplayName("GET /api/teacher - Devrait retourner le bon nombre de professeurs")
    void findAll_ShouldReturnCorrectNumberOfTeachers() {
        // Arrange - Configuration pour vérifier le nombre de professeurs retournés
        // Le service retourne 2 professeurs
        when(teacherService.findAll()).thenReturn(mockTeachers);
        // Le mapper convertit les 2 professeurs en DTOs
        when(teacherMapper.toDto(mockTeachers)).thenReturn(mockTeacherDtos);

        // Act - Récupération de tous les professeurs
        ResponseEntity<?> response = teacherController.findAll();

        // Assert - Vérification du nombre d'éléments
        // Vérification du code statut HTTP 200 OK
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // Cast de la réponse en liste
        @SuppressWarnings("unchecked")
        List<TeacherDto> result = (List<TeacherDto>) response.getBody();
        assertNotNull(result);
        // Vérification que la liste contient bien 2 professeurs
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("GET /api/teacher - Devrait mapper tous les professeurs correctement")
    void findAll_ShouldMapAllTeachersCorrectly() {
        // Arrange - Configuration pour vérifier le mapping détaillé
        // Le service retourne la liste complète
        when(teacherService.findAll()).thenReturn(mockTeachers);
        // Le mapper convertit chaque professeur avec ses données
        when(teacherMapper.toDto(mockTeachers)).thenReturn(mockTeacherDtos);

        // Act - Récupération et mapping des professeurs
        ResponseEntity<?> response = teacherController.findAll();

        // Assert - Vérification détaillée du contenu de chaque DTO
        // Cast de la réponse en liste
        @SuppressWarnings("unchecked")
        List<TeacherDto> result = (List<TeacherDto>) response.getBody();
        assertNotNull(result);
        // Vérification des données du premier professeur
        assertEquals("Marie", result.get(0).getFirstName());
        assertEquals("Dubois", result.get(0).getLastName());
        // Vérification des données du deuxième professeur
        assertEquals("Pierre", result.get(1).getFirstName());
        assertEquals("Martin", result.get(1).getLastName());
    }

    @Test
    @DisplayName("GET /api/teacher/{id} - Devrait gérer ID = 0")
    void findById_ShouldHandleZeroId() {
        // Arrange - Configuration pour tester l'ID 0
        // Le service retourne null pour l'ID 0
        when(teacherService.findById(0L)).thenReturn(null);

        // Act - Appel avec l'ID 0
        ResponseEntity<?> response = teacherController.findById("0");

        // Assert - Vérification que l'ID 0 est traité comme inexistant
        // Vérification du code statut HTTP 404 Not Found
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        // Vérification que le service a été appelé avec 0L
        verify(teacherService, times(1)).findById(0L);
    }

    @Test
    @DisplayName("GET /api/teacher/{id} - Devrait gérer les ID avec espaces")
    void findById_ShouldHandleIdWithSpaces() {
        // Arrange - Pas de configuration nécessaire, on teste la validation
        
        // Act - Appel avec un ID contenant des espaces
        ResponseEntity<?> response = teacherController.findById(" 1 ");

        // Assert - Vérification du rejet de l'ID mal formaté
        // NumberFormatException attendue pour " 1 " (espaces autour)
        // Vérification du code statut HTTP 400 Bad Request
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        // Vérification que le service n'a jamais été appelé
        verify(teacherService, never()).findById(anyLong());
    }
}
