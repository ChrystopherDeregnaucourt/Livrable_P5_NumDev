/// <reference types="jest" />

// Imports pour les tests Angular et les modules Material UI
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// Imports des composants et services à tester
import { DetailComponent } from './detail.component';
import { SessionService } from '../../../../services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from '../../../../services/teacher.service';
import { Session } from '../../interfaces/session.interface';
import { Teacher } from '../../../../interfaces/teacher.interface';
import { SessionInformation } from '../../../../interfaces/sessionInformation.interface';

// Données de test pour un utilisateur membre standard
const sessionInformation: SessionInformation = {
  token: 'token',
  type: 'Bearer',
  id: 3,
  username: 'member@example.com',
  firstName: 'Member',
  lastName: 'User',
  admin: false
};

// Données de test pour un utilisateur administrateur
const adminSessionInformation: SessionInformation = {
  ...sessionInformation,
  admin: true
};

// Session de base pour les tests (utilisateur non inscrit initialement)
const baseSession: Session = {
  id: 10,
  name: 'sunrise flow',
  description: 'Wake up gently with yoga.',
  date: new Date('2024-06-01T08:00:00Z'),
  teacher_id: 5,
  users: [], // Aucun utilisateur inscrit initialement
  createdAt: new Date('2024-05-01T08:00:00Z'),
  updatedAt: new Date('2024-05-15T08:00:00Z')
};

// Session mise à jour avec l'utilisateur inscrit
const updatedSession: Session = {
  ...baseSession,
  users: [3] // L'utilisateur (id: 3) s'inscrit
};

// Données de test pour le professeur
const teacher: Teacher = {
  id: 5,
  firstName: 'Alex',
  lastName: 'Martin',
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z')
};

describe('DetailComponent integration', () => {
  // Variables pour les éléments de test
  let fixture: ComponentFixture<DetailComponent>;
  let component: DetailComponent;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;
  let router: Router;

  // Configuration du module de test avant chaque test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailComponent], // Composant de détail de session à tester
      imports: [
        HttpClientTestingModule, // Mock des appels HTTP
        ReactiveFormsModule, // Module pour les formulaires réactifs
        MatCardModule, // Modules Material UI nécessaires
        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        FlexLayoutModule,
        RouterTestingModule, // Mock du routeur Angular
        NoopAnimationsModule // Désactive les animations pour les tests
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
              paramMap: convertToParamMap({ id: String(baseSession.id) })
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
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
  }

  /**
   * Vérifie le chargement des détails de la session et du professeur
   * Ce test valide le flux complet de récupération et d'affichage des données depuis l'API
   */
  it('should load the session and teacher details', () => {
    // Arrange: Initialisation du composant avec un membre connecté
    sessionService.sessionInformation = sessionInformation;
    sessionService.isLogged = true;

    createComponent();
    fixture.detectChanges();

    // Interception et simulation des requêtes API pour la session et le professeur
    const sessionRequest = httpMock.expectOne(`api/session/${baseSession.id}`);
    expect(sessionRequest.request.method).toBe('GET');
    sessionRequest.flush(baseSession); // Retour des données de la session

    const teacherRequest = httpMock.expectOne(`api/teacher/${baseSession.teacher_id}`);
    expect(teacherRequest.request.method).toBe('GET');
    teacherRequest.flush(teacher); // Retour des données du professeur

    fixture.detectChanges();

    // Assert: Le composant affiche les données récupérées comme le template le ferait en production
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(component.session).toEqual(baseSession);
    expect(component.teacher).toEqual(teacher);
    expect(nativeElement.querySelector('h1')?.textContent).toContain('Sunrise Flow');
    expect(nativeElement.querySelector('.description')?.textContent).toContain(baseSession.description);
  });

  /**
   * Vérifie la bascule d'état de participation basée sur les réponses API
   * Ce test valide le cycle complet inscription -> désinscription avec actualisation des données
   */
  it('should toggle participation state based on API responses', () => {
    // Arrange: Démarrage avec un membre déjà participant
    sessionService.sessionInformation = sessionInformation;
    sessionService.isLogged = true;

    createComponent();
    fixture.detectChanges();

    // Chargement initial des données session et professeur
    httpMock.expectOne(`api/session/${baseSession.id}`).flush(baseSession);
    httpMock.expectOne(`api/teacher/${baseSession.teacher_id}`).flush(teacher);
    fixture.detectChanges();

    // Act: Appel de participate qui déclenche l'endpoint REST et rafraîchit la session
    component.participate();

    const participateRequest = httpMock.expectOne(`api/session/${baseSession.id}/participate/${sessionInformation.id}`);
    expect(participateRequest.request.method).toBe('POST');
    participateRequest.flush(null); // Confirmation de l'inscription

    // Rechargement des données après inscription
    httpMock.expectOne(`api/session/${baseSession.id}`).flush(updatedSession);
    httpMock.expectOne(`api/teacher/${baseSession.teacher_id}`).flush(teacher);
    fixture.detectChanges();

    // Assert: L'état reflète maintenant une participation réussie
    expect(component.isParticipate).toBe(true);
    expect(component.session?.users).toEqual(updatedSession.users);

    // Act: Appel de unParticipate et rafraîchissement des données à nouveau
    component.unParticipate();

    const unParticipateRequest = httpMock.expectOne(`api/session/${baseSession.id}/participate/${sessionInformation.id}`);
    expect(unParticipateRequest.request.method).toBe('DELETE');
    unParticipateRequest.flush(null); // Confirmation de la désinscription

    // Rechargement des données après désinscription
    httpMock.expectOne(`api/session/${baseSession.id}`).flush(baseSession);
    httpMock.expectOne(`api/teacher/${baseSession.teacher_id}`).flush(teacher);
    fixture.detectChanges();

    // Assert: L'utilisateur est marqué comme non-participant après l'aller-retour API
    expect(component.isParticipate).toBe(false);
  });

  /**
   * Vérifie la suppression de session et redirection quand un admin déclenche la suppression
   * Ce test valide le flux complet : suppression API -> notification -> navigation (réservé aux administrateurs)
   */
  it('should delete the session and redirect when admin triggers deletion', async () => {
    // Arrange: Rendu de la page en tant qu'administrateur
    sessionService.sessionInformation = adminSessionInformation;
    sessionService.isLogged = true;

    createComponent();
    fixture.detectChanges();

    // Chargement initial des données session et professeur
    httpMock.expectOne(`api/session/${baseSession.id}`).flush(baseSession);
    httpMock.expectOne(`api/teacher/${baseSession.teacher_id}`).flush(teacher);
    fixture.detectChanges();

    // Préparation des spies pour surveiller les notifications et la navigation
    const snackBar = TestBed.inject(MatSnackBar);
    const snackBarSpy = jest.spyOn(snackBar, 'open');
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    // Act: Déclenchement de la suppression et fourniture de l'accusé de réception du backend
    component.delete();

    const deleteRequest = httpMock.expectOne(`api/session/${baseSession.id}`);
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null); // Confirmation de la suppression

    await fixture.whenStable();

    // Assert: Le feedback utilisateur et la navigation correspondent au comportement de production
    expect(snackBarSpy).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });
});
