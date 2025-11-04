/// <reference types="jest" />

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TeacherService } from './teacher.service';
import { Teacher } from '../interfaces/teacher.interface';

/**
 * Tests du service TeacherService - Gestion des professeurs
 * 
 * IMPORTANCE : ⭐⭐⭐⭐
 * 
 * Ce service gère les appels HTTP vers l'API des professeurs (teachers).
 * Il fournit les données nécessaires pour :
 * - Afficher la liste des professeurs disponibles
 * - Afficher les détails d'un professeur (sessions qu'il anime)
 * - Sélectionner un professeur lors de la création d'une session (admin)
 * 
 * FONCTIONNALITÉS TESTÉES :
 * 1. all() : Récupération de la liste complète des professeurs (GET /api/teacher)
 * 2. detail(id) : Récupération des détails d'un professeur (GET /api/teacher/:id)
 * 3. Gestion des erreurs HTTP (404, 401, 500)
 * 
 * TESTS ESSENTIELS :
 * - Appels HTTP corrects (méthode GET, URL)
 * - Transformation des réponses en objets Teacher[]
 * - Gestion des cas limites (liste vide, professeur introuvable)
 * - Gestion des erreurs réseau
 * 
 * IMPACT MÉTIER :
 * - Utilisé dans le formulaire de création de session (sélection du professeur)
 * - Utilisé dans la page de détail d'une session (affichage du professeur)
 */
describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  const mockTeacher: Teacher = {
    id: 1,
    lastName: 'Dubois',
    firstName: 'Marie',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-06-15')
  };

  const mockTeachers: Teacher[] = [
    mockTeacher,
    {
      id: 2,
      lastName: 'Martin',
      firstName: 'Pierre',
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2023-07-01')
    },
    {
      id: 3,
      lastName: 'Bernard',
      firstName: 'Sophie',
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date('2023-08-01')
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherService]
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Vérifie qu'aucune requête HTTP n'est en attente
    httpMock.verify();
  });

  /**
   * Test de création du service
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Tests de récupération de la liste des professeurs
   * 
   * IMPORTANCE : ⭐⭐⭐⭐
   * Utilisé pour afficher la liste des professeurs dans le formulaire de création de session (admin)
   */
  describe('all', () => {
    /**
     * Scénario nominal : récupération de tous les professeurs
     * Utilisé dans le formulaire de création de session
     */
    it('should retrieve all teachers', (done) => {
      // Act
      service.all().subscribe({
        next: (teachers) => {
          // Assert
          expect(teachers).toEqual(mockTeachers);
          expect(teachers.length).toBe(3);
          done();
        },
        error: done.fail
      });

      // Assert HTTP
      const req = httpMock.expectOne('api/teacher');
      expect(req.request.method).toBe('GET');
      req.flush(mockTeachers);
    });

    /**
     * Cas limite : liste vide (aucun professeur)
     * Important pour l'UX : afficher un message approprié
     */
    it('should return empty array when no teachers exist', (done) => {
      // Act
      service.all().subscribe({
        next: (teachers) => {
          // Assert
          expect(teachers).toEqual([]);
          expect(teachers.length).toBe(0);
          done();
        },
        error: done.fail
      });

      // Assert HTTP
      const req = httpMock.expectOne('api/teacher');
      req.flush([]);
    });

    it('should handle HTTP error', (done) => {
      // Act
      service.all().subscribe({
        next: () => done.fail('Should have failed with 500 error'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(500);
          done();
        }
      });

      // Simulate HTTP error
      const req = httpMock.expectOne('api/teacher');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should call correct API endpoint', () => {
      // Act
      service.all().subscribe();

      // Assert
      const req = httpMock.expectOne('api/teacher');
      expect(req.request.url).toBe('api/teacher');
      req.flush(mockTeachers);
    });
  });

  /**
   * Tests de récupération d'un professeur par ID
   * 
   * IMPORTANCE : ⭐⭐⭐⭐
   * Utilisé pour afficher les informations du professeur dans la page de détail d'une session
   */
  describe('detail', () => {
    /**
     * Scénario nominal : récupération d'un professeur par ID
     */
    it('should retrieve a teacher by id', (done) => {
      // Arrange
      const teacherId = '1';

      // Act
      service.detail(teacherId).subscribe({
        next: (teacher) => {
          // Assert
          expect(teacher).toEqual(mockTeacher);
          expect(teacher.id).toBe(1);
          expect(teacher.firstName).toBe('Marie');
          expect(teacher.lastName).toBe('Dubois');
          done();
        },
        error: done.fail
      });

      // Assert HTTP
      const req = httpMock.expectOne(`api/teacher/${teacherId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTeacher);
    });

    it('should call correct API endpoint with teacher id', () => {
      // Arrange
      const teacherId = '42';

      // Act
      service.detail(teacherId).subscribe();

      // Assert
      const req = httpMock.expectOne('api/teacher/42');
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toContain('api/teacher/42');
      req.flush(mockTeacher);
    });

    /**
     * Gestion d'erreur : professeur non trouvé (404)
     * Important pour éviter les erreurs d'affichage
     */
    it('should handle 404 error when teacher not found', (done) => {
      // Arrange
      const teacherId = '999';

      // Act
      service.detail(teacherId).subscribe({
        next: () => done.fail('Should have failed with 404 error'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
          done();
        }
      });

      // Simulate HTTP error
      const req = httpMock.expectOne(`api/teacher/${teacherId}`);
      req.flush('Teacher not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle different teacher ids', () => {
      // Test avec plusieurs IDs différents
      const teacherIds = ['1', '5', '10', '100'];

      teacherIds.forEach((id) => {
        service.detail(id).subscribe();
        const req = httpMock.expectOne(`api/teacher/${id}`);
        expect(req.request.url).toBe(`api/teacher/${id}`);
        req.flush(mockTeacher);
      });
    });

    it('should return complete teacher data structure', (done) => {
      // Arrange
      const teacherId = '1';

      // Act
      service.detail(teacherId).subscribe({
        next: (teacher) => {
          // Assert - vérifie toutes les propriétés
          expect(teacher.id).toBeDefined();
          expect(teacher.firstName).toBeDefined();
          expect(teacher.lastName).toBeDefined();
          expect(teacher.createdAt).toBeDefined();
          expect(teacher.updatedAt).toBeDefined();
          
          expect(typeof teacher.id).toBe('number');
          expect(typeof teacher.firstName).toBe('string');
          expect(typeof teacher.lastName).toBe('string');
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`api/teacher/${teacherId}`);
      req.flush(mockTeacher);
    });

    it('should handle 401 unauthorized error', (done) => {
      // Arrange
      const teacherId = '1';

      // Act
      service.detail(teacherId).subscribe({
        next: () => done.fail('Should have failed with 401'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(401);
          done();
        }
      });

      // Simulate HTTP error
      const req = httpMock.expectOne(`api/teacher/${teacherId}`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('API path configuration', () => {
    it('should use correct base path for all endpoints', () => {
      // Test all()
      service.all().subscribe();
      const allReq = httpMock.expectOne('api/teacher');
      expect(allReq.request.url).toBe('api/teacher');
      allReq.flush([]);

      // Test detail()
      service.detail('1').subscribe();
      const detailReq = httpMock.expectOne('api/teacher/1');
      expect(detailReq.request.url).toContain('api/teacher');
      detailReq.flush(mockTeacher);
    });
  });

  describe('HTTP methods', () => {
    it('should use GET method for all()', () => {
      service.all().subscribe();
      const req = httpMock.expectOne('api/teacher');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should use GET method for detail()', () => {
      service.detail('1').subscribe();
      const req = httpMock.expectOne('api/teacher/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockTeacher);
    });
  });
});
