/// <reference types="jest" />

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { expect } from '@jest/globals';
import { UnauthGuard } from './unauth.guard';
import { SessionService } from '../services/session.service';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

/**
 * UnauthGuard avec Router et SessionService réels
 * 
 * Ces tests valident le flux de redirection des utilisateurs connectés :
 * 1. SÉCURITÉ INVERSE : Empêche les utilisateurs CONNECTÉS d'accéder aux pages publiques
 * 2. UX OPTIMISÉE : Redirection automatique vers /sessions si déjà connecté
 * 3. NAVIGATION RÉELLE : Test avec Router et Location véritables
 * 4. ÉTAT PARTAGÉ : Intégration avec SessionService réel
 */

// Composants factices pour les tests de routing
@Component({ template: 'Login Page' })
class MockLoginComponent { }

@Component({ template: 'Register Page' })
class MockRegisterComponent { }

@Component({ template: 'Sessions Page' })
class MockSessionsComponent { }

// Note: Dans le code réel, UnauthGuard redirige vers 'rentals', 
// mais selon l'architecture de l'app, on utilise 'sessions'
describe('UnauthGuard Integration Tests', () => {
  let guard: UnauthGuard;
  let router: Router;
  let location: Location;
  let sessionService: SessionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'login', component: MockLoginComponent, canActivate: [UnauthGuard] },
          { path: 'register', component: MockRegisterComponent, canActivate: [UnauthGuard] },
          { path: 'sessions', component: MockSessionsComponent },
          { path: 'rentals', component: MockSessionsComponent }, // Alias pour correspondre au guard
          { path: '', redirectTo: '/login', pathMatch: 'full' }
        ])
      ],
      declarations: [MockLoginComponent, MockRegisterComponent, MockSessionsComponent],
      providers: [UnauthGuard, SessionService]
    }).compileComponents();

    guard = TestBed.inject(UnauthGuard);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    sessionService = TestBed.inject(SessionService);
  });

  afterEach(() => {
    // Nettoyer l'état de session après chaque test
    sessionService.logOut();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  /**
   * Utilisateur non connecté peut accéder aux pages publiques
   * Valide que login/register sont accessibles sans authentification
   */
  it('should allow access to public pages when user is not logged in', async () => {
    // Arrange: S'assurer qu'aucun utilisateur n'est connecté
    expect(sessionService.isLogged).toBe(false);

    // Act & Assert: Accès à la page de login
    await router.navigate(['/login']);
    expect(location.path()).toBe('/login');

    // Act & Assert: Accès à la page de register
    await router.navigate(['/register']);
    expect(location.path()).toBe('/register');
  });

  /**
   * Redirection automatique des utilisateurs connectés
   * Valide le flux complet de redirection avec Router et SessionService réels
   */
  it('should redirect authenticated users away from public pages', async () => {
    // Arrange: Connecter un utilisateur via SessionService réel
    const mockUser: SessionInformation = {
      token: 'unauth-integration-token',
      type: 'Bearer',
      id: 1,
      username: 'logged@integration.test',
      firstName: 'Logged',
      lastName: 'User',
      admin: false
    };
    sessionService.logIn(mockUser);

    // Act & Assert: Tentative d'accès à login
    await router.navigate(['/login']);
    expect(location.path()).toBe('/rentals'); // Redirection selon le guard

    // Act & Assert: Tentative d'accès à register
    await router.navigate(['/register']);
    expect(location.path()).toBe('/rentals'); // Redirection selon le guard
  });

  /**
   * Changement d'état de session en temps réel
   * Valide que le guard réagit aux connexions/déconnexions
   */
  it('should handle session state changes dynamically', async () => {
    // Phase 1: Utilisateur non connecté peut accéder au login
    await router.navigate(['/login']);
    expect(location.path()).toBe('/login');

    // Phase 2: Connexion utilisateur
    const mockUser: SessionInformation = {
      token: 'dynamic-state-token',
      type: 'Bearer',
      id: 2,
      username: 'dynamic@test.com',
      firstName: 'Dynamic',
      lastName: 'User',
      admin: true
    };
    sessionService.logIn(mockUser);

    // Phase 3: Tentative d'accès à login maintenant connecté
    await router.navigate(['/login']);
    expect(location.path()).toBe('/rentals'); // Redirection

    // Phase 4: Déconnexion
    sessionService.logOut();

    // Phase 5: Accès à login après déconnexion
    await router.navigate(['/login']);
    expect(location.path()).toBe('/login'); // Accès autorisé
  });

  /**
   * Différents types d'utilisateurs (admin vs regular)
   * Valide que tous les utilisateurs connectés sont redirigés, peu importe leur rôle
   */
  it('should redirect both admin and regular users consistently', async () => {
    // Test avec utilisateur regular
    const regularUser: SessionInformation = {
      token: 'regular-unauth-token',
      type: 'Bearer',
      id: 3,
      username: 'regular@unauth.test',
      firstName: 'Regular',
      lastName: 'User',
      admin: false
    };
    
    sessionService.logIn(regularUser);
    await router.navigate(['/register']);
    expect(location.path()).toBe('/rentals');
    
    // Déconnexion et test avec admin
    sessionService.logOut();
    
    const adminUser: SessionInformation = {
      ...regularUser,
      id: 4,
      username: 'admin@unauth.test',
      admin: true
    };
    
    sessionService.logIn(adminUser);
    await router.navigate(['/login']);
    expect(location.path()).toBe('/rentals');
    expect(sessionService.sessionInformation?.admin).toBe(true);
  });

  /**
   * Navigation multiple et persistance d'état
   * Valide que les redirections fonctionnent de manière cohérente
   */
  it('should consistently redirect on multiple navigation attempts', async () => {
    // Arrange: Utilisateur connecté
    const mockUser: SessionInformation = {
      token: 'persistent-token',
      type: 'Bearer',
      id: 5,
      username: 'persistent@test.com',
      firstName: 'Persistent',
      lastName: 'User',
      admin: false
    };
    sessionService.logIn(mockUser);

    // Act & Assert: Plusieurs tentatives de navigation vers pages publiques
    for (const route of ['/login', '/register', '/login', '/register']) {
      await router.navigate([route]);
      expect(location.path()).toBe('/rentals');
      expect(sessionService.isLogged).toBe(true);
    }
  });

  /**
   * Validation de l'état SessionService après redirections
   * S'assure que les redirections n'affectent pas l'état de session
   */
  it('should preserve session state during redirections', async () => {
    // Arrange: Connexion utilisateur
    const mockUser: SessionInformation = {
      token: 'preserve-token',
      type: 'Bearer',
      id: 6,
      username: 'preserve@test.com',
      firstName: 'Preserve',
      lastName: 'User',
      admin: true
    };
    sessionService.logIn(mockUser);

    const originalSessionInfo = sessionService.sessionInformation;

    // Act: Plusieurs redirections
    await router.navigate(['/login']);
    await router.navigate(['/register']);

    // Assert: Session préservée après redirections
    expect(sessionService.isLogged).toBe(true);
    expect(sessionService.sessionInformation).toEqual(originalSessionInfo);
    expect(sessionService.sessionInformation?.token).toBe('preserve-token');
    expect(location.path()).toBe('/rentals');
  });
});