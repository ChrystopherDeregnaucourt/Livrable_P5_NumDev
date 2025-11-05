/// <reference types="jest" />

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { LoginRequest } from '../interfaces/loginRequest.interface';
import { RegisterRequest } from '../interfaces/registerRequest.interface';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { AuthService } from './auth.service';

/**
 * Ces tests couvrent :
 * 1. SÉCURITÉ : Authentification = point d'entrée sécurité de l'app
 * 2. MÉTIER : Login/Register = fonctions business critiques  
 * 3. IMPACT : Échec auth = application inutilisable
 */

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Vérifier qu'aucune requête HTTP n'est en attente
    httpMock.verify();
  });

  it('should be created', () => {
    // Test de base pour vérifier que le service est créé correctement
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register a new user successfully', () => {
      // Données de test pour l'inscription
      const mockRegisterRequest: RegisterRequest = {
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      // Appel de la méthode register
      service.register(mockRegisterRequest).subscribe(response => {
        // Vérifier que la réponse est vide (void)
        expect(response).toBeUndefined();
      });

      // Vérifier qu'une requête POST a été faite avec les bonnes données
      const req = httpMock.expectOne('api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterRequest);
      
      // Simuler une réponse réussie
      req.flush(null);
    });

    it('should handle registration error - email already exists', () => {
      const mockRegisterRequest: RegisterRequest = {
        email: 'existing@test.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      service.register(mockRegisterRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('api/auth/register');
      expect(req.request.method).toBe('POST');
      
      // Simuler une erreur 400 (Bad Request)
      req.flush('Email already exists', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle registration with invalid data', () => {
      const mockRegisterRequest: RegisterRequest = {
        email: 'invalid-email',
        firstName: '',
        lastName: '',
        password: '123'
      };

      service.register(mockRegisterRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(422);
        }
      });

      const req = httpMock.expectOne('api/auth/register');
      expect(req.request.method).toBe('POST');
      req.flush('Validation error', { status: 422, statusText: 'Unprocessable Entity' });
    });
  });

  describe('login', () => {
    it('should login user successfully', () => {
      // Données de test pour la connexion
      const mockLoginRequest: LoginRequest = {
        email: 'test@test.com',
        password: 'password123'
      };

      // Réponse attendue du serveur
      const mockSessionInformation: SessionInformation = {
        token: 'mock-token',
        type: 'Bearer',
        id: 1,
        username: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      // Appel de la méthode login
      service.login(mockLoginRequest).subscribe(response => {
        // Vérifier que la réponse correspond aux données attendues
        expect(response).toEqual(mockSessionInformation);
        expect(response.token).toBe('mock-token');
        expect(response.admin).toBeFalsy();
      });

      // Vérifier qu'une requête POST a été faite avec les bonnes données
      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginRequest);
      
      // Simuler une réponse réussie avec les informations de session
      req.flush(mockSessionInformation);
    });

    it('should login admin user successfully', () => {
      // Test avec un utilisateur administrateur
      const mockLoginRequest: LoginRequest = {
        email: 'admin@test.com',
        password: 'adminpass'
      };

      const mockAdminSessionInformation: SessionInformation = {
        token: 'admin-token',
        type: 'Bearer',
        id: 2,
        username: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true
      };

      service.login(mockLoginRequest).subscribe(response => {
        expect(response).toEqual(mockAdminSessionInformation);
        expect(response.admin).toBeTruthy();
      });

      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockAdminSessionInformation);
    });

    it('should handle login error - invalid credentials', () => {
      const mockLoginRequest: LoginRequest = {
        email: 'test@test.com',
        password: 'wrongpassword'
      };

      service.login(mockLoginRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');
      
      // Simuler une erreur 401 (Unauthorized)
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle login error - user not found', () => {
      const mockLoginRequest: LoginRequest = {
        email: 'nonexistent@test.com',
        password: 'password123'
      };

      service.login(mockLoginRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush('User not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle empty login request', () => {
      const mockLoginRequest: LoginRequest = {
        email: '',
        password: ''
      };

      service.login(mockLoginRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
  });
});