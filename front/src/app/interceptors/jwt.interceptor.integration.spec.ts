/// <reference types="jest" />

import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { JwtInterceptor } from './jwt.interceptor';
import { SessionService } from '../services/session.service';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

/**
 * JwtInterceptor avec HttpClient et SessionService réels
 * 
 * Ces tests valident l'intégration critique de sécurité de l'application :
 * 1. SÉCURITÉ GLOBALE : Injection automatique du token JWT sur TOUTES les requêtes API
 * 2. AUTORISATION : Sans ce token, toutes les API protégées retournent 401/403
 * 3. ARCHITECTURE : Point central d'authentification pour l'application entière
 * 4. ROBUSTESSE : Doit fonctionner avec tous les verbes HTTP et types de requêtes
 */

describe('JwtInterceptor Integration Tests', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;

  // Configuration du module de test avec HttpClient et SessionService réels
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [
        SessionService,
        JwtInterceptor,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
  });

  afterEach(() => {
    // Vérifier qu'aucune requête HTTP n'est en attente et nettoyer la session
    httpMock.verify();
    sessionService.logOut();
  });

  /**
   * Injection automatique du token JWT pour utilisateur connecté
   * Valide que TOUTES les requêtes API incluent automatiquement le header Authorization
   */
  it('should automatically inject JWT token for all API requests when user is authenticated', () => {
    // Arrange: Connecter un utilisateur via SessionService réel
    const mockUser: SessionInformation = {
      token: 'integration-jwt-token',
      type: 'Bearer',
      id: 1,
      username: 'jwt@integration.test',
      firstName: 'JWT',
      lastName: 'User',
      admin: false
    };
    sessionService.logIn(mockUser);

    // Act: Effectuer une requête HTTP via HttpClient réel
    httpClient.get('/api/sessions').subscribe();

    // Assert: Vérifier que le token JWT a été automatiquement injecté
    const req = httpMock.expectOne('/api/sessions');
    expect(req.request.headers.has('Authorization')).toBeTruthy();
    expect(req.request.headers.get('Authorization')).toBe('Bearer integration-jwt-token');
    
    req.flush({ sessions: [] });
  });

  /**
   * Aucune injection de token pour utilisateur non connecté
   * Valide que les requêtes sans authentification n'incluent pas de header Authorization
   */
  it('should not inject JWT token when user is not authenticated', () => {
    // Arrange: S'assurer qu'aucun utilisateur n'est connecté
    expect(sessionService.isLogged).toBe(false);

    // Act: Effectuer une requête HTTP
    httpClient.post('/api/auth/login', { email: 'test@test.com', password: 'password' }).subscribe();

    // Assert: Vérifier qu'aucun header Authorization n'est présent
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBeFalsy();
    
    req.flush({ token: 'response-token' });
  });

  /**
   * Injection de token sur différents verbes HTTP
   * Valide que l'intercepteur fonctionne avec GET, POST, PUT, DELETE, PATCH
   */
  it('should inject JWT token for all HTTP methods when user is authenticated', () => {
    // Arrange: Connecter un utilisateur
    const mockUser: SessionInformation = {
      token: 'all-methods-token',
      type: 'Bearer',
      id: 2,
      username: 'methods@test.com',
      firstName: 'Methods',
      lastName: 'Test',
      admin: true
    };
    sessionService.logIn(mockUser);

    // Act & Assert: Test avec tous les verbes HTTP
    const testCases = [
      { method: 'GET', url: '/api/sessions', data: null },
      { method: 'POST', url: '/api/sessions', data: { name: 'New Session' } },
      { method: 'PUT', url: '/api/sessions/1', data: { name: 'Updated Session' } },
      { method: 'DELETE', url: '/api/sessions/1', data: null },
      { method: 'PATCH', url: '/api/sessions/1', data: { name: 'Patched Session' } }
    ];

    testCases.forEach(({ method, url, data }) => {
      // Effectuer la requête selon la méthode
      switch (method) {
        case 'GET':
          httpClient.get(url).subscribe();
          break;
        case 'POST':
          httpClient.post(url, data).subscribe();
          break;
        case 'PUT':
          httpClient.put(url, data).subscribe();
          break;
        case 'DELETE':
          httpClient.delete(url).subscribe();
          break;
        case 'PATCH':
          httpClient.patch(url, data).subscribe();
          break;
      }

      // Vérifier l'injection du token pour cette méthode
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe(method);
      expect(req.request.headers.get('Authorization')).toBe('Bearer all-methods-token');
      
      req.flush({});
    });
  });

  /**
   * Requêtes simultanées avec injection de token cohérente
   * Valide que l'intercepteur gère correctement plusieurs requêtes en parallèle
   */
  it('should inject JWT token consistently for concurrent requests', () => {
    // Arrange: Connecter un utilisateur
    const mockUser: SessionInformation = {
      token: 'concurrent-token',
      type: 'Bearer',
      id: 3,
      username: 'concurrent@test.com',
      firstName: 'Concurrent',
      lastName: 'User',
      admin: false
    };
    sessionService.logIn(mockUser);

    // Act: Effectuer plusieurs requêtes simultanées
    const urls = ['/api/sessions', '/api/teachers', '/api/user/3', '/api/sessions/1'];
    
    urls.forEach(url => {
      httpClient.get(url).subscribe();
    });

    // Assert: Vérifier que toutes les requêtes ont le token injecté
    urls.forEach(url => {
      const req = httpMock.expectOne(url);
      expect(req.request.headers.get('Authorization')).toBe('Bearer concurrent-token');
      req.flush({});
    });
  });

  /**
   * Changement d'état de session pendant les requêtes
   * Valide le comportement de l'intercepteur lors de connexion/déconnexion
   */
  it('should handle session state changes during request lifecycle', () => {
    // Phase 1: Requête sans authentification
    httpClient.get('/api/public').subscribe();
    const publicReq = httpMock.expectOne('/api/public');
    expect(publicReq.request.headers.has('Authorization')).toBeFalsy();
    publicReq.flush({});

    // Phase 2: Connexion utilisateur
    const mockUser: SessionInformation = {
      token: 'lifecycle-token',
      type: 'Bearer',
      id: 4,
      username: 'lifecycle@test.com',
      firstName: 'Lifecycle',
      lastName: 'Test',
      admin: true
    };
    sessionService.logIn(mockUser);

    // Phase 3: Requête avec authentification
    httpClient.get('/api/protected').subscribe();
    const protectedReq = httpMock.expectOne('/api/protected');
    expect(protectedReq.request.headers.get('Authorization')).toBe('Bearer lifecycle-token');
    protectedReq.flush({});

    // Phase 4: Déconnexion
    sessionService.logOut();

    // Phase 5: Nouvelle requête sans authentification
    httpClient.get('/api/public-again').subscribe();
    const publicAgainReq = httpMock.expectOne('/api/public-again');
    expect(publicAgainReq.request.headers.has('Authorization')).toBeFalsy();
    publicAgainReq.flush({});
  });

  /**
   * Préservation des headers existants
   * Valide que l'intercepteur n'écrase pas les headers personnalisés
   */
  it('should preserve existing headers while adding Authorization', () => {
    // Arrange: Connexion utilisateur
    const mockUser: SessionInformation = {
      token: 'preserve-headers-token',
      type: 'Bearer',
      id: 5,
      username: 'headers@test.com',
      firstName: 'Headers',
      lastName: 'Test',
      admin: false
    };
    sessionService.logIn(mockUser);

    // Act: Requête avec headers personnalisés
    httpClient.post('/api/sessions', { data: 'test' }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value'
      }
    }).subscribe();

    // Assert: Vérifier que tous les headers sont préservés + Authorization ajouté
    const req = httpMock.expectOne('/api/sessions');
    expect(req.request.headers.get('Authorization')).toBe('Bearer preserve-headers-token');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');
    
    req.flush({});
  });

  /**
   * Validation avec différents types de tokens
   * S'assure que l'intercepteur fonctionne avec différents formats de token
   */
  it('should work with different token types and formats', () => {
    const tokenTypes = [
      { token: 'short-token-123', type: 'Bearer' },
      { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', type: 'Bearer' }
    ];

    tokenTypes.forEach((tokenData, index) => {
      // Connexion avec ce type de token
      const mockUser: SessionInformation = {
        token: tokenData.token,
        type: tokenData.type,
        id: index + 10,
        username: `token${index}@test.com`,
        firstName: 'Token',
        lastName: `Test${index}`,
        admin: false
      };
      
      sessionService.logIn(mockUser);

      // Effectuer une requête
      httpClient.get(`/api/test/${index}`).subscribe();

      // Vérifier l'injection correcte du token
      const req = httpMock.expectOne(`/api/test/${index}`);
      expect(req.request.headers.get('Authorization')).toBe(`${tokenData.type} ${tokenData.token}`);
      req.flush({});

      // Déconnexion pour le test suivant
      sessionService.logOut();
    });
  });
});