/// <reference types="jest" />

import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { SessionService } from 'src/app/services/session.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { Teacher } from 'src/app/interfaces/teacher.interface';
import { SessionApiService } from '../../services/session-api.service';
import { Session } from '../../interfaces/session.interface';
import { DetailComponent } from './detail.component';

/*
* Ces tests couvrent :
* 1. Initialisation du composant
* 2. Chargement initial (ngOnInit)
* 3. Navigation
* 4. Suppression de session (delete)
* 5. Participation / Désinscription (participate / unParticipate)
* 6. Mise à jour du statut de participation
* 7. Fonctionnalités admin
*/

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let mockSessionApiService: jest.Mocked<Partial<SessionApiService>>;
  let mockTeacherService: jest.Mocked<Partial<TeacherService>>;
  let mockSessionService: Partial<SessionService>;
  let mockRouter: jest.Mocked<Partial<Router>>;
  let mockMatSnackBar: jest.Mocked<Partial<MatSnackBar>>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  const mockSession: Session = {
    id: 1,
    name: 'Yoga Flow',
    description: 'Session de yoga dynamique pour tous niveaux',
    date: new Date('2024-12-01'),
    teacher_id: 1,
    users: [1, 2, 3],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  };

  const mockTeacher: Teacher = {
    id: 1,
    lastName: 'Martin',
    firstName: 'Sophie',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  };

  beforeEach(async () => {
    // Mock SessionApiService
    mockSessionApiService = {
      detail: jest.fn().mockReturnValue(of(mockSession)),
      delete: jest.fn().mockReturnValue(of({})),
      participate: jest.fn().mockReturnValue(of(undefined)),
      unParticipate: jest.fn().mockReturnValue(of(undefined))
    } as jest.Mocked<Partial<SessionApiService>>;

    // Mock TeacherService
    mockTeacherService = {
      detail: jest.fn().mockReturnValue(of(mockTeacher))
    } as jest.Mocked<Partial<TeacherService>>;

    // Mock SessionService
    mockSessionService = {
      sessionInformation: {
        token: 'test-token',
        type: 'Bearer',
        id: 1,
        username: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      },
      isLogged: true
    };

    // Mock Router
    mockRouter = {
      navigate: jest.fn()
    } as jest.Mocked<Partial<Router>>;

    // Mock MatSnackBar
    mockMatSnackBar = {
      open: jest.fn()
    } as jest.Mocked<Partial<MatSnackBar>>;

    // Mock ActivatedRoute
    mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ id: '1' })
      }
    } as ActivatedRoute;

    await TestBed.configureTestingModule({
      declarations: [DetailComponent],
      imports: [
        HttpClientModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        RouterTestingModule
      ],
      providers: [
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockMatSnackBar },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Constructor initialization', () => {
    it('should initialize sessionId from route params', () => {
      expect(component.sessionId).toBe('1');
    });

    it('should initialize userId from session information', () => {
      expect(component.userId).toBe('1');
    });

    it('should initialize isAdmin from session information', () => {
      expect(component.isAdmin).toBe(false);
    });

    it('should set isAdmin to true for admin users', () => {
      // Arrange
      mockSessionService.sessionInformation!.admin = true;

      // Act - re-create component
      const newComponent = new DetailComponent(
        mockActivatedRoute as ActivatedRoute,
        {} as FormBuilder,
        mockSessionService as SessionService,
        mockSessionApiService as SessionApiService,
        mockTeacherService as TeacherService,
        mockMatSnackBar as MatSnackBar,
        mockRouter as Router
      );

      // Assert
      expect(newComponent.isAdmin).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should load session details on init', () => {
      // Act
      fixture.detectChanges();

      // Assert
      expect(mockSessionApiService.detail).toHaveBeenCalledWith('1');
      expect(component.session).toEqual(mockSession);
    });

    it('should load teacher details after session is loaded', (done) => {
      // Act
      fixture.detectChanges();

      // Assert
      setTimeout(() => {
        expect(mockTeacherService.detail).toHaveBeenCalledWith('1');
        expect(component.teacher).toEqual(mockTeacher);
        done();
      }, 100);
    });

    it('should set isParticipate to true if user is in session', (done) => {
      // Arrange - user id 1 is in users array [1, 2, 3]
      mockSessionService.sessionInformation!.id = 1;

      // Act
      fixture.detectChanges();

      // Assert
      setTimeout(() => {
        expect(component.isParticipate).toBe(true);
        done();
      }, 100);
    });

    it('should set isParticipate to false if user is not in session', (done) => {
      // Arrange - user id 99 is NOT in users array [1, 2, 3]
      mockSessionService.sessionInformation!.id = 99;

      // Re-create component
      const newComponent = new DetailComponent(
        mockActivatedRoute as ActivatedRoute,
        {} as FormBuilder,
        mockSessionService as SessionService,
        mockSessionApiService as SessionApiService,
        mockTeacherService as TeacherService,
        mockMatSnackBar as MatSnackBar,
        mockRouter as Router
      );

      // Act
      newComponent.ngOnInit();

      // Assert
      setTimeout(() => {
        expect(newComponent.isParticipate).toBe(false);
        done();
      }, 100);
    });
  });

  describe('back', () => {
    it('should navigate back in browser history', () => {
      // Arrange
      const historySpy = jest.spyOn(window.history, 'back');

      // Act
      component.back();

      // Assert
      expect(historySpy).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete session and show success message', (done) => {
      // Act
      component.delete();

      // Assert
      setTimeout(() => {
        expect(mockSessionApiService.delete).toHaveBeenCalledWith('1');
        expect(mockMatSnackBar.open).toHaveBeenCalledWith(
          'Session deleted !',
          'Close',
          { duration: 3000 }
        );
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
        done();
      }, 100);
    });

    it('should redirect to sessions list after deletion', (done) => {
      // Act
      component.delete();

      // Assert
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
        done();
      }, 100);
    });

    it('should delete correct session based on sessionId', () => {
      // Arrange
      component.sessionId = '42';

      // Act
      component.delete();

      // Assert
      expect(mockSessionApiService.delete).toHaveBeenCalledWith('42');
    });
  });

  describe('participate', () => {
    it('should add user to session', (done) => {
      // Arrange
      fixture.detectChanges();

      // Act
      component.participate();

      // Assert
      setTimeout(() => {
        expect(mockSessionApiService.participate).toHaveBeenCalledWith('1', '1');
        expect(mockSessionApiService.detail).toHaveBeenCalledTimes(2); // une fois dans ngOnInit, une fois après participate
        done();
      }, 100);
    });

    it('should refresh session data after participation', (done) => {
      // Arrange
      fixture.detectChanges();
      jest.clearAllMocks();

      // Act
      component.participate();

      // Assert
      setTimeout(() => {
        expect(mockSessionApiService.detail).toHaveBeenCalledWith('1');
        done();
      }, 100);
    });

    it('should use correct user and session ids', () => {
      // Arrange
      component.sessionId = '10';
      component.userId = '20';

      // Act
      component.participate();

      // Assert
      expect(mockSessionApiService.participate).toHaveBeenCalledWith('10', '20');
    });
  });

  describe('unParticipate', () => {
    it('should remove user from session', (done) => {
      // Arrange
      fixture.detectChanges();

      // Act
      component.unParticipate();

      // Assert
      setTimeout(() => {
        expect(mockSessionApiService.unParticipate).toHaveBeenCalledWith('1', '1');
        expect(mockSessionApiService.detail).toHaveBeenCalledTimes(2); // une fois dans ngOnInit, une fois après unParticipate
        done();
      }, 100);
    });

    it('should refresh session data after unparticipation', (done) => {
      // Arrange
      fixture.detectChanges();
      jest.clearAllMocks();

      // Act
      component.unParticipate();

      // Assert
      setTimeout(() => {
        expect(mockSessionApiService.detail).toHaveBeenCalledWith('1');
        done();
      }, 100);
    });

    it('should use correct user and session ids', () => {
      // Arrange
      component.sessionId = '15';
      component.userId = '25';

      // Act
      component.unParticipate();

      // Assert
      expect(mockSessionApiService.unParticipate).toHaveBeenCalledWith('15', '25');
    });
  });

  describe('fetchSession (private)', () => {
    it('should update isParticipate when user joins', (done) => {
      // Arrange - Session avec l'utilisateur 1
      const sessionWithUser: Session = { ...mockSession, users: [1, 2] };
      (mockSessionApiService.detail as jest.Mock).mockReturnValue(of(sessionWithUser));
      mockSessionService.sessionInformation!.id = 1;

      // Act
      component.ngOnInit();

      // Assert
      setTimeout(() => {
        expect(component.isParticipate).toBe(true);
        done();
      }, 100);
    });

    it('should update isParticipate when user leaves', (done) => {
      // Arrange - Session sans l'utilisateur 1
      const sessionWithoutUser: Session = { ...mockSession, users: [2, 3] };
      (mockSessionApiService.detail as jest.Mock).mockReturnValue(of(sessionWithoutUser));
      mockSessionService.sessionInformation!.id = 1;

      // Act
      component.ngOnInit();

      // Assert
      setTimeout(() => {
        expect(component.isParticipate).toBe(false);
        done();
      }, 100);
    });
  });
});
