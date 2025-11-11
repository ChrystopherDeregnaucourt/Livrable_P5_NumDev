/// <reference types="jest" />

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { Session } from '../interfaces/session.interface';
import { SessionApiService } from './session-api.service';

/**
 * TESTS - SessionApiService (CRUD)
 * 
 * Ces tests couvrent :
 * 1. API MÉTIER : CRUD sessions = fonctions business principales de l'app
 * 2. GESTION DONNÉES : Persistance et récupération des sessions yoga
 * 3. GESTION ERREURS : Robustesse face aux erreurs réseau/serveur
 * 4. INTÉGRITÉ : Opérations critiques (créer/supprimer sessions)
 */
describe('SessionApiService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

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

  describe('all', () => {
    it('should get all sessions', () => {
      // Données de test pour la liste des sessions
      const mockSessions: Session[] = [
        {
          id: 1,
          name: 'Session Yoga débutant',
          description: 'Session pour les débutants',
          date: new Date('2023-12-01'),
          teacher_id: 1,
          users: [1, 2],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          name: 'Session Yoga avancé',
          description: 'Session pour les pratiquants avancés',
          date: new Date('2023-12-02'),
          teacher_id: 2,
          users: [2, 3],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Appel de la méthode all
      service.all().subscribe(sessions => {
        // Vérifier que la liste retournée correspond aux données attendues
        expect(sessions).toEqual(mockSessions);
        expect(sessions.length).toBe(2);
      });

      // Vérifier qu'une requête GET a été faite
      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('GET');
      
      // Simuler une réponse réussie avec la liste des sessions
      req.flush(mockSessions);
    });

    it('should handle empty sessions list', () => {
      const mockSessions: Session[] = [];

      service.all().subscribe(sessions => {
        expect(sessions).toEqual(mockSessions);
        expect(sessions.length).toBe(0);
      });

      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('GET');
      req.flush(mockSessions);
    });
  });

  describe('detail', () => {
    it('should get session by id', () => {
      // Données de test pour une session spécifique
      const mockSession: Session = {
        id: 1,
        name: 'Session Yoga débutant',
        description: 'Session pour les débutants en yoga',
        date: new Date('2023-12-01'),
        teacher_id: 1,
        users: [1, 2, 3],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const sessionId = '1';

      // Appel de la méthode detail
      service.detail(sessionId).subscribe(session => {
        expect(session).toEqual(mockSession);
        expect(session.id).toBe(1);
        expect(session.users.length).toBe(3);
      });

      // Vérifier la requête HTTP
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSession);
    });

    it('should handle session not found', () => {
      const sessionId = '999';

      service.detail(sessionId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('GET');
      req.flush('Session not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should create a new session', () => {
      // Données de test pour créer une session
      const newSession: Session = {
        id: 0,
        name: 'Nouvelle Session Yoga',
        description: 'Description de la nouvelle session',
        date: new Date('2023-12-15'),
        teacher_id: 1,
        users: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Données attendues après création (avec ID écrasé)
      const createdSession: Session = { ...newSession, id: 3 };

      // Appel de la méthode create
      service.create(newSession).subscribe(session => {
        expect(session).toEqual(createdSession);
        expect(session.id).toBe(3);
      });

      // Vérifier la requête HTTP
      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newSession);
      req.flush(createdSession);
    });

    it('should handle create session error', () => {
      // Création d'une session invalide pour déclencher une erreur côté serveur
      const newSession: Session = {
        id: 0,
        name: '',           // Nom vide -> validation échoue
        description: '',    // Description vide -> validation échoue
        date: new Date(),
        teacher_id: 0,      // ID professeur invalide (0 n'existe pas)
        users: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.create(newSession).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);  // Bad Request attendu
        }
      });

      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('POST');
      
      // Correspond à une validation échouée côté API (champs obligatoires manquants)
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should update a session', () => {
      // SIMULATION D'ÉTAT : On simule qu'une session avec l'ID=1 existe déjà
      const sessionId = '1';
      
      // Données de la session après modification (ce que l'API retourne)
      const updatedSession: Session = {
        id: 1,                           
        name: 'Session Yoga Modifiée',   
        description: 'Description modifiée',
        date: new Date('2023-12-20'),
        teacher_id: 2,
        users: [1, 4],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Test de l'appel du service update
      service.update(sessionId, updatedSession).subscribe(session => {
        expect(session).toEqual(updatedSession);
        expect(session.name).toBe('Session Yoga Modifiée');
      });

      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedSession);
      
      req.flush(updatedSession);
    });

    it('should handle update session error', () => {
      const sessionId = '1';
      const updatedSession: Session = {
        id: 1,
        name: '',
        description: '',
        date: new Date(),
        teacher_id: 0,
        users: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.update(sessionId, updatedSession).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('PUT');
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('delete', () => {
    it('should delete a session', () => {
      // SIMULATION : On supprime la session avec l'ID=1 (supposée existante)
      const sessionId = '1';

      // Appel de la méthode delete
      service.delete(sessionId).subscribe(response => {
        // Vérifier que la réponse est bien reçue (même si vide pour un DELETE)
        expect(response).toBeDefined();
        // Pour une suppression réussie, la réponse peut être un objet vide
        expect(response).toEqual({});
      });

      // Vérifications de la requête HTTP envoyée
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.url).toBe(`api/session/${sessionId}`);
      
      // Simulation d'une réponse 200 OK avec un body vide
      req.flush({});
    });

    it('should handle delete session error', () => {
      const sessionId = '1';

      service.delete(sessionId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
});
