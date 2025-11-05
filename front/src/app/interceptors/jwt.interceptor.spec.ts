/// <reference types="jest" />

import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { SessionInformation } from '../interfaces/sessionInformation.interface';
import { SessionService } from '../services/session.service';
import { JwtInterceptor } from './jwt.interceptor';

/**
 * TESTS - JwtInterceptor
 * 
 * Ces tests couvrent :
 * 1. SÉCURITÉ GLOBALE : Injection automatique du token JWT sur TOUTES les requêtes API
 * 2. AUTORISATION : Sans ce token, toutes les API retournent 401/403
 * 3. ARCHITECTURE : Point central d'authentification pour l'app
 * 4. ROBUSTESSE : Doit fonctionner avec tous les verbes HTTP (GET, POST, PUT, DELETE)
 */

describe('JwtInterceptor', () => {
  let interceptor: JwtInterceptor;
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        JwtInterceptor,
        SessionService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true
        }
      ]
    });

    interceptor = TestBed.inject(JwtInterceptor);
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
  });

  afterEach(() => {
    // Vérifier qu'aucune requête HTTP n'est en attente
    httpMock.verify();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  describe('intercept', () => {
    it('should add Authorization header when user is logged in', () => {
      // Simuler un utilisateur connecté avec des informations de session
      const mockSessionInfo: SessionInformation = {
        token: 'test-token-123',
        type: 'Bearer',
        id: 1,
        username: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      // Connecter l'utilisateur
      sessionService.logIn(mockSessionInfo);

      // Faire une requête HTTP
      httpClient.get('/api/test').subscribe();

      // Vérifier que la requête contient l'en-tête Authorization
      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBeTruthy();
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');

      req.flush({ data: 'test' });
    });

    it('should not add Authorization header when user is not logged in', () => {
      // S'assurer que l'utilisateur n'est pas connecté
      sessionService.logOut();

      // Faire une requête HTTP
      httpClient.get('/api/test').subscribe();

      // Vérifier que la requête ne contient pas l'en-tête Authorization
      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBeFalsy();

      req.flush({ data: 'test' });
    });

    it('should add correct Authorization header for admin user', () => {
      // Simuler un utilisateur administrateur connecté
      const mockAdminSessionInfo: SessionInformation = {
        token: 'admin-token-456',
        type: 'Bearer',
        id: 2,
        username: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true
      };

      sessionService.logIn(mockAdminSessionInfo);

      httpClient.post('/api/admin/test', { data: 'admin data' }).subscribe();

      const req = httpMock.expectOne('/api/admin/test');
      expect(req.request.headers.has('Authorization')).toBeTruthy();
      expect(req.request.headers.get('Authorization')).toBe('Bearer admin-token-456');

      req.flush({ success: true });
    });

    it('should handle multiple requests with different login states', () => {
      const mockSessionInfo: SessionInformation = {
        token: 'test-token-789',
        type: 'Bearer',
        id: 3,
        username: 'user@test.com',
        firstName: 'Test',
        lastName: 'User',
        admin: false
      };

      // Première requête sans être connecté
      httpClient.get('/api/test1').subscribe();
      let req = httpMock.expectOne('/api/test1');
      expect(req.request.headers.has('Authorization')).toBeFalsy();
      req.flush({ data: 'test1' });

      // Se connecter
      sessionService.logIn(mockSessionInfo);

      // Deuxième requête avec utilisateur connecté
      httpClient.get('/api/test2').subscribe();
      req = httpMock.expectOne('/api/test2');
      expect(req.request.headers.has('Authorization')).toBeTruthy();
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-789');
      req.flush({ data: 'test2' });

      // Se déconnecter
      sessionService.logOut();

      // Troisième requête après déconnexion
      httpClient.get('/api/test3').subscribe();
      req = httpMock.expectOne('/api/test3');
      expect(req.request.headers.has('Authorization')).toBeFalsy();
      req.flush({ data: 'test3' });
    });

    it('should preserve existing headers when adding Authorization', () => {
      const mockSessionInfo: SessionInformation = {
        token: 'preserve-token',
        type: 'Bearer',
        id: 4,
        username: 'preserve@test.com',
        firstName: 'Preserve',
        lastName: 'User',
        admin: false
      };

      sessionService.logIn(mockSessionInfo);

      // Faire une requête avec un en-tête personnalisé
      httpClient.get('/api/test', {
        headers: {
          'Custom-Header': 'custom-value',
          'Content-Type': 'application/json'
        }
      }).subscribe();

      const req = httpMock.expectOne('/api/test');
      
      // Vérifier que tous les en-têtes sont présents
      expect(req.request.headers.has('Authorization')).toBeTruthy();
      expect(req.request.headers.get('Authorization')).toBe('Bearer preserve-token');
      expect(req.request.headers.has('Custom-Header')).toBeTruthy();
      expect(req.request.headers.get('Custom-Header')).toBe('custom-value');
      expect(req.request.headers.has('Content-Type')).toBeTruthy();
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      req.flush({ data: 'test' });
    });

    it('should work with different HTTP methods', () => {
      const mockSessionInfo: SessionInformation = {
        token: 'method-token',
        type: 'Bearer',
        id: 5,
        username: 'method@test.com',
        firstName: 'Method',
        lastName: 'User',
        admin: false
      };

      sessionService.logIn(mockSessionInfo);

      // Test GET
      httpClient.get('/api/get').subscribe();
      let req = httpMock.expectOne('/api/get');
      expect(req.request.headers.get('Authorization')).toBe('Bearer method-token');
      req.flush({});

      // Test POST
      httpClient.post('/api/post', {}).subscribe();
      req = httpMock.expectOne('/api/post');
      expect(req.request.headers.get('Authorization')).toBe('Bearer method-token');
      req.flush({});

      // Test PUT
      httpClient.put('/api/put', {}).subscribe();
      req = httpMock.expectOne('/api/put');
      expect(req.request.headers.get('Authorization')).toBe('Bearer method-token');
      req.flush({});

      // Test DELETE
      httpClient.delete('/api/delete').subscribe();
      req = httpMock.expectOne('/api/delete');
      expect(req.request.headers.get('Authorization')).toBe('Bearer method-token');
      req.flush({});
    });
  });
});