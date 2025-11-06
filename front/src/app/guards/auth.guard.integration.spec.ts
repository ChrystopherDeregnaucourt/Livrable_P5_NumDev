/// <reference types="jest" />

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { expect } from '@jest/globals';
import { AuthGuard } from './auth.guard';
import { SessionService } from '../services/session.service';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

/**
 * AuthGuard avec Router et SessionService réels
 * 
 * Ces tests valident le flux complet de sécurité de l'application :
 * 1. SÉCURITÉ CRITIQUE : Protection des routes nécessitant une authentification
 * 2. NAVIGATION RÉELLE : Test avec Router et Location véritables (pas de mocks)
 * 3. ÉTAT GLOBAL : Intégration avec SessionService réel pour l'état utilisateur
 * 4. UX SÉCURITÉ : Redirection automatique vers login si non connecté
 */

// Composants factices pour les tests de routing
@Component({ template: 'Login Page' })
class MockLoginComponent { }

@Component({ template: 'Sessions Page' })
class MockSessionsComponent { }

@Component({ template: 'Protected Page' })
class MockProtectedComponent { }

describe('AuthGuard Integration Tests', () => {
  let guard: AuthGuard;
  let router: Router;
  let location: Location;
  let sessionService: SessionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'login', component: MockLoginComponent },
          { path: 'sessions', component: MockSessionsComponent, canActivate: [AuthGuard] },
          { path: 'protected', component: MockProtectedComponent, canActivate: [AuthGuard] },
          { path: '', redirectTo: '/sessions', pathMatch: 'full' }
        ])
      ],
      declarations: [MockLoginComponent, MockSessionsComponent, MockProtectedComponent],
      providers: [AuthGuard, SessionService]
    }).compileComponents();

    guard = TestBed.inject(AuthGuard);
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
   * Utilisateur authentifié peut accéder aux routes protégées
   * Valide que la navigation fonctionne correctement avec une session active
   */
  it('should allow navigation to protected routes when user is logged in', async () => {
    // Arrange: Connecter un utilisateur via SessionService réel
    const mockUser: SessionInformation = {
      token: 'integration-token',
      type: 'Bearer',
      id: 1,
      username: 'user@integration.test',
      firstName: 'Integration',
      lastName: 'User',
      admin: false
    };
    sessionService.logIn(mockUser);

    // Act: Naviguer vers une route protégée
    await router.navigate(['/sessions']);

    // Assert: La navigation a réussi, pas de redirection vers login
    expect(location.path()).toBe('/sessions');
    expect(sessionService.isLogged).toBe(true);
  });

  /**
   * Redirection automatique vers login pour utilisateur non authentifié
   * Valide le flux complet de sécurité avec Router et Location réels
   */
  it('should redirect to login when accessing protected route without authentication', async () => {
    // Arrange: S'assurer qu'aucun utilisateur n'est connecté
    expect(sessionService.isLogged).toBe(false);

    // Act: Tenter de naviguer vers une route protégée
    await router.navigate(['/sessions']);

    // Assert: Redirection automatique vers login
    expect(location.path()).toBe('/login');
    expect(sessionService.isLogged).toBe(false);
  });

  /**
   * Navigation vers plusieurs routes protégées
   * Valide que le guard fonctionne sur différentes routes
   */
  it('should protect multiple routes consistently', async () => {
    // Arrange: Utilisateur non connecté
    expect(sessionService.isLogged).toBe(false);

    // Act & Assert: Tester différentes routes protégées
    await router.navigate(['/sessions']);
    expect(location.path()).toBe('/login');

    await router.navigate(['/protected']);
    expect(location.path()).toBe('/login');
  });

  /**
   * Changement d'état de session en temps réel
   * Valide que le guard réagit aux changements d'état du SessionService
   */
  it('should handle session state changes during navigation', async () => {
    // Phase 1: Navigation sans authentification
    await router.navigate(['/sessions']);
    expect(location.path()).toBe('/login');

    // Phase 2: Connexion utilisateur
    const mockUser: SessionInformation = {
      token: 'state-change-token',
      type: 'Bearer',
      id: 2,
      username: 'statechange@test.com',
      firstName: 'State',
      lastName: 'Change',
      admin: true
    };
    sessionService.logIn(mockUser);

    // Phase 3: Nouvelle tentative de navigation
    await router.navigate(['/sessions']);
    expect(location.path()).toBe('/sessions');
    expect(sessionService.sessionInformation?.admin).toBe(true);
  });

  /**
   * Persistance de l'état après logout
   * Valide que la déconnexion bloque bien l'accès aux routes protégées
   */
  it('should block access after logout', async () => {
    // Phase 1: Connexion et navigation réussie
    const mockUser: SessionInformation = {
      token: 'logout-test-token',
      type: 'Bearer',
      id: 3,
      username: 'logout@test.com',
      firstName: 'Logout',
      lastName: 'Test',
      admin: false
    };
    sessionService.logIn(mockUser);
    await router.navigate(['/sessions']);
    expect(location.path()).toBe('/sessions');

    // Phase 2: Déconnexion
    sessionService.logOut();

    // Phase 3: Tentative de navigation vers route protégée
    await router.navigate(['/protected']);
    expect(location.path()).toBe('/login');
    expect(sessionService.isLogged).toBe(false);
  });

  /**
   * Validation avec différents types d'utilisateurs
   * Teste que admin et utilisateurs normaux peuvent tous deux accéder aux routes protégées
   */
  it('should allow access for both admin and regular users', async () => {
    // Test avec utilisateur normal
    const regularUser: SessionInformation = {
      token: 'regular-token',
      type: 'Bearer',
      id: 4,
      username: 'regular@test.com',
      firstName: 'Regular',
      lastName: 'User',
      admin: false
    };
    
    sessionService.logIn(regularUser);
    await router.navigate(['/sessions']);
    expect(location.path()).toBe('/sessions');
    
    // Logout et test avec admin
    sessionService.logOut();
    
    const adminUser: SessionInformation = {
      ...regularUser,
      id: 5,
      username: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      admin: true
    };
    
    sessionService.logIn(adminUser);
    await router.navigate(['/protected']);
    expect(location.path()).toBe('/protected');
    expect(sessionService.sessionInformation?.admin).toBe(true);
  });
});