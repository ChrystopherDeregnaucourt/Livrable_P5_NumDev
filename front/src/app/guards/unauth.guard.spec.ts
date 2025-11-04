/// <reference types="jest" />

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { UnauthGuard } from './unauth.guard';

/**
 * Tests du guard UnauthGuard - Protection des routes publiques
 *
 * RÔLE : Empêche les utilisateurs CONNECTÉS d'accéder aux pages publiques (login, register)
 * 
 * SCÉNARIOS TESTÉS :
 * - Utilisateur non connecté → peut accéder à login/register
 * - Utilisateur connecté → redirigé automatiquement vers /rentals (liste des sessions)
 * - Changement d'état de session (déconnexion/connexion)
 * 
 */

describe('UnauthGuard', () => {
  let guard: UnauthGuard;
  let mockRouter: jest.Mocked<Partial<Router>>;
  let mockSessionService: Partial<SessionService>;

  beforeEach(() => {
    // Mock Router
    mockRouter = {
      navigate: jest.fn()
    } as jest.Mocked<Partial<Router>>;

    // Mock SessionService
    mockSessionService = {
      isLogged: false
    };

    TestBed.configureTestingModule({
      providers: [
        UnauthGuard,
        { provide: Router, useValue: mockRouter },
        { provide: SessionService, useValue: mockSessionService }
      ]
    });
    
    guard = TestBed.inject(UnauthGuard);
  });

  // Test de création du guard
  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  //Tests de la méthode canActivate
  describe('canActivate', () => {

    // Utilisateur NON connecté peut accéder aux pages publiques
    it('should return true if user is NOT logged in', () => {
      // Arrange
      mockSessionService.isLogged = false;

      // Act
      const result = guard.canActivate();

      // Assert
      expect(result).toBeTruthy();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    // Utilisateur CONNECTÉ ne peut PAS accéder aux pages publiques
    it('should return false and redirect to rentals if user IS logged in', () => {
      // Arrange
      mockSessionService.isLogged = true;

      // Act
      const result = guard.canActivate();

      // Assert
      expect(result).toBeFalsy();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['rentals']);
    });

    // Page de login accessible seulement si non connecté
    it('should allow access to login page when user is not authenticated', () => {
      // Arrange
      mockSessionService.isLogged = false;

      // Act
      const canAccessLogin = guard.canActivate();

      // Assert
      expect(canAccessLogin).toBeTruthy();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    // Utilisateur déjà connecté ne doit pas voir la page login
    it('should block access to login page when user is already authenticated', () => {
      // Arrange
      mockSessionService.isLogged = true;

      // Act
      const canAccessLogin = guard.canActivate();

      // Assert
      expect(canAccessLogin).toBeFalsy();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['rentals']);
    });

    /**
     * Changement d'état de session
     * Valide que le guard réagit correctement aux changements d'état utilisateur
     */
    it('should handle state change from logged out to logged in', () => {
      // Phase 1: Utilisateur non connecté
      // Arrange
      mockSessionService.isLogged = false;

      // Act
      let result = guard.canActivate();

      // Assert
      expect(result).toBeTruthy();
      expect(mockRouter.navigate).not.toHaveBeenCalled();

      // Phase 2: Utilisateur se connecte
      // Arrange
      jest.clearAllMocks();
      mockSessionService.isLogged = true;

      // Act
      result = guard.canActivate();

      // Assert
      expect(result).toBeFalsy();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['rentals']);
    });

    //Appels multiples du guard
    it('should consistently redirect authenticated users', () => {
      // Arrange
      mockSessionService.isLogged = true;

      // Act - tester plusieurs fois
      for (let i = 0; i < 3; i++) {
        const result = guard.canActivate();
        expect(result).toBeFalsy();
      }

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['rentals']);
    });
  });
});
