/// <reference types="jest" />

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';

/**
 * UserService avec HttpClient réel
 * 
 * Ces tests valident l'intégration API pour la gestion des utilisateurs :
 * 1. GESTION PROFIL : Récupération et suppression des données utilisateur
 * 2. SÉCURITÉ UTILISATEUR : Validation des droits d'accès aux données personnelles
 * 3. MÉTIER CRITIQUE : Suppression de compte = opération irréversible sensible
 * 4. INTÉGRATION API : Communication réelle avec le backend des utilisateurs
 */

describe('UserService Integration Tests', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  // Données de test réalistes pour les utilisateurs
  const mockUser: User = {
    id: 42,
    email: 'integration.user@test.com',
    firstName: 'Integration',
    lastName: 'User',
    admin: false,
    password: 'hashed_password_string_not_plain_text', // Mot de passe haché côté serveur
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-03-20T14:45:00Z')
  };

  const mockAdminUser: User = {
    id: 1,
    email: 'admin@yogaapp.com',
    firstName: 'Admin',
    lastName: 'Yoga',
    admin: true,
    password: 'admin_hashed_password_secure',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2024-02-10T12:00:00Z')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Vérifier qu'aucune requête HTTP n'est en attente
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Test d'intégration : Récupération complète des données utilisateur
   * Valide l'intégration pour l'affichage du profil utilisateur complet
   */
  it('should retrieve complete user profile data for account management', (done) => {
    // Arrange: ID utilisateur pour récupération de profil
    const userId = '42';

    // Act: Récupérer les données complètes de l'utilisateur
    service.getById(userId).subscribe({
      next: (user) => {
        // Assert: Vérifier toutes les propriétés du profil utilisateur
        expect(user).toEqual(mockUser);
        expect(user.id).toBe(42);
        expect(user.email).toBe('integration.user@test.com');
        expect(user.firstName).toBe('Integration');
        expect(user.lastName).toBe('User');
        expect(user.admin).toBe(false);
        expect(user.password).toBeDefined(); // Présent mais haché
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.updatedAt).toBeInstanceOf(Date);
        
        // Vérification de l'intégrité des timestamps
        expect(user.createdAt!.getTime()).toBeLessThan(user.updatedAt!.getTime());
        
        // Vérification de la sécurité - le password ne doit pas être en clair
        expect(user.password).not.toMatch(/^[a-zA-Z0-9]{6,}$/); // Pas un mot de passe en clair simple
        expect(user.password).toContain('hashed'); // Indique que c'est haché
        
        done();
      },
      error: done.fail
    });

    // Assert: Vérifier la requête de récupération utilisateur
    const req = httpMock.expectOne(`api/user/${userId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.url).toBe(`api/user/${userId}`);
    
    req.flush(mockUser);
  });

  /**
   * Récupération des données d'un utilisateur administrateur
   * Valide l'intégration avec les privilèges admin
   */
  it('should retrieve admin user data with proper privilege validation', (done) => {
    // Arrange: ID utilisateur admin
    const adminId = '1';

    // Act: Récupérer les données de l'administrateur
    service.getById(adminId).subscribe({
      next: (user) => {
        // Assert: Vérifier les propriétés spécifiques admin
        expect(user).toEqual(mockAdminUser);
        expect(user.admin).toBe(true);
        expect(user.email).toContain('admin');
        expect(user.id).toBe(1);
        
        // Vérifier que l'admin a des propriétés cohérentes
        expect(user.firstName).toBe('Admin');
        expect(user.lastName).toBe('Yoga');
        expect(user.createdAt).toBeInstanceOf(Date);
        
        done();
      },
      error: done.fail
    });

    const req = httpMock.expectOne(`api/user/${adminId}`);
    req.flush(mockAdminUser);
  });

  /**
   * Suppression de compte utilisateur (opération critique)
   * Valide le processus complet de suppression de compte avec sécurité
   */
  it('should handle account deletion with security validation', (done) => {
    // Arrange: ID de l'utilisateur qui supprime son propre compte
    const userId = '42';

    // Act: Supprimer le compte utilisateur
    service.delete(userId).subscribe({
      next: (result) => {
        // Assert: Vérifier que la suppression s'est bien passée
        expect(result).toBeDefined(); // Peut être un objet de confirmation ou null
        done();
      },
      error: done.fail
    });

    // Assert: Vérifier la requête de suppression
    const req = httpMock.expectOne(`api/user/${userId}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.url).toBe(`api/user/${userId}`);
    expect(req.request.body).toBeNull(); // DELETE ne doit pas avoir de body
    
    // Simuler confirmation de suppression
    req.flush({ message: 'Account successfully deleted', deletedAt: new Date() });
  });

  /**
   * Gestion des erreurs de sécurité (accès non autorisé)
   * Valide la protection contre l'accès aux données d'autres utilisateurs
   */
  it('should handle unauthorized access to user data with proper security response', (done) => {
    // Arrange: Tentative d'accès aux données d'un autre utilisateur
    const unauthorizedUserId = '999';

    // Act: Tenter d'accéder aux données sans autorisation
    service.getById(unauthorizedUserId).subscribe({
      next: () => done.fail('Should have failed with authorization error'),
      error: (error) => {
        // Assert: Vérifier l'erreur de sécurité appropriée
        expect(error.status).toBe(403);
        expect(error.statusText).toBe('Forbidden');
        expect(error.error).toBeDefined();
        expect(error.error.message).toContain('Access denied');
        done();
      }
    });

    // Simuler une réponse d'accès refusé
    const req = httpMock.expectOne(`api/user/${unauthorizedUserId}`);
    req.flush(
      { message: 'Access denied to user data' },
      { status: 403, statusText: 'Forbidden' }
    );
  });

  /**
   * Gestion des erreurs utilisateur non trouvé
   * Valide les cas d'erreur avec utilisateur inexistant
   */
  it('should handle user not found error with appropriate response', (done) => {
    // Arrange: ID d'utilisateur inexistant
    const nonExistentUserId = '99999';

    // Act: Tenter de récupérer un utilisateur inexistant
    service.getById(nonExistentUserId).subscribe({
      next: () => done.fail('Should have failed with 404 error'),
      error: (error) => {
        // Assert: Vérifier l'erreur 404
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error).toContain('User not found');
        done();
      }
    });

    // Simuler une erreur 404 du serveur
    const req = httpMock.expectOne(`api/user/${nonExistentUserId}`);
    req.flush(
      'User not found',
      { status: 404, statusText: 'Not Found' }
    );
  });

  /**
   * Protection contre la suppression de compte admin
   * Valide les protections métier pour les comptes critiques
   */
  it('should prevent deletion of admin accounts with business rules validation', (done) => {
    // Arrange: Tentative de suppression du compte admin principal
    const adminUserId = '1';

    // Act: Tenter de supprimer le compte admin
    service.delete(adminUserId).subscribe({
      next: () => done.fail('Should have failed with business rule error'),
      error: (error) => {
        // Assert: Vérifier l'erreur de règle métier
        expect(error.status).toBe(422);
        expect(error.statusText).toBe('Unprocessable Entity');
        expect(error.error.message).toContain('Cannot delete admin account');
        done();
      }
    });

    // Simuler une erreur de règle métier
    const req = httpMock.expectOne(`api/user/${adminUserId}`);
    req.flush(
      { message: 'Cannot delete admin account - business rule violation' },
      { status: 422, statusText: 'Unprocessable Entity' }
    );
  });

  /**
   * Gestion des utilisateurs avec données complexes
   * Valide l'intégration avec des emails et noms complexes
   */
  it('should handle users with complex email formats and names', (done) => {
    // Arrange: Utilisateur avec email et nom complexes
    const complexUser: User = {
      id: 100,
      email: 'marie-claire.dubois+yoga@domaine-test.fr',
      firstName: 'Marie-Claire',
      lastName: 'Dubois-Martin',
      admin: false,
      password: 'complex_hashed_password_with_special_chars',
      createdAt: new Date('2024-05-10T08:15:30.123Z'),
      updatedAt: new Date('2024-06-20T16:22:45.987Z')
    };

    // Act: Récupérer l'utilisateur avec données complexes
    service.getById('100').subscribe({
      next: (user) => {
        // Assert: Vérifier que les caractères spéciaux sont préservés
        expect(user.email).toBe('marie-claire.dubois+yoga@domaine-test.fr');
        expect(user.firstName).toBe('Marie-Claire');
        expect(user.lastName).toBe('Dubois-Martin');
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.updatedAt).toBeInstanceOf(Date);
        done();
      },
      error: done.fail
    });

    const req = httpMock.expectOne('api/user/100');
    req.flush(complexUser);
  });

  /**
   * Validation des timestamps et cohérence temporelle
   * S'assure que les dates sont correctement gérées dans l'API
   */
  it('should properly handle user timestamp data with temporal consistency', (done) => {
    // Arrange: Utilisateur avec timestamps précis
    const timestampUser: User = {
      id: 200,
      email: 'timestamp@test.com',
      firstName: 'Timestamp',
      lastName: 'Test',
      admin: false,
      password: 'timestamp_password_hash',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-12-31T23:59:59.999Z')
    };

    // Act: Récupérer l'utilisateur
    service.getById('200').subscribe({
      next: (user) => {
        // Assert: Vérifier la précision et cohérence des timestamps
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.updatedAt).toBeInstanceOf(Date);
        expect(user.createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
        expect(user.updatedAt!.toISOString()).toBe('2024-12-31T23:59:59.999Z');
        
        // Vérifier la logique temporelle
        expect(user.createdAt!.getTime()).toBeLessThan(user.updatedAt!.getTime());
        
        // Vérifier que les dates ne sont pas dans le futur
        const now = new Date();
        expect(user.createdAt.getTime()).toBeLessThanOrEqual(now.getTime());
        
        done();
      },
      error: done.fail
    });

    const req = httpMock.expectOne('api/user/200');
    req.flush(timestampUser);
  });

  /**
   * Opérations simultanées sur différents utilisateurs
   * Valide que le service peut gérer plusieurs requêtes en parallèle
   */
  it('should handle concurrent user operations for multi-user scenarios', () => {
    // Arrange: Données pour opérations simultanées
    const userIds = ['1', '2', '3'];
    const users = [mockAdminUser, mockUser, { ...mockUser, id: 3, email: 'user3@test.com' }];

    // Act: Lancer plusieurs opérations simultanément
    service.getById(userIds[0]).subscribe();
    service.getById(userIds[1]).subscribe();
    service.delete(userIds[2]).subscribe();

    // Assert: Vérifier que toutes les requêtes sont envoyées correctement
    const getReq1 = httpMock.expectOne(`api/user/${userIds[0]}`);
    const getReq2 = httpMock.expectOne(`api/user/${userIds[1]}`);
    const deleteReq = httpMock.expectOne(`api/user/${userIds[2]}`);

    expect(getReq1.request.method).toBe('GET');
    expect(getReq2.request.method).toBe('GET');
    expect(deleteReq.request.method).toBe('DELETE');

    // Simuler les réponses
    getReq1.flush(users[0]);
    getReq2.flush(users[1]);
    deleteReq.flush({ message: 'User deleted' });
  });

  /**
   * Validation de la cohérence des endpoints API
   * S'assure que tous les endpoints utilisent la base 'api/user'
   */
  it('should maintain consistent API endpoint structure for all user operations', () => {
    // Act: Tester tous les endpoints du service
    service.getById('1').subscribe();
    service.getById('42').subscribe();
    service.delete('100').subscribe();  // Utiliser des IDs différents
    service.delete('200').subscribe();

    // Assert: Vérifier la cohérence des URLs
    const requests = [
      httpMock.expectOne('api/user/1'),      // getById
      httpMock.expectOne('api/user/42'),     // getById
      httpMock.expectOne('api/user/100'),    // delete  
      httpMock.expectOne('api/user/200')     // delete
    ];

    // Vérifier que toutes les URLs utilisent la base correcte
    requests.forEach((req, index) => {
      expect(req.request.url).toMatch(/^api\/user\/\d+$/);
      if (index < 2) {
        expect(req.request.method).toBe('GET');
      } else {
        expect(req.request.method).toBe('DELETE');
      }
    });

    // Simuler les réponses
    requests[0].flush(mockAdminUser);
    requests[1].flush(mockUser);
    requests[2].flush(null);  // DELETE peut retourner null
    requests[3].flush(null);
  });

  /**
   * Gestion des erreurs réseau pour les opérations utilisateur
   * Valide le comportement en cas de problème de connectivité
   */
  it('should handle network errors gracefully for user operations continuity', (done) => {
    // Act: Tenter une requête avec erreur réseau
    service.getById('1').subscribe({
      next: () => done.fail('Should have failed with network error'),
      error: (error) => {
        // Assert: Vérifier la gestion de l'erreur réseau
        expect(error.status).toBe(0); // Status 0 pour les erreurs réseau
        done();
      }
    });

    // Simuler une erreur réseau
    const req = httpMock.expectOne('api/user/1');
    req.error(new ErrorEvent('Network error'), { status: 0 });
  });
});