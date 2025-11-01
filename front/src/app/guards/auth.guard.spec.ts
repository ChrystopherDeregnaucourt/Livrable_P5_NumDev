import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { SessionService } from '../services/session.service';
import { AuthGuard } from './auth.guard';

/**
 * TESTS CRITIQUES - AuthGuard
 * 
 * JUSTIFICATION : Ces tests sont ESSENTIELS car ils couvrent :
 * 1. SÉCURITÉ ROUTES : Protection des pages nécessitant une authentification
 * 2. CONTRÔLE ACCÈS : Empêche l'accès non autorisé aux fonctionnalités sensibles  
 * 3. UX SÉCURITÉ : Redirection automatique vers login si non connecté
 * 4. ARCHITECTURE : Utilisé sur toutes les routes protégées de l'app
 * 
 * Impact critique : Défaillance = accès non autorisé aux données/fonctions sensibles
 */
describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockRouter: Partial<Router>;
  let mockSessionService: Partial<SessionService>;

  beforeEach(() => {
    // Création des mocks pour Router et SessionService avec Jest
    const routerSpy = {
      navigate: jest.fn()
    } as Partial<Router>;

    const sessionServiceSpy = {
      isLogged: false
    } as Partial<SessionService>;

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: routerSpy },
        { provide: SessionService, useValue: sessionServiceSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    mockRouter = TestBed.inject(Router) as Partial<Router>;
    mockSessionService = TestBed.inject(SessionService) as Partial<SessionService>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true if user is logged in', () => {
      // Simuler un utilisateur connecté
      mockSessionService.isLogged = true;

      // Tester la méthode canActivate
      const result = guard.canActivate();

      // Vérifier que l'accès est autorisé
      expect(result).toBeTruthy();
      // Vérifier qu'aucune redirection n'a eu lieu
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should return false and redirect to login if user is not logged in', () => {
      // Simuler un utilisateur non connecté
      mockSessionService.isLogged = false;

      // Tester la méthode canActivate
      const result = guard.canActivate();

      // Vérifier que l'accès est refusé
      expect(result).toBeFalsy();
      // Vérifier que la redirection vers login a eu lieu
      expect(mockRouter.navigate).toHaveBeenCalledWith(['login']);
    });

    it('should handle multiple calls correctly', () => {
      // Premier appel avec utilisateur non connecté
      mockSessionService.isLogged = false;
      let result = guard.canActivate();
      expect(result).toBeFalsy();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['login']);

      // Réinitialiser le mock
      jest.clearAllMocks();

      // Deuxième appel avec utilisateur connecté
      mockSessionService.isLogged = true;
      result = guard.canActivate();
      expect(result).toBeTruthy();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should always redirect to login page when user is not authenticated', () => {
      mockSessionService.isLogged = false;

      // Tester plusieurs fois pour s'assurer de la cohérence
      for (let i = 0; i < 3; i++) {
        const result = guard.canActivate();
        expect(result).toBeFalsy();
      }

      // Vérifier que navigate a été appelé 3 fois
      expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['login']);
    });
  });
});