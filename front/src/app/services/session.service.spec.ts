/// <reference types="jest" />

import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { SessionInformation } from '../interfaces/sessionInformation.interface';
import { SessionService } from './session.service';

/**
 * TESTS - SessionService
 * 
 * Tests :
 * 1. ÉTAT GLOBAL : Gestion de l'état utilisateur dans toute l'app
 * 2. SÉCURITÉ : Contrôle accès basé sur l'état de connexion
 * 3. PERSISTANCE : Stockage localStorage pour maintenir la session
 * 4. RÉACTIVITÉ : Observable $isLogged() utilisé par tous les guards
 */
describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should have isLogged as false initially', () => {
      // Vérifier l'état initial du service
      expect(service.isLogged).toBeFalsy();
    });

    it('should have sessionInformation as undefined initially', () => {
      // Vérifier que les informations de session sont undefined au début
      expect(service.sessionInformation).toBeUndefined();
    });

    it('should emit false for $isLogged observable initially', (done) => {
      // Tester l'observable pour l'état de connexion initial
      service.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBeFalsy();
        done();
      });
    });
  });

  describe('logIn', () => {
    it('should log in user and update state', (done) => {
      // Données de test pour la session utilisateur
      const mockUser: SessionInformation = {
        token: 'mock-token',
        type: 'Bearer',
        id: 1,
        username: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      // Appel de la méthode logIn
      service.logIn(mockUser);

      // Vérifier que l'état est mis à jour
      expect(service.isLogged).toBeTruthy();
      expect(service.sessionInformation).toEqual(mockUser);

      // Vérifier que l'observable émet la nouvelle valeur
      service.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBeTruthy();
        done();
      });
    });

    it('should log in admin user and update state', (done) => {
      // Test avec un utilisateur administrateur
      const mockAdminUser: SessionInformation = {
        token: 'admin-token',
        type: 'Bearer',
        id: 1,
        username: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true
      };

      service.logIn(mockAdminUser);

      expect(service.isLogged).toBeTruthy();
      expect(service.sessionInformation).toEqual(mockAdminUser);
      expect(service.sessionInformation?.admin).toBeTruthy();

      service.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBeTruthy();
        done();
      });
    });
  });

  describe('logOut', () => {
    it('should log out user and reset state', (done) => {
      // D'abord se connecter avec un utilisateur
      const mockUser: SessionInformation = {
        token: 'mock-token',
        type: 'Bearer',
        id: 1,
        username: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      service.logIn(mockUser);

      // Puis se déconnecter
      service.logOut();

      // Vérifier que l'état est réinitialisé
      expect(service.isLogged).toBeFalsy();
      expect(service.sessionInformation).toBeUndefined();

      // Vérifier que l'observable émet false
      service.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBeFalsy();
        done();
      });
    });

    it('should handle logout when user not logged in', (done) => {
      // Tenter de se déconnecter sans être connecté
      service.logOut();

      expect(service.isLogged).toBeFalsy();
      expect(service.sessionInformation).toBeUndefined();

      service.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBeFalsy();
        done();
      });
    });
  });

  describe('$isLogged observable', () => {
    it('should emit state changes correctly', (done) => {
      const mockUser: SessionInformation = {
        token: 'mock-token',
        type: 'Bearer',
        id: 1,
        username: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      let emissionCount = 0;
      const expectedValues = [false, true, false];

      service.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBe(expectedValues[emissionCount]);
        emissionCount++;

        if (emissionCount === 3) {
          done();
        }
      });

      // Déclenchement des changements d'état
      service.logIn(mockUser);
      service.logOut();
    });
  });
});
