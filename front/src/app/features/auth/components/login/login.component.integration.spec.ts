/// <reference types="jest" />

// Imports pour les tests Angular et les modules Material UI
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// Imports des composants et services à tester
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../../../services/session.service';
import { SessionInformation } from '../../../../interfaces/sessionInformation.interface';
import { LoginRequest } from '../../interfaces/loginRequest.interface';

// Données de test pour une session utilisateur authentifiée
const sessionInformation: SessionInformation = {
  token: 'token',
  type: 'Bearer',
  id: 7,
  username: 'jane.doe@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  admin: false
};

describe('LoginComponent integration', () => {
  // Variables pour les éléments de test
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let sessionService: SessionService;
  let router: Router;
  let httpMock: HttpTestingController;

  // Configuration du module de test avant chaque test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent], // Composant de connexion à tester
      imports: [
        ReactiveFormsModule, // Module pour les formulaires réactifs
        RouterTestingModule, // Mock du routeur Angular
        NoopAnimationsModule, // Désactive les animations pour les tests
        MatInputModule, // Modules Material UI nécessaires
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        HttpClientTestingModule // Mock des appels HTTP
      ],
      providers: [SessionService, AuthService] // Services d'authentification et de session
    }).compileComponents();

    // Récupération des instances des services mockés
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  // Vérification qu'aucune requête HTTP n'est en attente après chaque test
  afterEach(() => {
    httpMock.verify();
  });

  /**
   * Vérifie le processus complet d'authentification utilisateur
   * Ce test valide le flux : saisie formulaire -> appel API -> mise à jour session -> navigation
   */
  it('should authenticate the user and navigate to sessions on submit', async () => {
    // Arrange: Préparation du formulaire de connexion via le template pour imiter le flux utilisateur
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const nativeElement = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    // Récupération des éléments du formulaire dans le DOM
    const emailInput = nativeElement.querySelector('input[formControlName="email"]') as HTMLInputElement;
    const passwordInput = nativeElement.querySelector('input[formControlName="password"]') as HTMLInputElement;
    const submitButton = nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;

    // Simulation de la saisie utilisateur dans les champs du formulaire
    emailInput.value = 'jane.doe@example.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'secret';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Act: Soumission du formulaire qui déclenche l'appel HTTP réel vers AuthService
    submitButton.click();

    // Interception et vérification de la requête d'authentification
    const request = httpMock.expectOne('api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body as LoginRequest).toEqual({ email: 'jane.doe@example.com', password: 'secret' });
    request.flush(sessionInformation); // Simulation d'une réponse d'authentification réussie

    // Attente de la stabilisation des opérations asynchrones
    await fixture.whenStable();

    // Assert: Vérification que la session est mise à jour et que la navigation s'effectue comme en production
    expect(sessionService.sessionInformation).toEqual(sessionInformation);
    expect(sessionService.isLogged).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
  });

  /**
   * Vérifie la gestion des erreurs d'authentification
   * Ce test valide que le composant affiche correctement les erreurs sans authentifier l'utilisateur
   */
  it('should expose an error flag when authentication fails', async () => {
    // Arrange: Préparation du DOM et des identifiants utilisateur incorrects
    fixture.detectChanges();
    const nativeElement = fixture.nativeElement as HTMLElement;
    const emailInput = nativeElement.querySelector('input[formControlName="email"]') as HTMLInputElement;
    const passwordInput = nativeElement.querySelector('input[formControlName="password"]') as HTMLInputElement;
    const submitButton = nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;

    // Saisie d'identifiants incorrects
    emailInput.value = 'john@example.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'bad';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Act: Soumission du formulaire et simulation d'une erreur HTTP
    submitButton.click();

    // Interception de la requête et simulation d'une réponse d'erreur 401
    const request = httpMock.expectOne('api/auth/login');
    request.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    await fixture.whenStable();

    // Assert: Vérification que le composant expose l'état d'échec sans connecter l'utilisateur
    expect(component.onError).toBe(true);
    expect(sessionService.sessionInformation).toBeUndefined();
    expect(sessionService.isLogged).toBe(false);
  });
});
