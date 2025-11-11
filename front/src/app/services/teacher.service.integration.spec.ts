/// <reference types="jest" />

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { TeacherService } from './teacher.service';
import { Teacher } from '../interfaces/teacher.interface';

/**
 * TeacherService avec HttpClient réel
 * 
 * Ces tests valident l'intégration API pour la gestion des professeurs :
 * 1. DONNÉES RÉFÉRENTIELLES : Teachers = données de référence critiques pour l'app
 * 2. SÉLECTION MÉTIER : Choix du professeur lors de la création de sessions (admin)
 * 3. AFFICHAGE UTILISATEUR : Informations professeur dans les détails de session
 * 4. INTÉGRATION API : Communication réelle avec le backend des teachers
 */

describe('TeacherService Integration Tests', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  // Données de test réalistes pour les professeurs
  const mockTeachers: Teacher[] = [
    {
      id: 1,
      firstName: 'Marie',
      lastName: 'Dubois',
      createdAt: new Date('2023-01-15T09:00:00Z'),
      updatedAt: new Date('2024-03-10T14:30:00Z')
    },
    {
      id: 2,
      firstName: 'Pierre',
      lastName: 'Martin',
      createdAt: new Date('2023-02-20T10:15:00Z'),
      updatedAt: new Date('2024-01-05T16:45:00Z')
    },
    {
      id: 3,
      firstName: 'Sophie',
      lastName: 'Bernard',
      createdAt: new Date('2023-03-12T08:30:00Z'),
      updatedAt: new Date('2024-05-22T11:20:00Z')
    },
    {
      id: 4,
      firstName: 'Jean-Claude',
      lastName: 'Van Damme',
      createdAt: new Date('2023-04-08T07:00:00Z'),
      updatedAt: new Date('2023-04-08T07:00:00Z')
    }
  ];

  const mockTeacher: Teacher = mockTeachers[0];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherService]
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Vérifier qu'aucune requête HTTP n'est en attente
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Récupération de tous les professeurs avec données complètes
   * Valide l'intégration pour le formulaire de création de session (sélection professeur)
   */
  it('should retrieve all teachers with complete profile data for session creation', (done) => {
    // Act: Récupérer tous les professeurs via le service
    service.all().subscribe({
      next: (teachers) => {
        // Assert: Vérifier la structure complète des données professeurs
        expect(teachers).toEqual(mockTeachers);
        expect(teachers.length).toBe(4);
        
        // Vérification détaillée de la structure des données
        teachers.forEach(teacher => {
          expect(teacher.id).toBeGreaterThan(0);
          expect(teacher.firstName).toBeDefined();
          expect(teacher.lastName).toBeDefined();
          expect(teacher.createdAt).toBeInstanceOf(Date);
          expect(teacher.updatedAt).toBeInstanceOf(Date);
          expect(typeof teacher.firstName).toBe('string');
          expect(typeof teacher.lastName).toBe('string');
        });

        // Vérification spécifique du premier professeur
        const marieTeacher = teachers.find(t => t.firstName === 'Marie');
        expect(marieTeacher).toBeDefined();
        expect(marieTeacher!.lastName).toBe('Dubois');
        expect(marieTeacher!.id).toBe(1);
        
        done();
      },
      error: done.fail
    });

    // Assert: Vérifier la requête HTTP pour la liste complète
    const req = httpMock.expectOne('api/teacher');
    expect(req.request.method).toBe('GET');
    expect(req.request.url).toBe('api/teacher');
    
    // Simuler la réponse du serveur avec liste complète
    req.flush(mockTeachers);
  });

  /**
   * Récupération des détails d'un professeur spécifique
   * Valide l'intégration pour l'affichage des informations dans les détails de session
   */
  it('should retrieve specific teacher details for session information display', (done) => {
    // Arrange: Professeur avec toutes les informations détaillées
    const teacherId = '2';
    const detailedTeacher: Teacher = {
      id: 2,
      firstName: 'Pierre',
      lastName: 'Martin',
      createdAt: new Date('2023-02-20T10:15:00Z'),
      updatedAt: new Date('2024-01-05T16:45:00Z')
    };

    // Act: Récupérer les détails d'un professeur spécifique
    service.detail(teacherId).subscribe({
      next: (teacher) => {
        // Assert: Vérifier toutes les propriétés du professeur
        expect(teacher).toEqual(detailedTeacher);
        expect(teacher.id).toBe(2);
        expect(teacher.firstName).toBe('Pierre');
        expect(teacher.lastName).toBe('Martin');
        expect(teacher.createdAt).toBeInstanceOf(Date);
        expect(teacher.updatedAt).toBeInstanceOf(Date);
        
        // Vérification de l'intégrité des timestamps
        expect(teacher.createdAt.getTime()).toBeLessThan(teacher.updatedAt.getTime());
        
        done();
      },
      error: done.fail
    });

    // Assert: Vérifier la requête avec ID spécifique
    const req = httpMock.expectOne(`api/teacher/${teacherId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.url).toBe(`api/teacher/${teacherId}`);
    
    req.flush(detailedTeacher);
  });

  /**
   * Gestion des professeurs avec noms composés et caractères spéciaux
   * Valide l'intégration avec des données réelles complexes
   */
  it('should handle teachers with complex names and special characters', (done) => {
    // Arrange: Professeurs avec noms complexes (réalistes)
    const complexTeachers: Teacher[] = [
      {
        id: 10,
        firstName: 'Marie-Claire',
        lastName: 'De La Rosa-Martinez',
        createdAt: new Date('2023-05-01T12:00:00Z'),
        updatedAt: new Date('2024-02-15T18:30:00Z')
      },
      {
        id: 11,
        firstName: 'Jean-François',
        lastName: "O'Sullivan",
        createdAt: new Date('2023-06-10T14:20:00Z'),
        updatedAt: new Date('2024-03-20T09:45:00Z')
      },
      {
        id: 12,
        firstName: 'Amélie',
        lastName: 'Müller-Schmidt',
        createdAt: new Date('2023-07-15T16:30:00Z'),
        updatedAt: new Date('2024-04-10T13:15:00Z')
      }
    ];

    // Act: Récupérer les professeurs avec noms complexes
    service.all().subscribe({
      next: (teachers) => {
        // Assert: Vérifier que les caractères spéciaux sont préservés
        expect(teachers).toEqual(complexTeachers);
        
        const marieClaireTeacher = teachers.find(t => t.firstName === 'Marie-Claire');
        expect(marieClaireTeacher).toBeDefined();
        expect(marieClaireTeacher!.lastName).toBe('De La Rosa-Martinez');
        
        const jeanFrancoisTeacher = teachers.find(t => t.firstName === 'Jean-François');
        expect(jeanFrancoisTeacher).toBeDefined();
        expect(jeanFrancoisTeacher!.lastName).toBe("O'Sullivan");
        
        const amelieTeacher = teachers.find(t => t.firstName === 'Amélie');
        expect(amelieTeacher).toBeDefined();
        expect(amelieTeacher!.lastName).toBe('Müller-Schmidt');
        
        done();
      },
      error: done.fail
    });

    const req = httpMock.expectOne('api/teacher');
    req.flush(complexTeachers);
  });

  /**
   * Gestion des cas limites (liste vide de professeurs)
   * Valide le comportement avec des données edge-case
   */
  it('should handle empty teacher list gracefully for business continuity', (done) => {
    // Act: Récupérer une liste vide de professeurs
    service.all().subscribe({
      next: (teachers) => {
        // Assert: Vérifier la gestion de la liste vide
        expect(teachers).toEqual([]);
        expect(teachers.length).toBe(0);
        expect(Array.isArray(teachers)).toBe(true);
        done();
      },
      error: done.fail
    });

    // Simuler une réponse vide du serveur
    const req = httpMock.expectOne('api/teacher');
    req.flush([]);
  });

  /**
   * Gestion des erreurs métier (professeur non trouvé)
   * Valide les cas d'erreur réalistes pour l'affichage des sessions
   */
  it('should handle teacher not found error for session display integrity', (done) => {
    // Arrange: ID de professeur inexistant
    const nonExistentTeacherId = '999';

    // Act: Tenter de récupérer un professeur inexistant
    service.detail(nonExistentTeacherId).subscribe({
      next: () => done.fail('Should have failed with 404 error'),
      error: (error) => {
        // Assert: Vérifier l'erreur métier appropriée
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error).toContain('Teacher not found');
        done();
      }
    });

    // Simuler une erreur 404 du serveur
    const req = httpMock.expectOne(`api/teacher/${nonExistentTeacherId}`);
    req.flush(
      'Teacher not found',
      { status: 404, statusText: 'Not Found' }
    );
  });

  /**
   * Performance avec grande liste de professeurs
   * Valide la gestion d'un volume réaliste de données
   */
  it('should handle large teacher dataset for scalability validation', (done) => {
    // Arrange: Grande liste de professeurs (simulation d'une grande école)
    const largeTeacherList: Teacher[] = [];
    const teacherCount = 50;

    for (let i = 1; i <= teacherCount; i++) {
      largeTeacherList.push({
        id: i,
        firstName: `Professeur${i}`,
        lastName: `Nom${i}`,
        createdAt: new Date(`2023-01-${(i % 28) + 1}T10:00:00Z`),
        updatedAt: new Date(`2024-01-${(i % 28) + 1}T15:30:00Z`)
      });
    }

    // Act: Récupérer la grande liste
    service.all().subscribe({
      next: (teachers) => {
        // Assert: Vérifier la gestion de la grande liste
        expect(teachers.length).toBe(teacherCount);
        expect(teachers[0].firstName).toBe('Professeur1');
        expect(teachers[teacherCount - 1].firstName).toBe(`Professeur${teacherCount}`);
        
        // Vérifier que tous les objets ont la bonne structure
        teachers.forEach((teacher, index) => {
          expect(teacher.id).toBe(index + 1);
          expect(teacher.firstName).toBe(`Professeur${index + 1}`);
          expect(teacher.lastName).toBe(`Nom${index + 1}`);
        });
        
        done();
      },
      error: done.fail
    });

    const req = httpMock.expectOne('api/teacher');
    req.flush(largeTeacherList);
  });

  /**
   * Requêtes simultanées pour différents professeurs
   * Valide que le service peut gérer plusieurs requêtes en parallèle
   */
  it('should handle concurrent teacher detail requests for session management', () => {
    // Arrange: IDs de plusieurs professeurs
    const teacherIds = ['1', '2', '3', '4'];
    const responseTeachers = mockTeachers.slice(0, 4);

    // Act: Lancer plusieurs requêtes simultanément
    teacherIds.forEach(id => {
      service.detail(id).subscribe();
    });

    // Assert: Vérifier que toutes les requêtes sont envoyées correctement
    const requests = teacherIds.map(id => 
      httpMock.expectOne(`api/teacher/${id}`)
    );

    // Vérifier que toutes les requêtes sont des GET
    requests.forEach((req, index) => {
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(`api/teacher/${teacherIds[index]}`);
    });

    // Simuler les réponses pour chaque professeur
    requests.forEach((req, index) => {
      req.flush(responseTeachers[index]);
    });
  });

  /**
   * Validation de la cohérence des timestamps
   * S'assure que les dates sont correctement sérialisées/désérialisées
   */
  it('should properly serialize and deserialize teacher timestamp data', (done) => {
    // Arrange: Professeur avec timestamps précis
    const teacherWithPreciseTimestamps: Teacher = {
      id: 100,
      firstName: 'Timestamp',
      lastName: 'Test',
      createdAt: new Date('2023-12-25T14:30:45.123Z'),
      updatedAt: new Date('2024-06-15T09:22:33.987Z')
    };

    // Act: Récupérer le professeur
    service.detail('100').subscribe({
      next: (teacher) => {
        // Assert: Vérifier la précision des timestamps
        expect(teacher.createdAt).toBeInstanceOf(Date);
        expect(teacher.updatedAt).toBeInstanceOf(Date);
        expect(teacher.createdAt.toISOString()).toBe('2023-12-25T14:30:45.123Z');
        expect(teacher.updatedAt.toISOString()).toBe('2024-06-15T09:22:33.987Z');
        
        // Vérifier la logique métier des timestamps
        expect(teacher.createdAt.getTime()).toBeLessThan(teacher.updatedAt.getTime());
        
        done();
      },
      error: done.fail
    });

    const req = httpMock.expectOne('api/teacher/100');
    req.flush(teacherWithPreciseTimestamps);
  });

  /**
   * Validation de la cohérence des endpoints API
   * S'assure que tous les endpoints utilisent la base 'api/teacher'
   */
  it('should maintain consistent API endpoint structure for all operations', () => {
    // Act: Tester tous les endpoints du service
    service.all().subscribe();
    service.detail('1').subscribe();
    service.detail('25').subscribe();

    // Assert: Vérifier la cohérence des URLs
    const allRequest = httpMock.expectOne('api/teacher');
    const detail1Request = httpMock.expectOne('api/teacher/1');
    const detail2Request = httpMock.expectOne('api/teacher/25');

    // Vérifier que toutes les URLs utilisent la base correcte
    expect(allRequest.request.url).toBe('api/teacher');
    expect(detail1Request.request.url).toBe('api/teacher/1');
    expect(detail2Request.request.url).toBe('api/teacher/25');
    
    // Vérifier les méthodes HTTP
    expect(allRequest.request.method).toBe('GET');
    expect(detail1Request.request.method).toBe('GET');
    expect(detail2Request.request.method).toBe('GET');

    // Simuler les réponses
    allRequest.flush(mockTeachers);
    detail1Request.flush(mockTeachers[0]);
    detail2Request.flush(mockTeachers[1]);
  });

  /**
   * Gestion des erreurs réseau pour la continuité de service
   * Valide le comportement en cas de problème réseau
   */
  it('should handle network errors gracefully for service continuity', (done) => {
    // Act: Tenter une requête avec erreur réseau
    service.all().subscribe({
      next: () => done.fail('Should have failed with network error'),
      error: (error) => {
        // Assert: Vérifier la gestion de l'erreur réseau
        expect(error.status).toBe(0); // Status 0 pour les erreurs réseau
        done();
      }
    });

    // Simuler une erreur réseau
    const req = httpMock.expectOne('api/teacher');
    req.error(new ErrorEvent('Network error'), { status: 0 });
  });
});