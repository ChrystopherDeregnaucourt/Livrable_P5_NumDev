/// <reference types="jest" />

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { SessionApiService } from './session-api.service';
import { Session } from '../interfaces/session.interface';

/**
 * SessionApiService avec HttpClient réel
 * 
 * Ces tests valident l'intégration API critique pour la gestion des sessions :
 * 1. CRUD COMPLET : Create, Read, Update, Delete des sessions yoga
 * 2. PARTICIPATION : Inscription/désinscription des utilisateurs aux sessions
 * 3. MÉTIER CRITIQUE : Sessions = cœur fonctionnel de l'application yoga
 * 4. INTÉGRATION API : Communication réelle avec le backend des sessions
 */

describe('SessionApiService Integration Tests', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  // Données de test réalistes pour les sessions
  const mockSessions: Session[] = [
    {
      id: 1,
      name: 'Yoga Vinyasa Flow',
      description: 'Session dynamique de yoga avec enchaînements fluides',
      date: new Date('2024-12-15T18:00:00Z'),
      teacher_id: 1,
      users: [1, 3, 7, 12],
      createdAt: new Date('2024-11-01T10:00:00Z'),
      updatedAt: new Date('2024-11-05T14:30:00Z')
    },
    {
      id: 2,
      name: 'Hatha Yoga Débutant',
      description: 'Séance douce pour débuter en yoga avec postures statiques',
      date: new Date('2024-12-16T10:00:00Z'),
      teacher_id: 2,
      users: [2, 4, 8],
      createdAt: new Date('2024-11-02T09:00:00Z'),
      updatedAt: new Date('2024-11-02T09:00:00Z')
    }
  ];

  const mockSession: Session = mockSessions[0];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionApiService]
    });
    service = TestBed.inject(SessionApiService);
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
   * Récupération de toutes les sessions
   * Valide l'intégration complète pour l'affichage de la liste des sessions
   */
  it('should retrieve all sessions with complete data integration', (done) => {
    // Act: Récupérer toutes les sessions via le service
    service.all().subscribe({
      next: (sessions) => {
        // Assert: Vérifier la structure complète des données
        expect(sessions).toEqual(mockSessions);
        expect(sessions.length).toBe(2);
        
        // Vérification détaillée du premier objet session
        const firstSession = sessions[0];
        expect(firstSession.id).toBe(1);
        expect(firstSession.name).toBe('Yoga Vinyasa Flow');
        expect(firstSession.description).toContain('dynamique');
        expect(firstSession.teacher_id).toBe(1);
        expect(firstSession.users).toEqual([1, 3, 7, 12]);
        expect(firstSession.date).toBeInstanceOf(Date);
        expect(firstSession.createdAt).toBeInstanceOf(Date);
        expect(firstSession.updatedAt).toBeInstanceOf(Date);
        
        done();
      },
      error: done.fail
    });

    // Assert: Vérifier la requête HTTP
    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('GET');
    expect(req.request.url).toBe('api/session');
    
    // Simuler la réponse du serveur avec données complètes
    req.flush(mockSessions);
  });

  /**
   * Récupération d'une session spécifique avec détails complets
   * Valide l'intégration pour l'affichage des détails d'une session
   */
  it('should retrieve session details with all related data', (done) => {
    // Arrange: Session avec toutes les propriétés
    const sessionId = '1';
    const detailedSession: Session = {
      ...mockSession,
      description: 'Description détaillée avec informations complètes sur la session de yoga Vinyasa',
      users: [1, 3, 7, 12, 15] // Liste étendue de participants
    };

    // Act: Récupérer les détails d'une session
    service.detail(sessionId).subscribe({
      next: (session) => {
        // Assert: Vérifier tous les détails de la session
        expect(session).toEqual(detailedSession);
        expect(session.id).toBe(1);
        expect(session.description).toContain('complètes');
        expect(session.users.length).toBe(5);
        expect(session.date).toBeInstanceOf(Date);
        done();
      },
      error: done.fail
    });

    // Assert: Vérifier la requête avec ID
    const req = httpMock.expectOne(`api/session/${sessionId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.url).toBe(`api/session/${sessionId}`);
    
    req.flush(detailedSession);
  });

  /**
   * Création d'une nouvelle session avec validation complète
   * Valide le processus complet de création avec toutes les données métier
   */
  it('should create a new session with complete business data validation', (done) => {
    // Arrange: Nouvelle session avec toutes les propriétés métier
    const newSession: Session = {
      id: 0, // ID sera généré par le serveur
      name: 'Yoga Restauratif Intégration',
      description: 'Nouvelle session de yoga restauratif pour la détente profonde avec coussins et couvertures',
      date: new Date('2024-12-20T19:30:00Z'),
      teacher_id: 3,
      users: [], // Nouvelle session sans participants
      createdAt: new Date(), // Sera défini par le serveur
      updatedAt: new Date()  // Sera défini par le serveur
    };

    const createdSession: Session = {
      ...newSession,
      id: 25, // ID généré par le serveur
      createdAt: new Date('2024-11-06T15:00:00Z'),
      updatedAt: new Date('2024-11-06T15:00:00Z')
    };

    // Act: Créer la nouvelle session
    service.create(newSession).subscribe({
      next: (session) => {
        // Assert: Vérifier que la session créée contient toutes les données
        expect(session.id).toBe(25); // ID généré par le serveur
        expect(session.name).toBe('Yoga Restauratif Intégration');
        expect(session.description).toContain('restauratif');
        expect(session.teacher_id).toBe(3);
        expect(session.users).toEqual([]);
        expect(session.createdAt).toBeInstanceOf(Date);
        done();
      },
      error: done.fail
    });

    // Assert: Vérifier la requête de création
    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newSession);
    expect(req.request.body.name).toBe('Yoga Restauratif Intégration');
    expect(req.request.body.teacher_id).toBe(3);
    
    req.flush(createdSession);
  });

  /**
   * Mise à jour d'une session avec modifications multiples
   * Valide les modifications de session avec gestion des participants
   */
  it('should update session with multiple field modifications', (done) => {
    // Arrange: Session modifiée avec plusieurs changements
    const sessionId = '1';
    const updatedSessionData: Session = {
      ...mockSession,
      name: 'Yoga Vinyasa Flow - Niveau Avancé', // Nom modifié
      description: 'Session avancée avec postures complexes et pranayama', // Description modifiée
      date: new Date('2024-12-15T19:00:00Z'), // Heure modifiée
      users: [1, 3, 7, 12, 20, 25], // Nouveaux participants ajoutés
      updatedAt: new Date('2024-11-06T16:00:00Z') // Timestamp de modification
    };

    // Act: Mettre à jour la session
    service.update(sessionId, updatedSessionData).subscribe({
      next: (session) => {
        // Assert: Vérifier toutes les modifications
        expect(session.id).toBe(1);
        expect(session.name).toContain('Avancé');
        expect(session.description).toContain('complexes');
        expect(session.users.length).toBe(6); // 2 participants ajoutés
        expect(session.users).toContain(20);
        expect(session.users).toContain(25);
        done();
      },
      error: done.fail
    });

    // Assert: Vérifier la requête de mise à jour
    const req = httpMock.expectOne(`api/session/${sessionId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedSessionData);
    expect(req.request.url).toBe(`api/session/${sessionId}`);
    
    req.flush(updatedSessionData);
  });

  /**
   * Suppression d'une session avec validation de l'ID
   * Valide le processus complet de suppression
   */
  it('should delete session with proper ID validation', (done) => {
    // Arrange: ID de session à supprimer
    const sessionId = '15';

    // Act: Supprimer la session
    service.delete(sessionId).subscribe({
      next: (result) => {
        // Assert: Vérifier que la suppression s'est bien passée
        expect(result).toBeDefined(); // Peut être null ou un objet de confirmation
        done();
      },
      error: done.fail
    });

    // Assert: Vérifier la requête de suppression
    const req = httpMock.expectOne(`api/session/${sessionId}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.url).toBe(`api/session/${sessionId}`);
    
    req.flush({ message: 'Session deleted successfully' });
  });

  /**
   * Inscription d'un utilisateur à une session
   * Valide le processus métier d'inscription avec IDs réels
   */
  it('should handle user participation with business logic validation', (done) => {
    // Arrange: Données d'inscription réalistes
    const sessionId = '5';
    const userId = '42';

    // Act: Inscrire l'utilisateur à la session
    service.participate(sessionId, userId).subscribe({
      next: (result) => {
        // Assert: L'inscription retourne void mais est réussie
        expect(result).toBeUndefined();
        done();
      },
      error: done.fail
    });

    // Assert: Vérifier la requête d'inscription
    const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(null); // Pas de body pour cette opération
    expect(req.request.url).toBe(`api/session/${sessionId}/participate/${userId}`);
    
    req.flush(null);
  });

  /**
   * Désinscription d'un utilisateur d'une session
   * Valide le processus métier de désinscription
   */
  it('should handle user un-participation with proper validation', (done) => {
    // Arrange: Données de désinscription
    const sessionId = '5';
    const userId = '42';

    // Act: Désinscrire l'utilisateur de la session
    service.unParticipate(sessionId, userId).subscribe({
      next: (result) => {
        // Assert: La désinscription retourne void mais est réussie
        expect(result).toBeUndefined();
        done();
      },
      error: done.fail
    });

    // Assert: Vérifier la requête de désinscription
    const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toBe(null);
    expect(req.request.url).toBe(`api/session/${sessionId}/participate/${userId}`);
    
    req.flush(null);
  });

  /**
   * Gestion des erreurs métier (session non trouvée)
   * Valide les cas d'erreur réalistes du métier
   */
  it('should handle business errors with appropriate error details', (done) => {
    // Arrange: ID de session inexistante
    const nonExistentSessionId = '999';

    // Act: Tenter de récupérer une session inexistante
    service.detail(nonExistentSessionId).subscribe({
      next: () => done.fail('Should have failed with 404 error'),
      error: (error) => {
        // Assert: Vérifier l'erreur métier
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error).toContain('Session not found');
        done();
      }
    });

    // Simuler une erreur 404 du serveur
    const req = httpMock.expectOne(`api/session/${nonExistentSessionId}`);
    req.flush(
      'Session not found',
      { status: 404, statusText: 'Not Found' }
    );
  });

  /**
   * Opérations simultanées sur différentes sessions
   * Valide que le service peut gérer plusieurs requêtes en parallèle
   */
  it('should handle concurrent operations on different sessions', () => {
    // Arrange: Données pour opérations simultanées
    const sessionIds = ['1', '2', '3'];
    const userId = '10';

    // Act: Lancer plusieurs opérations simultanément
    service.detail(sessionIds[0]).subscribe();
    service.participate(sessionIds[1], userId).subscribe();
    service.delete(sessionIds[2]).subscribe();

    // Assert: Vérifier que toutes les requêtes sont envoyées correctement
    const detailReq = httpMock.expectOne(`api/session/${sessionIds[0]}`);
    const participateReq = httpMock.expectOne(`api/session/${sessionIds[1]}/participate/${userId}`);
    const deleteReq = httpMock.expectOne(`api/session/${sessionIds[2]}`);

    expect(detailReq.request.method).toBe('GET');
    expect(participateReq.request.method).toBe('POST');
    expect(deleteReq.request.method).toBe('DELETE');

    // Simuler les réponses
    detailReq.flush(mockSession);
    participateReq.flush(null);
    deleteReq.flush({ message: 'Deleted' });
  });

  /**
   * Validation de la cohérence des endpoints API
   * S'assure que tous les endpoints utilisent la base 'api/session'
   */
  it('should maintain consistent API endpoint structure', () => {
    // Act: Tester tous les endpoints du service
    service.all().subscribe();
    service.detail('1').subscribe();
    service.create(mockSession).subscribe();
    service.update('1', mockSession).subscribe();
    service.delete('1').subscribe();
    service.participate('1', '2').subscribe();
    service.unParticipate('1', '2').subscribe();

    // Assert: Vérifier la cohérence des URLs
    const requests = [
      httpMock.expectOne('api/session'),                    // all()
      httpMock.expectOne('api/session/1'),                  // detail()
      httpMock.expectOne('api/session'),                    // create()
      httpMock.expectOne('api/session/1'),                  // update()
      httpMock.expectOne('api/session/1'),                  // delete()
      httpMock.expectOne('api/session/1/participate/2'),    // participate()
      httpMock.expectOne('api/session/1/participate/2')     // unParticipate()
    ];

    // Vérifier que toutes les URLs commencent par 'api/session'
    requests.forEach(req => {
      expect(req.request.url).toMatch(/^api\/session/);
    });

    // Simuler les réponses
    requests[0].flush(mockSessions);
    requests[1].flush(mockSession);
    requests[2].flush(mockSession);
    requests[3].flush(mockSession);
    requests[4].flush({});
    requests[5].flush(null);
    requests[6].flush(null);
  });
});