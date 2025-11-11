/// <reference types="jest" />

// Imports pour les tests Angular et les modules Material UI
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// Imports des composants et services à tester
import { MeComponent } from './me.component';
import { SessionService } from '../../services/session.service';
import { UserService } from '../../services/user.service';
import { SessionInformation } from '../../interfaces/sessionInformation.interface';
import { User } from '../../interfaces/user.interface';

// Données de test pour un utilisateur membre (non-admin)
const sessionInformation: SessionInformation = {
  token: 'token',
  type: 'Bearer',
  id: 12,
  username: 'member@example.com',
  firstName: 'Member',
  lastName: 'User',
  admin: false
};

// Données de test pour un utilisateur administrateur
const adminInformation: SessionInformation = {
  ...sessionInformation,
  admin: true
};

// Objet utilisateur complet retourné par l'API
const user: User = {
  id: sessionInformation.id,
  email: 'member@example.com',
  firstName: 'Member',
  lastName: 'User',
  admin: false,
  password: 'hashed',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-02-01T00:00:00Z')
};

describe('MeComponent integration', () => {
  // Variables pour les éléments de test
  let fixture: ComponentFixture<MeComponent>;
  let component: MeComponent;
  let sessionService: SessionService;
  let router: Router;
  let httpMock: HttpTestingController;

  // Configuration du module de test avant chaque test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MeComponent], // Composant à tester
      imports: [
        HttpClientTestingModule, // Mock des appels HTTP
        MatCardModule, // Modules Material UI nécessaires
        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        FlexLayoutModule,
        NoopAnimationsModule, // Désactive les animations pour les tests
        RouterTestingModule // Mock du routeur Angular
      ],
      providers: [SessionService, UserService] // Services injectés
    }).compileComponents();

    // Récupération des instances des services mockés
    httpMock = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  // Vérification qu'aucune requête HTTP n'est en attente après chaque test
  afterEach(() => {
    httpMock.verify();
  });

  // Fonction utilitaire pour créer le composant
  function createComponent(): void {
    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
  }

  /**
   * Test d'intégration : Vérifie l'affichage des informations utilisateur récupérées depuis l'API
   * Ce test valide le flux complet de récupération et d'affichage des données utilisateur
   */
  it('should display the user information retrieved from the API', () => {
    // Arrange: Authentification de l'utilisateur membre et démarrage de la détection de changements
    sessionService.sessionInformation = sessionInformation;

    createComponent();
    fixture.detectChanges();

    // Interception et simulation de la requête HTTP GET pour récupérer l'utilisateur
    const userRequest = httpMock.expectOne(`api/user/${sessionInformation.id}`);
    expect(userRequest.request.method).toBe('GET');
    userRequest.flush(user); // Simulation de la réponse de l'API

    fixture.detectChanges();

    // Assert: Vérification que le DOM reflète les données retournées par le backend
    expect(component.user).toEqual(user);

    const nativeElement = fixture.nativeElement as HTMLElement;
    expect(nativeElement.querySelector('h1')?.textContent).toContain('User information');
    expect(nativeElement.textContent).toContain(user.email);
    expect(nativeElement.textContent).toContain(user.firstName);
  });

  /**
   * Test d'intégration complexe : Vérifie le processus complet de suppression d'un compte utilisateur
   * Ce test valide l'ensemble du flux : suppression API -> déconnexion -> notification -> navigation
   */
  it('should delete the user, log out and navigate home', async () => {
    // Arrange: Chargement du composant pour un utilisateur membre
    sessionService.sessionInformation = sessionInformation;

    createComponent();
    fixture.detectChanges();

    // Simulation de la requête initiale de chargement des données utilisateur
    httpMock.expectOne(`api/user/${sessionInformation.id}`).flush(user);
    fixture.detectChanges();

    // Préparation des spies pour surveiller les appels aux services
    const snackBar = TestBed.inject(MatSnackBar);
    const snackBarSpy = jest.spyOn(snackBar, 'open');
    const logOutSpy = jest.spyOn(sessionService, 'logOut');
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    // Act: Déclenchement de l'action de suppression
    component.delete();

    // Interception et simulation de la requête HTTP DELETE
    const deleteRequest = httpMock.expectOne(`api/user/${sessionInformation.id}`);
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null); // Simulation d'une suppression réussie

    // Attente de la stabilisation des opérations asynchrones
    await fixture.whenStable();

    // Assert: Vérification que toutes les actions post-suppression sont exécutées
    expect(snackBarSpy).toHaveBeenCalledWith('Your account has been deleted !', 'Close', { duration: 3000 });
    expect(logOutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  /**
   * Test d'intégration : Vérifie que les administrateurs ne peuvent pas supprimer leur compte
   * Ce test s'assure que l'interface s'adapte selon le rôle de l'utilisateur
   */
  it('should hide the delete section for administrators', () => {
    // Arrange: Chargement du composant avec un profil administrateur
    sessionService.sessionInformation = adminInformation;

    createComponent();
    fixture.detectChanges();

    // Simulation de la réponse API avec un utilisateur admin
    httpMock.expectOne(`api/user/${adminInformation.id}`).flush({ ...user, admin: true });
    fixture.detectChanges();

    // Assert: Vérification que le bouton de suppression n'est pas rendu pour les administrateurs
    const nativeElement = fixture.nativeElement as HTMLElement;
    const deleteButton = Array.from(nativeElement.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Delete')
    );

    expect(deleteButton).toBeUndefined();
  });
});
