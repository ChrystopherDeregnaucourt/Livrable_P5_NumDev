package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour TeacherService
 * 
 * JUSTIFICATION : Tests pour la logique métier des professeurs
 * - Récupération de tous les professeurs
 * - Récupération d'un professeur par ID
 * - Gestion des cas limites
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TeacherService - Tests unitaires")
class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private TeacherService teacherService;

    private Teacher mockTeacher1;
    private Teacher mockTeacher2;
    private List<Teacher> mockTeachers;

    @BeforeEach
    void setUp() {
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
    }

    @Test
    @DisplayName("findAll - Devrait retourner tous les professeurs")
    void findAll_ShouldReturnAllTeachers() {
        // Arrange
        when(teacherRepository.findAll()).thenReturn(mockTeachers);

        // Act
        List<Teacher> result = teacherService.findAll();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Marie", result.get(0).getFirstName());
        assertEquals("Pierre", result.get(1).getFirstName());
        verify(teacherRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("findAll - Devrait retourner une liste vide si aucun professeur")
    void findAll_ShouldReturnEmptyList_WhenNoTeachers() {
        // Arrange
        when(teacherRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<Teacher> result = teacherService.findAll();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(teacherRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("findAll - Devrait appeler le repository une seule fois")
    void findAll_ShouldCallRepositoryOnce() {
        // Arrange
        when(teacherRepository.findAll()).thenReturn(mockTeachers);

        // Act
        teacherService.findAll();

        // Assert
        verify(teacherRepository, times(1)).findAll();
        verifyNoMoreInteractions(teacherRepository);
    }

    @Test
    @DisplayName("findAll - Devrait retourner une liste avec tous les professeurs")
    void findAll_ShouldReturnListWithAllTeachers() {
        // Arrange
        Teacher teacher3 = new Teacher();
        teacher3.setId(3L);
        teacher3.setFirstName("Sophie");
        teacher3.setLastName("Bernard");
        
        List<Teacher> threeTeachers = Arrays.asList(mockTeacher1, mockTeacher2, teacher3);
        when(teacherRepository.findAll()).thenReturn(threeTeachers);

        // Act
        List<Teacher> result = teacherService.findAll();

        // Assert
        assertEquals(3, result.size());
        assertEquals("Sophie", result.get(2).getFirstName());
    }

    @Test
    @DisplayName("findById - Devrait retourner le professeur quand il existe")
    void findById_ShouldReturnTeacher_WhenTeacherExists() {
        // Arrange
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(mockTeacher1));

        // Act
        Teacher result = teacherService.findById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Marie", result.getFirstName());
        assertEquals("Dubois", result.getLastName());
        verify(teacherRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("findById - Devrait retourner null quand le professeur n'existe pas")
    void findById_ShouldReturnNull_WhenTeacherNotFound() {
        // Arrange
        when(teacherRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        Teacher result = teacherService.findById(999L);

        // Assert
        assertNull(result);
        verify(teacherRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("findById - Devrait gérer les IDs négatifs")
    void findById_ShouldHandleNegativeIds() {
        // Arrange
        when(teacherRepository.findById(-1L)).thenReturn(Optional.empty());

        // Act
        Teacher result = teacherService.findById(-1L);

        // Assert
        assertNull(result);
        verify(teacherRepository, times(1)).findById(-1L);
    }

    @Test
    @DisplayName("findById - Devrait appeler le repository une seule fois")
    void findById_ShouldCallRepositoryOnce() {
        // Arrange
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(mockTeacher1));

        // Act
        teacherService.findById(1L);

        // Assert
        verify(teacherRepository, times(1)).findById(1L);
        verifyNoMoreInteractions(teacherRepository);
    }

    @Test
    @DisplayName("findById - Devrait retourner un professeur avec toutes ses propriétés")
    void findById_ShouldReturnTeacherWithAllProperties() {
        // Arrange
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(mockTeacher1));

        // Act
        Teacher result = teacherService.findById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Marie", result.getFirstName());
        assertEquals("Dubois", result.getLastName());
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getUpdatedAt());
    }

    @Test
    @DisplayName("findById - Devrait gérer ID = 0")
    void findById_ShouldHandleZeroId() {
        // Arrange
        when(teacherRepository.findById(0L)).thenReturn(Optional.empty());

        // Act
        Teacher result = teacherService.findById(0L);

        // Assert
        assertNull(result);
        verify(teacherRepository, times(1)).findById(0L);
    }

    @Test
    @DisplayName("findById - Devrait retourner le bon professeur parmi plusieurs")
    void findById_ShouldReturnCorrectTeacherAmongMultiple() {
        // Arrange
        when(teacherRepository.findById(2L)).thenReturn(Optional.of(mockTeacher2));

        // Act
        Teacher result = teacherService.findById(2L);

        // Assert
        assertNotNull(result);
        assertEquals(2L, result.getId());
        assertEquals("Pierre", result.getFirstName());
        assertEquals("Martin", result.getLastName());
        verify(teacherRepository, times(1)).findById(2L);
    }

    @Test
    @DisplayName("Service devrait utiliser le repository injecté")
    void service_ShouldUseInjectedRepository() {
        // Arrange
        when(teacherRepository.findAll()).thenReturn(mockTeachers);
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(mockTeacher1));

        // Act
        teacherService.findAll();
        teacherService.findById(1L);

        // Assert
        verify(teacherRepository).findAll();
        verify(teacherRepository).findById(1L);
    }
}
