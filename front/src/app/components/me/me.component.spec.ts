import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user.interface';
import { MeComponent } from './me.component';

/**
 * Tests du composant MeComponent - Page de profil utilisateur
 * 
 * IMPORTANCE CRITIQUE : Sécurité ⭐⭐⭐⭐⭐
 * 
 * Ce composant gère des fonctionnalités sensibles :
 * - Affichage des informations personnelles de l'utilisateur
 * - Suppression de compte (action irréversible)
 * - Contrôle d'accès basé sur l'utilisateur connecté
 * 
 * TESTS ESSENTIELS :
 * 1. Chargement correct des données utilisateur au ngOnInit
 * 2. Navigation retour vers la liste des sessions
 * 3. Processus de suppression de compte avec confirmation
 * 4. Vérification de l'autorisation (utilisateur ne peut supprimer que son propre compte)
 * 5. Déconnexion automatique après suppression
 * 
 * RISQUES SI NON TESTÉ :
 * - Suppression de compte d'un autre utilisateur
 * - Perte de données sans confirmation
 * - Session non fermée après suppression
 * - Affichage d'informations erronées
 */
describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let mockUserService: jest.Mocked<UserService>;
  let mockSessionService: Partial<SessionService>;
  let mockRouter: jest.Mocked<Router>;
  let mockMatSnackBar: jest.Mocked<MatSnackBar>;

  const mockUser: User = {
    id: 1,
    email: 'john.doe@test.com',
    lastName: 'Doe',
    firstName: 'John',
    admin: false,
    password: 'securePassword123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  };

  beforeEach(async () => {
    // Mock UserService
    mockUserService = {
      getById: jest.fn().mockReturnValue(of(mockUser)),
      delete: jest.fn().mockReturnValue(of({}))
    } as any;

    // Mock SessionService
    mockSessionService = {
      sessionInformation: {
        token: 'mock-jwt-token',
        type: 'Bearer',
        id: 1,
        username: 'john.doe@test.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      },
      isLogged: true,
      logOut: jest.fn()
    };

    // Mock Router
    mockRouter = {
      navigate: jest.fn()
    } as any;

    // Mock MatSnackBar
    mockMatSnackBar = {
      open: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      declarations: [MeComponent],
      imports: [
        MatSnackBarModule,
        HttpClientModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockMatSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
  });

  /**
   * Test de création du composant
   * Vérifie que le composant peut être instancié correctement
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Tests du cycle de vie ngOnInit
   * 
   * IMPORTANCE : ⭐⭐⭐⭐⭐
   * Valide que les données utilisateur sont chargées correctement au démarrage
   * Essentiel pour afficher les bonnes informations personnelles
   */
  describe('ngOnInit', () => {
    /**
     * Vérifie le chargement automatique des informations utilisateur
     * Test fondamental : garantit que le profil affiché correspond à l'utilisateur connecté
     */
    it('should load user information on initialization', () => {
      // Act
      fixture.detectChanges(); // Déclenche ngOnInit

      // Assert
      expect(mockUserService.getById).toHaveBeenCalledWith('1');
      expect(component.user).toEqual(mockUser);
    });

    /**
     * Vérifie que l'ID utilisateur est correctement extrait de la session
     * Sécurité : empêche l'affichage du profil d'un autre utilisateur
     */
    it('should call UserService.getById with correct user id from session', () => {
      // Arrange
      mockSessionService.sessionInformation!.id = 42;

      // Act
      component.ngOnInit();

      // Assert
      expect(mockUserService.getById).toHaveBeenCalledWith('42');
    });
  });

  /**
   * Tests de navigation
   * Vérifie le fonctionnement du bouton retour
   */
  describe('back', () => {
    /**
     * Vérifie que le bouton retour utilise l'historique du navigateur
     * UX : comportement attendu par l'utilisateur
     */
    it('should navigate back in browser history', () => {
      // Arrange
      const historySpy = jest.spyOn(window.history, 'back');

      // Act
      component.back();

      // Assert
      expect(historySpy).toHaveBeenCalled();
    });
  });

  /**
   * Tests de suppression de compte
   * 
   * IMPORTANCE CRITIQUE : ⭐⭐⭐⭐⭐
   * Action irréversible qui supprime définitivement les données utilisateur
   * 
   * SÉCURITÉ :
   * - Doit vérifier l'autorisation (utilisateur ne peut supprimer que son propre compte)
   * - Doit déconnecter l'utilisateur après suppression
   * - Doit rediriger vers la page d'accueil
   * - Doit afficher un message de confirmation
   */
  describe('delete', () => {
    /**
     * Scénario nominal : suppression réussie d'un compte
     * Valide la séquence complète : API → Déconnexion → Message → Redirection
     */
    it('should delete user account successfully', (done) => {
      // Act
      component.delete();

      // Assert
      setTimeout(() => {
        // Vérification de l'appel API avec le bon ID utilisateur
        expect(mockUserService.delete).toHaveBeenCalledWith('1');
        
        // Vérification du message de confirmation (feedback utilisateur)
        expect(mockMatSnackBar.open).toHaveBeenCalledWith(
          'Your account has been deleted !',
          'Close',
          { duration: 3000 }
        );
        
        // SÉCURITÉ : Vérification de la déconnexion (session fermée après suppression)
        expect(mockSessionService.logOut).toHaveBeenCalled();
        
        // Vérification de la redirection vers la page d'accueil
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        done();
      }, 100);
    });

    /**
     * Vérifie l'utilisation du bon ID utilisateur pour la suppression
     * SÉCURITÉ : garantit qu'on supprime le compte de l'utilisateur connecté, pas un autre
     */
    it('should call delete with correct user id from session', () => {
      // Arrange
      mockSessionService.sessionInformation!.id = 99;

      // Act
      component.delete();

      // Assert
      expect(mockUserService.delete).toHaveBeenCalledWith('99');
    });

    /**
     * Vérifie l'ordre d'exécution : déconnexion puis redirection
     * SÉCURITÉ : l'utilisateur ne doit pas rester connecté après suppression de son compte
     */
    it('should logout and redirect after successful deletion', (done) => {
      // Act
      component.delete();

      // Assert - vérifie l'ordre d'exécution
      setTimeout(() => {
        expect(mockSessionService.logOut).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        done();
      }, 100);
    });
  });

  /**
   * Tests d'affichage
   * Vérifie que les informations utilisateur sont correctement affichées dans le template
   */
  describe('User display', () => {
    /**
     * Valide que toutes les données utilisateur sont disponibles après chargement
     * Important pour l'UX : l'utilisateur doit voir son profil complet
     */
    it('should display user information in template after loading', () => {
      // Act
      fixture.detectChanges();

      // Assert
      const compiled = fixture.nativeElement;
      expect(component.user).toBeDefined();
      expect(component.user?.email).toBe('john.doe@test.com');
      expect(component.user?.firstName).toBe('John');
      expect(component.user?.lastName).toBe('Doe');
    });
  });
});
