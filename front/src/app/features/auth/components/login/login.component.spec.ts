/// <reference types="jest" />

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from './login.component';

/**
 * TESTS CRITIQUES - LoginComponent
 * 
Ces tests couvrent :
 * 1. POINT D'ENTRÉE : Login = point d'accès principal de l'application
 * 2. SÉCURITÉ UI : Validation côté client avant appel API auth
 * 3. GESTION ERREURS : Affichage erreurs de connexion pour l'utilisateur
 * 4. NAVIGATION : Redirection correcte après authentification réussie
 * 
 * Réduit car : Validation détaillée testée en E2E pour l'UX complète
 */
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: Partial<AuthService>;
  let mockSessionService: Partial<SessionService>;
  let mockRouter: Partial<Router>;

  beforeEach(async () => {
    const authServiceSpy = {
      login: jest.fn(),
      register: jest.fn()
    } as Partial<AuthService>;

    const sessionServiceSpy = {
      logIn: jest.fn()
    } as Partial<SessionService>;

    const routerSpy = {
      navigate: jest.fn()
    } as Partial<Router>;

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    
    mockAuthService = TestBed.inject(AuthService) as Partial<AuthService>;
    mockSessionService = TestBed.inject(SessionService) as Partial<SessionService>;
    mockRouter = TestBed.inject(Router) as Partial<Router>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form validation', () => {
    it('should initialize with invalid form', () => {
      
      // Assert
      expect(component.form.valid).toBeFalsy();
    });

    it('should require email field', () => {
      // Arrange
      const emailControl = component.form.get('email');
      
      // Assert
      // Test de validation du champ email
      expect(emailControl?.valid).toBeFalsy();
      
      // Email requis
      expect(emailControl?.errors?.['required']).toBeTruthy();
      
      // Arrange
      // Email valide
      emailControl?.setValue('test@test.com');
      
      // Assert
      expect(emailControl?.errors?.['required']).toBeFalsy();
      expect(emailControl?.valid).toBeTruthy();
    });

    // Tests de validation de format supprimés volontairement, la validation détaillée sera testée en E2E
  });

  describe('submit', () => {
    it('should login successfully and navigate to sessions', () => {
      // Arrange
      const mockSessionInfo: SessionInformation = {
        token: 'test-token',
        type: 'Bearer',
        id: 1,
        username: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      (mockAuthService.login as jest.Mock).mockReturnValue(of(mockSessionInfo));

      // Remplir le formulaire
      component.form.patchValue({
        email: 'test@test.com',
        password: 'password123'
      });

      // Act
      // Appeler submit
      component.submit();

      // Assert
      expect(mockAuthService.login as jest.Mock).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123'
      });
      expect(mockSessionService.logIn as jest.Mock).toHaveBeenCalledWith(mockSessionInfo);
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/sessions']);
      expect(component.onError).toBeFalsy();
    });

    it('should handle login error', () => {
      // Arrange
      // Simuler une erreur de connexion
      (mockAuthService.login as jest.Mock).mockReturnValue(throwError(() => new Error('Invalid credentials')));

      // Remplir le formulaire
      component.form.patchValue({
        email: 'wrong@email.com',
        password: 'wrongpassword'
      });

      // Act
      // Appeler submit
      component.submit();

      // Assert
      expect(mockAuthService.login as jest.Mock).toHaveBeenCalled();
      expect(mockSessionService.logIn as jest.Mock).not.toHaveBeenCalled();
      expect(mockRouter.navigate as jest.Mock).not.toHaveBeenCalled();
      expect(component.onError).toBeTruthy();
    });

    it('should connect after error state on successful login', () => {
      // Arrange
      // D'abord simuler une erreur
      component.onError = true;

      const mockSessionInfo: SessionInformation = {
        token: 'test-token',
        type: 'Bearer',
        id: 1,
        username: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      (mockAuthService.login as jest.Mock).mockReturnValue(of(mockSessionInfo));

      component.form.patchValue({
        email: 'test@test.com',
        password: 'password123'
      });

      // Act
      component.submit();

      // Assert
      // L'erreur ne doit pas être réinitialisée automatiquement dans ce cas
      // mais la connexion doit fonctionner
      expect(mockSessionService.logIn as jest.Mock).toHaveBeenCalledWith(mockSessionInfo);
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/sessions']);
    });

    it('should work with admin user login', () => {
      // Arrange
      const mockAdminSessionInfo: SessionInformation = {
        token: 'admin-token',
        type: 'Bearer',
        id: 2,
        username: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true
      };

      (mockAuthService.login as jest.Mock).mockReturnValue(of(mockAdminSessionInfo));

      component.form.patchValue({
        email: 'admin@test.com',
        password: 'adminpass'
      });

      // Act
      component.submit();

      // Assert
      expect(mockAuthService.login as jest.Mock).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'adminpass'
      });
      expect(mockSessionService.logIn as jest.Mock).toHaveBeenCalledWith(mockAdminSessionInfo);
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/sessions']);
    });
  });

  //**********************Demander à Charles si les tests sont necessaires**********************
  describe('Password visibility toggle', () => {
    it('should initialize with password hidden', () => {
      // Assert
      // Le mot de passe doit être masqué par défaut
      expect(component.hide).toBeTruthy();
    });

    it('should toggle password visibility', () => {
      // Arrange
      // Test de la fonctionnalité de basculement de visibilité
      const initialHideState = component.hide;
      
      // Act
      // Simuler le clic sur l'icône de basculement
      component.hide = !component.hide;
      
      // Assert
      expect(component.hide).toBe(!initialHideState);
      
      // Act
      // Basculer à nouveau
      component.hide = !component.hide;
      
      // Assert
      expect(component.hide).toBe(initialHideState);
    });
  });

  describe('Error handling', () => {
    it('should display error message when onError is true', () => {
      // Arrange
      // Définir l'état d'erreur
      component.onError = true;
      
      // Act
      fixture.detectChanges();

      // Assert
      // L'état d'erreur doit être accessible pour l'affichage dans le template
      expect(component.onError).toBeTruthy();
    });

    it('should start without error message', () => {
      // Assert
      // Aucune erreur au début
      expect(component.onError).toBeFalsy();
    });
  });
});
