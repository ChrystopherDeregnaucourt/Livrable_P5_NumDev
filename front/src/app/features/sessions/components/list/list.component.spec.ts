/// <reference types="jest" />

import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';
import { SessionService } from 'src/app/services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { Session } from '../../interfaces/session.interface';
import { ListComponent } from './list.component';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let mockSessionService: Partial<SessionService>;
  let mockSessionApiService: jest.Mocked<Partial<SessionApiService>>;

  const mockSessions: Session[] = [
    {
      id: 1,
      name: 'Yoga Flow',
      description: 'Session de yoga dynamique',
      date: new Date('2024-12-01'),
      teacher_id: 1,
      users: [1, 2, 3],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 2,
      name: 'Meditation',
      description: 'Session de méditation guidée',
      date: new Date('2024-12-05'),
      teacher_id: 2,
      users: [2, 4],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-16')
    },
    {
      id: 3,
      name: 'Yoga Restorative',
      description: 'Session de yoga doux et réparateur',
      date: new Date('2024-12-10'),
      teacher_id: 1,
      users: [1],
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-17')
    }
  ];

  beforeEach(async () => {
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

    // Mock SessionApiService
    mockSessionApiService = {
      all: jest.fn().mockReturnValue(of(mockSessions))
    } as jest.Mocked<Partial<SessionApiService>>;

    await TestBed.configureTestingModule({
      declarations: [ListComponent],
      imports: [
        HttpClientModule,
        MatCardModule,
        MatIconModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sessions$ Observable', () => {
    it('should load all sessions on initialization', (done) => {
      // Act
      fixture.detectChanges();

      // Assert
      component.sessions$.subscribe((sessions) => {
        expect(sessions).toEqual(mockSessions);
        done();
      });
    });

    it('should call SessionApiService.all() when component is created', () => {
      // Act
      fixture.detectChanges();

      // Assert
      expect(mockSessionApiService.all).toHaveBeenCalled();
    });

    it('should contain correct session data', (done) => {
      // Act
      fixture.detectChanges();

      // Assert
      component.sessions$.subscribe((sessions) => {
        expect(sessions[0].name).toBe('Yoga Flow');
        expect(sessions[1].name).toBe('Meditation');
        expect(sessions[2].name).toBe('Yoga Restorative');
        
        expect(sessions[0].users.length).toBe(3);
        expect(sessions[1].users.length).toBe(2);
        expect(sessions[2].users.length).toBe(1);
        done();
      });
    });

    it('should handle empty sessions list', (done) => {
      // Arrange
      (mockSessionApiService.all as jest.Mock).mockReturnValue(of([]));
      
      // Re-créer le composant pour appliquer le nouveau mock
      component = new ListComponent(
        mockSessionService as SessionService,
        mockSessionApiService as SessionApiService
      );

      // Act & Assert
      component.sessions$.subscribe((sessions) => {
        expect(sessions).toEqual([]);
        done();
      });
    });
  });

  describe('user getter', () => {
    it('should return session information from SessionService', () => {
      // Act
      const user = component.user;

      // Assert
      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(user?.username).toBe('test@test.com');
      expect(user?.firstName).toBe('John');
      expect(user?.lastName).toBe('Doe');
      expect(user?.admin).toBe(false);
    });

    it('should return undefined if no session information', () => {
      // Arrange
      mockSessionService.sessionInformation = undefined;

      // Act
      const user = component.user;

      // Assert
      expect(user).toBeUndefined();
    });

    it('should return admin user information correctly', () => {
      // Arrange
      mockSessionService.sessionInformation = {
        token: 'admin-token',
        type: 'Bearer',
        id: 2,
        username: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true
      };

      // Act
      const user = component.user;

      // Assert
      expect(user).toBeDefined();
      expect(user?.admin).toBe(true);
      expect(user?.username).toBe('admin@test.com');
    });

    it('should always return current session information', () => {
      // Phase 1
      let user = component.user;
      expect(user?.id).toBe(1);

      // Phase 2 - changement de session
      mockSessionService.sessionInformation = {
        token: 'new-token',
        type: 'Bearer',
        id: 99,
        username: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
        admin: false
      };

      user = component.user;
      expect(user?.id).toBe(99);
      expect(user?.username).toBe('newuser@test.com');
    });
  });

  describe('Session data structure', () => {
    it('should have valid dates for all sessions', (done) => {
      // Act
      fixture.detectChanges();

      // Assert
      component.sessions$.subscribe((sessions) => {
        sessions.forEach((session) => {
          expect(session.date).toBeInstanceOf(Date);
          expect(session.createdAt).toBeInstanceOf(Date);
          expect(session.updatedAt).toBeInstanceOf(Date);
        });
        done();
      });
    });

    it('should have teacher_id for all sessions', (done) => {
      // Act
      fixture.detectChanges();

      // Assert
      component.sessions$.subscribe((sessions) => {
        sessions.forEach((session) => {
          expect(session.teacher_id).toBeDefined();
          expect(typeof session.teacher_id).toBe('number');
          expect(session.teacher_id).toBeGreaterThan(0);
        });
        done();
      });
    });
  });
});
