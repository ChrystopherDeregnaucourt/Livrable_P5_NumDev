/// <reference types="jest" />

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';

/**
 * Tests du service UserService - Gestion des utilisateurs
 * 
 * Ce service gère toutes les communications HTTP avec l'API utilisateur.
 * Il est la couche d'accès aux données pour les opérations CRUD sur les utilisateurs.
 * 
 * 1. Récupération d'un utilisateur par ID (GET /api/user/:id)
 * 2. Suppression d'un utilisateur (DELETE /api/user/:id)
 * 3. Gestion des erreurs HTTP (404, 401, 500)
 * 
 * TESTS :
 * - Appels HTTP corrects (méthode, URL, paramètres)
 * - Transformation des réponses en objets User
 * - Gestion des erreurs réseau et serveur
 * - Vérification des endpoints API
 * 
 * SÉCURITÉ :
 * - Les erreurs 401 (non autorisé) sont correctement propagées
 * - Les ID utilisateur sont validés côté API
 * - Aucune donnée sensible n'est exposée en cas d'erreur
 */

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    lastName: 'Dupont',
    firstName: 'Marie',
    admin: false,
    password: 'hashedPassword',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
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
    // Vérifie qu'aucune requête HTTP n'est en attente
    httpMock.verify();
  });

  //Test de création du service
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  //Tests de récupération d'utilisateur par ID
  describe('getById', () => {
    /**
     * Récupération réussie d'un utilisateur
     * Valide la transformation de la réponse HTTP en objet User
     */
    it('should retrieve a user by id', (done) => {
      // Arrange
      const userId = '1';

      // Act
      service.getById(userId).subscribe({
        next: (user) => {
          // Assert
          expect(user).toEqual(mockUser);
          expect(user.id).toBe(1);
          expect(user.email).toBe('test@example.com');
          expect(user.firstName).toBe('Marie');
          expect(user.lastName).toBe('Dupont');
          done();
        },
        //Si erreur, le test échoue
        error: done.fail
      });

      // Assert HTTP
      const req = httpMock.expectOne(`api/user/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    //Vérifie la construction correcte de l'URL avec l'ID utilisateur
    it('should call the correct API endpoint with user id', () => {
      // Arrange
      const userId = '42';

      // Act
      service.getById(userId).subscribe();

      // Assert
      const req = httpMock.expectOne('api/user/42');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    //Gestion d'erreur : utilisateur non trouvé (404)
    it('should handle HTTP error when user is not found', (done) => {
      // Arrange
      const userId = '999';
      const errorMessage = 'User not found';

      // Act
      service.getById(userId).subscribe({
        next: () => done.fail('Should have failed with 404 error'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(404);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simulate HTTP error
      const req = httpMock.expectOne(`api/user/${userId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  /**
   * Tests de suppression d'utilisateur
   * 
   * SÉCURITÉ :
   * - Seul l'utilisateur connecté peut supprimer son propre compte (vérifié côté API)
   * - Les erreurs d'autorisation (401) doivent être gérées
   * - Les erreurs serveur ne doivent pas laisser l'état incohérent
   */
  describe('delete', () => {
    /**
     * Scénario nominal : suppression réussie
     * Valide que la requête DELETE est correctement envoyée
     */
    it('should delete a user by id', (done) => {
      // Arrange
      const userId = '1';

      // Act
      service.delete(userId).subscribe({
        next: (response) => {
          // Assert
          expect(response).toBeTruthy();
          done();
        },
        error: done.fail
      });

      // Assert HTTP
      const req = httpMock.expectOne(`api/user/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    /**
     * Vérifie la construction correcte de l'URL DELETE avec l'ID
     * Important pour éviter les erreurs API
     */
    it('should call DELETE endpoint with correct user id', () => {
      // Arrange
      const userId = '15';

      // Act
      service.delete(userId).subscribe();

      // Assert
      const req = httpMock.expectOne('api/user/15');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    //Gestion d'erreur : échec de suppression (500)
    it('should handle error when deletion fails', (done) => {
      // Arrange
      const userId = '1';
      const errorMessage = 'Deletion failed';

      // Act
      service.delete(userId).subscribe({
        next: () => done.fail('Should have failed with error'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(500);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simulate HTTP error
      const req = httpMock.expectOne(`api/user/${userId}`);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });

    /**
     * Gestion d'erreur d'autorisation (401)
     * Empêche un utilisateur de supprimer le compte d'un autre
     */
    it('should handle 401 unauthorized error', (done) => {
      // Arrange
      const userId = '1';

      // Act
      service.delete(userId).subscribe({
        next: () => done.fail('Should have failed with 401'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(401);
          done();
        }
      });

      // Simulate HTTP error
      const req = httpMock.expectOne(`api/user/${userId}`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  /**
   * Tests de cohérence des endpoints API
   * Vérifie que tous les appels utilisent le bon chemin de base
   */
  describe('API path', () => {

    it('should use correct base path for all requests', () => {
      // Act - getById
      service.getById('1').subscribe();
      const getReq = httpMock.expectOne('api/user/1');
      getReq.flush(mockUser);

      // Act - delete
      service.delete('1').subscribe();
      const deleteReq = httpMock.expectOne('api/user/1');
      deleteReq.flush({});

      // Assert - vérifie que les paths commencent bien par 'api/user'
      expect(getReq.request.url).toContain('api/user');
      expect(deleteReq.request.url).toContain('api/user');
    });
  });
});
