/// <reference types="jest" />

// Imports pour les tests Angular et les modules Material UI
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterTestingModule } from '@angular/router/testing';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Imports des composants et services à tester
import { ListComponent } from './list.component';
import { SessionService } from '../../../../services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { Session } from '../../interfaces/session.interface';
import { SessionInformation } from '../../../../interfaces/sessionInformation.interface';

// Données de test pour un utilisateur administrateur
const adminSessionInformation: SessionInformation = {
  token: 'token',
  type: 'Bearer',
  id: 1,
  username: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  admin: true
};

// Données de test pour un utilisateur standard (non-admin)
const standardSessionInformation: SessionInformation = {
  ...adminSessionInformation,
  admin: false
};

// Données de test pour les sessions de yoga mockées
const mockSessions: ReadonlyArray<Session> = [
  {
    id: 1,
    name: 'Morning Flow',
    description: 'Start your day with energy.',
    date: new Date('2024-05-01'),
    teacher_id: 2,
    users: [1, 2, 3],
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-15')
  },
  {
    id: 2,
    name: 'Evening Relax',
    description: 'Unwind after work.',
    date: new Date('2024-05-05'),
    teacher_id: 3,
    users: [4, 5],
    createdAt: new Date('2024-04-02'),
    updatedAt: new Date('2024-04-16')
  }
];

describe('ListComponent integration', () => {
  // Variables pour les éléments de test
  let fixture: ComponentFixture<ListComponent>;
  let component: ListComponent;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;

  // Configuration du module de test avant chaque test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListComponent], // Composant de liste des sessions à tester
      imports: [
        HttpClientTestingModule, // Mock des appels HTTP
        MatCardModule, // Modules Material UI nécessaires
        MatIconModule,
        MatButtonModule,
        FlexLayoutModule,
        RouterTestingModule, // Mock du routeur Angular
        NoopAnimationsModule // Désactive les animations pour les tests
      ],
      providers: [SessionService, SessionApiService] // Services de session et d'API
    }).compileComponents();

    // Récupération des instances des services mockés
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    sessionService = TestBed.inject(SessionService);
  });

  // Vérification qu'aucune requête HTTP n'est en attente après chaque test
  afterEach(() => {
    httpMock.verify();
  });

  /**
   * Vérifie l'affichage de la liste des sessions avec les actions administrateur
   * Ce test valide que les administrateurs voient toutes les fonctionnalités (création, édition)
   */
  it('should render the sessions list with admin actions', () => {
    // Arrange: Authentification en tant qu'administrateur et démarrage du cycle de vie du composant
    sessionService.sessionInformation = adminSessionInformation;

    fixture.detectChanges();

    // Interception et simulation de la requête de récupération des sessions
    const request = httpMock.expectOne('api/session');
    expect(request.request.method).toBe('GET');
    request.flush(mockSessions); // Retour des sessions mockées

    fixture.detectChanges();

    // Assert: Le DOM expose les données et les actions spécifiques aux administrateurs
    const nativeElement = fixture.nativeElement as HTMLElement;
    const sessionCards = nativeElement.querySelectorAll('.item');
    const createButton = nativeElement.querySelector('button[routerlink="create"]');

    expect(component.sessions$).toBeDefined();
    expect(sessionCards).toHaveLength(mockSessions.length);
    expect(createButton).not.toBeNull(); // Bouton de création visible pour les admins

    // Vérification du contenu de la première session
    const firstCardTitle = nativeElement.querySelector('.item mat-card-title');
    expect(firstCardTitle?.textContent).toContain('Morning Flow');
  });

  /**
   * Vérifie que les contrôles administrateur sont masqués pour les utilisateurs standards
   * Ce test s'assure que l'interface s'adapte selon les permissions utilisateur
   */
  it('should hide admin controls for standard users', () => {
    // Arrange: Connexion avec un utilisateur non-administrateur
    sessionService.sessionInformation = standardSessionInformation;

    fixture.detectChanges();

    // Simulation de la réponse API avec les sessions
    const request = httpMock.expectOne('api/session');
    request.flush(mockSessions);

    fixture.detectChanges();

    // Assert: Les actions privilégiées ne sont pas présentes dans le template rendu
    const nativeElement = fixture.nativeElement as HTMLElement;
    const createButton = nativeElement.querySelector('button[routerlink="create"]');
    const actionButtons = Array.from(nativeElement.querySelectorAll('button')).filter((button) =>
      button.textContent?.includes('Edit')
    );

    expect(createButton).toBeNull(); // Pas de bouton de création pour les utilisateurs standards
    expect(actionButtons).toHaveLength(0); // Pas de boutons d'édition
  });
});
