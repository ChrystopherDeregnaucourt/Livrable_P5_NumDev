/// <reference types="jest" />

// Imports pour les tests Angular et les modules Material UI
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// Imports des composants et services à tester
import { FormComponent } from './form.component';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from '../../../../services/teacher.service';
import { SessionService } from '../../../../services/session.service';
import { Session } from '../../interfaces/session.interface';
import { Teacher } from '../../../../interfaces/teacher.interface';
import { SessionInformation } from '../../../../interfaces/sessionInformation.interface';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

// Données de test pour un utilisateur administrateur
const adminInformation: SessionInformation = {
  token: 'token',
  type: 'Bearer',
  id: 42,
  username: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  admin: true
};

// Données de test pour un utilisateur membre (non-admin)
const memberInformation: SessionInformation = {
  ...adminInformation,
  admin: false
};

// Données de test pour les professeurs mockés
const teachers: ReadonlyArray<Teacher> = [
  {
    id: 1,
    firstName: 'Alex',
    lastName: 'Martin',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  }
];

// Session existante pour les tests de modification
const existingSession: Session = {
  id: 10,
  name: 'Existing Session',
  date: new Date('2024-07-01T00:00:00Z'),
  description: 'A well attended session',
  teacher_id: teachers[0].id,
  users: [1, 2, 3],
  createdAt: new Date('2024-06-01T00:00:00Z'),
  updatedAt: new Date('2024-06-10T00:00:00Z')
};

describe('FormComponent integration', () => {
  // Variables pour les éléments de test
  let fixture: ComponentFixture<FormComponent>;
  let component: FormComponent;
  let sessionService: SessionService;
  let router: Router;
  let httpMock: HttpTestingController;

  // Configuration du module de test avant chaque test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormComponent], // Composant de formulaire de session à tester
      imports: [
        HttpClientTestingModule, // Mock des appels HTTP
        ReactiveFormsModule, // Module pour les formulaires réactifs
        MatCardModule, // Modules Material UI nécessaires
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule,
        FlexLayoutModule,
        NoopAnimationsModule, // Désactive les animations pour les tests
        RouterTestingModule // Mock du routeur Angular
      ],
      providers: [
        SessionService, // Services requis
        SessionApiService,
        TeacherService,
        {
          // Mock d'ActivatedRoute pour simuler les paramètres d'URL
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: String(existingSession.id) })
            }
          }
        }
      ]
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
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
  }

  /**
   * Vérifie la redirection des utilisateurs non-administrateurs
   * Ce test s'assure que seuls les administrateurs peuvent accéder au formulaire de session
   */
  it('should redirect non admin users to the sessions list', async () => {
    // Arrange: Définition de la session sur un utilisateur non-admin avant l'instantiation du composant
    sessionService.sessionInformation = memberInformation;
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    createComponent();
    fixture.detectChanges();

    // Simulation de la réponse API pour les professeurs
    const teacherRequest = httpMock.expectOne('api/teacher');
    teacherRequest.flush(teachers);

    await fixture.whenStable();

    // Assert: L'utilisateur est redirigé vers la liste des sessions
    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
  });

  /**
   * Vérifie l'initialisation d'un formulaire vierge en mode création
   * Ce test valide que le formulaire se configure correctement pour créer une nouvelle session
   */
  it('should initialize a blank form in create mode', () => {
    // Arrange: Simulation de la route de création pour un administrateur
    sessionService.sessionInformation = adminInformation;
    jest.spyOn(router, 'url', 'get').mockReturnValue('/sessions/create');

    createComponent();
    fixture.detectChanges();

    // Simulation de la réponse API pour charger les professeurs
    httpMock.expectOne('api/teacher').flush(teachers);
    fixture.detectChanges();

    // Assert: Le formulaire réactif est initialisé vide et prêt pour la saisie
    expect(component.onUpdate).toBe(false);
    expect(component.sessionForm?.value).toEqual({
      name: '',
      date: '',
      teacher_id: '',
      description: ''
    });
  });

  /**
   * Vérifie le pré-remplissage du formulaire en mode modification
   * Ce test valide que les données existantes sont correctement chargées dans le formulaire
   */
  it('should populate the form in update mode', () => {
    // Arrange: Émulation de la navigation sur la route de modification
    sessionService.sessionInformation = adminInformation;
    jest.spyOn(router, 'url', 'get').mockReturnValue('/sessions/update/10');

    createComponent();
    fixture.detectChanges();

    // Simulation des réponses API pour charger les professeurs et la session existante
    httpMock.expectOne(`api/session/${existingSession.id}`).flush(existingSession);
    fixture.detectChanges(); // Déclenche le rendu du template qui lance la requête teachers
    httpMock.expectOne('api/teacher').flush(teachers);
    fixture.detectChanges();

    // Assert: Le formulaire reflète la session retournée par l'API
    expect(component.onUpdate).toBe(true);
    expect(component.sessionForm?.value).toEqual({
      name: existingSession.name,
      date: existingSession.date.toISOString().split('T')[0],
      teacher_id: existingSession.teacher_id,
      description: existingSession.description
    });
  });

  /**
   * Vérifie le processus complet de création d'une session
   * Ce test valide le flux : remplissage formulaire -> soumission -> appel API -> notification -> navigation
   */
  it('should create a session and notify the user', async () => {
    // Arrange: Rendu du formulaire en mode création en tant qu'administrateur
    sessionService.sessionInformation = adminInformation;
    jest.spyOn(router, 'url', 'get').mockReturnValue('/sessions/create');

    createComponent();
    fixture.detectChanges();

    // Chargement des professeurs disponibles
    httpMock.expectOne('api/teacher').flush(teachers);
    fixture.detectChanges();

    // Préparation des spies pour surveiller les notifications et la navigation
    const snackBar = TestBed.inject(MatSnackBar);
    const snackBarSpy = jest.spyOn(snackBar, 'open');
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    // Remplissage du formulaire avec des données de test
    component.sessionForm?.setValue({
      name: 'Morning Session',
      date: '2024-08-01',
      teacher_id: teachers[0].id,
      description: 'Start strong'
    });

    // Act: Soumission du formulaire et traitement de la réponse POST du backend
    component.submit();

    const createRequest = httpMock.expectOne('api/session');
    expect(createRequest.request.method).toBe('POST');
    createRequest.flush(existingSession); // Simulation d'une création réussie

    await fixture.whenStable();

    // Assert: L'utilisateur reçoit un feedback et est redirigé vers la liste
    expect(snackBarSpy).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });

  /**
   * Vérifie le processus complet de modification d'une session
   * Ce test valide le flux : chargement données -> modification -> soumission -> appel API -> notification
   */
  it('should update a session and notify the user', async () => {
    // Arrange: Rendu du formulaire en mode modification
    sessionService.sessionInformation = adminInformation;
    jest.spyOn(router, 'url', 'get').mockReturnValue('/sessions/update/10');

    createComponent();
    fixture.detectChanges();

    // Chargement des professeurs et de la session existante
    httpMock.expectOne(`api/session/${existingSession.id}`).flush(existingSession);
    fixture.detectChanges(); // Déclenche le rendu du template qui lance la requête teachers
    httpMock.expectOne('api/teacher').flush(teachers);
    fixture.detectChanges();

    // Préparation des spies pour surveiller les notifications et la navigation
    const snackBar = TestBed.inject(MatSnackBar);
    const snackBarSpy = jest.spyOn(snackBar, 'open');
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    // Modification des données de la session
    component.sessionForm?.setValue({
      name: 'Updated Session',
      date: existingSession.date.toISOString().split('T')[0],
      teacher_id: existingSession.teacher_id,
      description: 'Updated description'
    });

    // Act: Soumission du formulaire déclenchant la requête PUT
    component.submit();

    const updateRequest = httpMock.expectOne(`api/session/${existingSession.id}`);
    expect(updateRequest.request.method).toBe('PUT');
    updateRequest.flush(existingSession); // Simulation d'une modification réussie

    await fixture.whenStable();

    // Assert: Le feedback snackbar et la navigation reflètent l'expérience de production
    expect(snackBarSpy).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });
});
