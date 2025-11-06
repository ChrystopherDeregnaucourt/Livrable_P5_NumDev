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
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../interfaces/registerRequest.interface';

// Données de test pour l'inscription d'un nouvel utilisateur
const registerPayload: RegisterRequest = {
  email: 'new.user@example.com',
  firstName: 'New',
  lastName: 'User',
  password: 'password'
};

describe('RegisterComponent integration', () => {
  // Variables pour les éléments de test
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let router: Router;
  let httpMock: HttpTestingController;

  // Configuration du module de test avant chaque test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent], // Composant d'inscription à tester
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
      providers: [AuthService] // Service d'authentification
    }).compileComponents();

    // Récupération des instances des services mockés
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  // Vérification qu'aucune requête HTTP n'est en attente après chaque test
  afterEach(() => {
    httpMock.verify();
  });

  /**
   * Vérifie le processus complet d'inscription utilisateur
   * Ce test valide le flux : saisie formulaire -> appel API -> navigation vers login
   */
  it('should register the user through the API and navigate to login', async () => {
    // Arrange: Interaction avec le template pour remplir le formulaire d'inscription
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    const nativeElement = fixture.nativeElement as HTMLElement;

    // Remplissage de tous les champs du formulaire d'inscription
    (nativeElement.querySelector('input[formControlName="email"]') as HTMLInputElement).value = registerPayload.email;
    (nativeElement.querySelector('input[formControlName="email"]') as HTMLInputElement).dispatchEvent(new Event('input'));
    (nativeElement.querySelector('input[formControlName="firstName"]') as HTMLInputElement).value = registerPayload.firstName;
    (nativeElement.querySelector('input[formControlName="firstName"]') as HTMLInputElement).dispatchEvent(new Event('input'));
    (nativeElement.querySelector('input[formControlName="lastName"]') as HTMLInputElement).value = registerPayload.lastName;
    (nativeElement.querySelector('input[formControlName="lastName"]') as HTMLInputElement).dispatchEvent(new Event('input'));
    (nativeElement.querySelector('input[formControlName="password"]') as HTMLInputElement).value = registerPayload.password;
    (nativeElement.querySelector('input[formControlName="password"]') as HTMLInputElement).dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Act: Soumission du formulaire et satisfaction de la requête HTTP POST
    (nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();

    // Interception et vérification de la requête d'inscription
    const request = httpMock.expectOne('api/auth/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body as RegisterRequest).toEqual(registerPayload);
    request.flush(null); // Simulation d'une inscription réussie

    await fixture.whenStable();

    // Assert: Après une inscription réussie, l'utilisateur est redirigé vers la page de connexion
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(component.onError).toBe(false);
  });

  /**
   * Vérifie la gestion des erreurs lors de l'inscription
   * Ce test valide que le composant affiche correctement les erreurs d'inscription
   */
  it('should expose an error state when the API rejects the registration', async () => {
    // Arrange: Fourniture d'identifiants invalides et rendu du template
    fixture.detectChanges();
    const nativeElement = fixture.nativeElement as HTMLElement;

    // Saisie de données pouvant causer un conflit (email déjà existant, mot de passe faible)
    (nativeElement.querySelector('input[formControlName="email"]') as HTMLInputElement).value = 'duplicate@example.com';
    (nativeElement.querySelector('input[formControlName="email"]') as HTMLInputElement).dispatchEvent(new Event('input'));
    (nativeElement.querySelector('input[formControlName="firstName"]') as HTMLInputElement).value = 'Dup';
    (nativeElement.querySelector('input[formControlName="firstName"]') as HTMLInputElement).dispatchEvent(new Event('input'));
    (nativeElement.querySelector('input[formControlName="lastName"]') as HTMLInputElement).value = 'User';
    (nativeElement.querySelector('input[formControlName="lastName"]') as HTMLInputElement).dispatchEvent(new Event('input'));
    (nativeElement.querySelector('input[formControlName="password"]') as HTMLInputElement).value = 'weak';
    (nativeElement.querySelector('input[formControlName="password"]') as HTMLInputElement).dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Act: Déclenchement de la soumission et réponse avec une erreur HTTP
    (nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();

    // Simulation d'un conflit (erreur 409 - email déjà existant)
    const request = httpMock.expectOne('api/auth/register');
    request.flush({ message: 'Conflict' }, { status: 409, statusText: 'Conflict' });

    await fixture.whenStable();

    // Assert: Le flux d'intégration révèle le message d'erreur et empêche la navigation
    expect(component.onError).toBe(true);
  });
});
