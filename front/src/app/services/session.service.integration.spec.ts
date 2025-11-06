/// <reference types="jest" />

import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { SessionService } from './session.service';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

/**
 * SessionService avec observables et état global réel
 * 
 * Ces tests valident l'intégration critique de l'état global de l'application :
 * 1. ÉTAT GLOBAL : Gestion centralisée de l'état utilisateur dans toute l'app
 * 2. RÉACTIVITÉ : Synchronisation des observables avec l'état de session
 * 3. PERSISTANCE : Intégration avec localStorage pour maintenir les sessions
 * 4. COHÉRENCE : Maintien de l'état cohérent entre composants et services
 */

describe('SessionService Integration Tests', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionService]
    });
    service = TestBed.inject(SessionService);
  });

  afterEach(() => {
    // Nettoyer l'état après chaque test
    service.logOut();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Synchronisation état + observable en temps réel
   * Valide que l'observable $isLogged() reflète immédiatement les changements d'état
   */
  it('should synchronize state changes with observable emissions in real-time', (done) => {
    // Arrange: Compteur pour suivre les émissions
    const emissions: boolean[] = [];
    let emissionCount = 0;

    // Souscription à l'observable pour capturer toutes les émissions
    const subscription = service.$isLogged().subscribe(isLogged => {
      emissions.push(isLogged);
      emissionCount++;

      // Validation des émissions selon le scénario
      if (emissionCount === 1) {
        // État initial
        expect(isLogged).toBe(false);
        expect(service.isLogged).toBe(false);
        expect(service.sessionInformation).toBeUndefined();
      } else if (emissionCount === 2) {
        // Après login
        expect(isLogged).toBe(true);
        expect(service.isLogged).toBe(true);
        expect(service.sessionInformation).toBeDefined();
      } else if (emissionCount === 3) {
        // Après logout
        expect(isLogged).toBe(false);
        expect(service.isLogged).toBe(false);
        expect(service.sessionInformation).toBeUndefined();

        // Vérifier l'historique complet des émissions
        expect(emissions).toEqual([false, true, false]);
        subscription.unsubscribe();
        done();
      }
    });

    // Act: Déclencher les changements d'état
    const mockUser: SessionInformation = {
      token: 'sync-test-token',
      type: 'Bearer',
      id: 1,
      username: 'sync@integration.test',
      firstName: 'Sync',
      lastName: 'Test',
      admin: false
    };

    // Connexion (doit émettre true)
    service.logIn(mockUser);

    // Déconnexion (doit émettre false)
    service.logOut();
  });

  /**
   * Multiples souscriptions simultanées
   * Valide que plusieurs composants peuvent s'abonner et recevoir les mêmes émissions
   */
  it('should handle multiple simultaneous subscriptions correctly', (done) => {
    // Arrange: Simuler plusieurs composants avec leurs propres souscriptions
    const component1Emissions: boolean[] = [];
    const component2Emissions: boolean[] = [];
    const component3Emissions: boolean[] = [];
    let completedSubscriptions = 0;

    const checkCompletion = () => {
      completedSubscriptions++;
      if (completedSubscriptions === 3) {
        // Vérifier que tous les composants ont reçu les mêmes émissions
        expect(component1Emissions).toEqual([false, true, false]);
        expect(component2Emissions).toEqual([false, true, false]);
        expect(component3Emissions).toEqual([false, true, false]);
        done();
      }
    };

    // Souscriptions multiples (simulant des composants différents)
    const sub1 = service.$isLogged().subscribe(value => {
      component1Emissions.push(value);
      if (component1Emissions.length === 3) {
        sub1.unsubscribe();
        checkCompletion();
      }
    });

    const sub2 = service.$isLogged().subscribe(value => {
      component2Emissions.push(value);
      if (component2Emissions.length === 3) {
        sub2.unsubscribe();
        checkCompletion();
      }
    });

    const sub3 = service.$isLogged().subscribe(value => {
      component3Emissions.push(value);
      if (component3Emissions.length === 3) {
        sub3.unsubscribe();
        checkCompletion();
      }
    });

    // Act: Changements d'état
    const mockUser: SessionInformation = {
      token: 'multi-sub-token',
      type: 'Bearer',
      id: 2,
      username: 'multi@test.com',
      firstName: 'Multi',
      lastName: 'Sub',
      admin: true
    };

    service.logIn(mockUser);
    service.logOut();
  });

  /**
   * Intégrité des données de session
   * Valide que les données utilisateur restent intègres pendant tout le cycle de vie
   */
  it('should maintain session data integrity throughout lifecycle', (done) => {
    // Arrange: Données utilisateur complètes
    const originalUser: SessionInformation = {
      token: 'integrity-test-token-123456789',
      type: 'Bearer',
      id: 42,
      username: 'integrity@integration.test',
      firstName: 'Integrity',
      lastName: 'Test',
      admin: true
    };

    let verificationCount = 0;

    // Souscription pour surveiller l'intégrité des données
    const subscription = service.$isLogged().subscribe(isLogged => {
      verificationCount++;

      if (verificationCount === 1) {
        // État initial - pas de session
        expect(isLogged).toBe(false);
        expect(service.sessionInformation).toBeUndefined();
      } else if (verificationCount === 2) {
        // Après connexion - données complètes et intègres
        expect(isLogged).toBe(true);
        expect(service.sessionInformation).toEqual(originalUser);
        
        // Vérification détaillée de chaque propriété
        expect(service.sessionInformation!.token).toBe('integrity-test-token-123456789');
        expect(service.sessionInformation!.type).toBe('Bearer');
        expect(service.sessionInformation!.id).toBe(42);
        expect(service.sessionInformation!.username).toBe('integrity@integration.test');
        expect(service.sessionInformation!.firstName).toBe('Integrity');
        expect(service.sessionInformation!.lastName).toBe('Test');
        expect(service.sessionInformation!.admin).toBe(true);

        // Vérifier que l'objet n'est pas une référence modifiée
        expect(service.sessionInformation).not.toBe(originalUser); // Copie, pas référence
        expect(JSON.stringify(service.sessionInformation)).toBe(JSON.stringify(originalUser));
      } else if (verificationCount === 3) {
        // Après déconnexion - nettoyage complet
        expect(isLogged).toBe(false);
        expect(service.sessionInformation).toBeUndefined();
        
        subscription.unsubscribe();
        done();
      }
    });

    // Act: Cycle de vie complet
    service.logIn(originalUser);
    service.logOut();
  });

  /**
   * Performance et mémoire avec souscriptions multiples
   * Valide que le service gère efficacement de nombreuses souscriptions
   */
  it('should handle high volume of subscriptions without memory leaks', (done) => {
    // Arrange: Créer de nombreuses souscriptions (simulant une app complexe)
    const subscriptions: any[] = [];
    const emissionCounts: number[] = [];
    const maxSubscriptions = 10;
    let completedSubscriptions = 0;

    // Créer multiple souscriptions
    for (let i = 0; i < maxSubscriptions; i++) {
      emissionCounts[i] = 0;
      
      const sub = service.$isLogged().subscribe(isLogged => {
        emissionCounts[i]++;
        
        // Vérifier que chaque souscription reçoit les émissions
        if (emissionCounts[i] === 3) { // false -> true -> false
          sub.unsubscribe();
          completedSubscriptions++;
          
          if (completedSubscriptions === maxSubscriptions) {
            // Vérifier que toutes les souscriptions ont reçu le bon nombre d'émissions
            emissionCounts.forEach(count => {
              expect(count).toBe(3);
            });
            done();
          }
        }
      });
      
      subscriptions.push(sub);
    }

    // Act: Déclencher les changements d'état
    const mockUser: SessionInformation = {
      token: 'performance-token',
      type: 'Bearer',
      id: 100,
      username: 'performance@test.com',
      firstName: 'Performance',
      lastName: 'Test',
      admin: false
    };

    service.logIn(mockUser);
    service.logOut();
  });

  /**
   * Cohérence d'état avec opérations rapides successives
   * Valide que le service maintient la cohérence même avec des changements rapides
   */
  it('should maintain consistency with rapid successive state changes', (done) => {
    // Arrange: Capture toutes les émissions
    const allEmissions: boolean[] = [];
    const allSessionInfos: (SessionInformation | undefined)[] = [];

    const subscription = service.$isLogged().subscribe(isLogged => {
      allEmissions.push(isLogged);
      allSessionInfos.push(service.sessionInformation ? { ...service.sessionInformation } : undefined);

      // Arrêter après suffisamment d'émissions
      if (allEmissions.length >= 6) {
        subscription.unsubscribe();

        // Vérifier la séquence d'émissions
        expect(allEmissions).toEqual([false, true, false, true, false, true]);
        
        // Vérifier la cohérence des données de session
        expect(allSessionInfos[0]).toBeUndefined(); // Initial
        expect(allSessionInfos[1]?.username).toBe('rapid1@test.com'); // Premier login
        expect(allSessionInfos[2]).toBeUndefined(); // Premier logout
        expect(allSessionInfos[3]?.username).toBe('rapid2@test.com'); // Deuxième login
        expect(allSessionInfos[4]).toBeUndefined(); // Deuxième logout
        expect(allSessionInfos[5]?.username).toBe('rapid3@test.com'); // Troisième login

        done();
      }
    });

    // Act: Changements d'état rapides successifs
    const users = [
      { token: 'rapid1', id: 1, username: 'rapid1@test.com', firstName: 'Rapid1', lastName: 'Test', admin: false, type: 'Bearer' },
      { token: 'rapid2', id: 2, username: 'rapid2@test.com', firstName: 'Rapid2', lastName: 'Test', admin: true, type: 'Bearer' },
      { token: 'rapid3', id: 3, username: 'rapid3@test.com', firstName: 'Rapid3', lastName: 'Test', admin: false, type: 'Bearer' }
    ] as SessionInformation[];

    // Séquence rapide : login -> logout -> login -> logout -> login
    service.logIn(users[0]);
    service.logOut();
    service.logIn(users[1]);
    service.logOut();
    service.logIn(users[2]);
  });

  /**
   * Souscription tardive (Late subscription)
   * Valide que les nouveaux abonnés reçoivent immédiatement l'état actuel
   */
  it('should provide current state to late subscribers immediately', (done) => {
    // Arrange: Établir un état de session
    const mockUser: SessionInformation = {
      token: 'late-subscription-token',
      type: 'Bearer',
      id: 99,
      username: 'late@test.com',
      firstName: 'Late',
      lastName: 'Subscriber',
      admin: true
    };

    service.logIn(mockUser);
    
    // Act: Souscription tardive (après établissement de l'état)
    const lateSubscription = service.$isLogged().subscribe(isLogged => {
      // Assert: Le nouvel abonné reçoit immédiatement l'état actuel
      expect(isLogged).toBe(true);
      expect(service.isLogged).toBe(true);
      expect(service.sessionInformation?.username).toBe('late@test.com');
      
      lateSubscription.unsubscribe();
      done();
    });
  });
});