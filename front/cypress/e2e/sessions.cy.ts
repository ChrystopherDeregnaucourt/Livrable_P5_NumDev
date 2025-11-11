/// <reference types="cypress" />

// Tests de la gestion des sessions
describe('Sessions spec', () => {
  // Avant chaque test, on se connecte en tant qu'administrateur
  beforeEach(() => {
    // Simulation de la connexion
    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'yoga@studio.com',
        firstName: 'Admin',
        lastName: 'Admin',
        admin: true,
        token: 'fake-jwt-token'
      },
    }).as('loginRequest');

    cy.intercept('GET', '/api/session', {
      body: [
        {
          id: 1,
          name: 'Morning Yoga',
          description: 'Start your day with energy',
          date: '2024-12-01T08:00:00',
          teacher_id: 1,
          users: [1, 2],
          createdAt: '2024-11-01T00:00:00',
          updatedAt: '2024-11-01T00:00:00'
        },
        {
          id: 2,
          name: 'Evening Relaxation',
          description: 'Wind down your day',
          date: '2024-12-01T18:00:00',
          teacher_id: 2,
          users: [1],
          createdAt: '2024-11-01T00:00:00',
          updatedAt: '2024-11-01T00:00:00'
        }
      ]
    }).as('sessionsRequest');

    cy.visit('/login');
    cy.get('input[formControlName=email]').type("yoga@studio.com");
    cy.get('input[formControlName=password]').type("test!1234{enter}{enter}");
    cy.wait('@loginRequest');
    cy.wait('@sessionsRequest');
  });

  // Tests de la liste des sessions
  describe('Sessions List', () => {
    // Vérifie que la liste des sessions s'affiche
    it('should display sessions list', () => {
      cy.url().should('include', '/sessions');
      cy.get('.mat-card').should('have.length', 3);
      cy.contains('Morning Yoga').should('be.visible');
      cy.contains('Evening Relaxation').should('be.visible');
    });

    // Vérifie que le bouton de création est visible pour l'administrateur
    it('should display create button for admin', () => {
      cy.contains('button', 'Create').should('be.visible');
    });

    // Vérifie la navigation vers le détail d'une session via le bouton Edit
    it('should navigate to session detail on Edit click', () => {
      cy.intercept('GET', '/api/session/1', {
        body: {
          id: 1,
          name: 'Morning Yoga',
          description: 'Start your day with energy',
          date: '2024-12-01T08:00:00',
          teacher_id: 1,
          users: [1, 2],
          createdAt: '2024-11-01T00:00:00',
          updatedAt: '2024-11-01T00:00:00'
        }
      }).as('sessionDetailRequest');

      cy.get('.mat-card').first().contains('button', 'Detail').click();
      cy.wait('@sessionDetailRequest');
      cy.url().should('include', '/sessions/detail/1');
    });

    // Vérifie la navigation vers la page de création de session
    it('should navigate to create session page', () => {
      cy.intercept('GET', '/api/teacher', {
        body: [
          { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' },
          { id: 2, firstName: 'Hélène', lastName: 'THIERCELIN' }
        ]
      }).as('teachersRequest');

      cy.contains('button', 'Create').click();
      cy.wait('@teachersRequest');
      cy.url().should('include', '/sessions/create');
    });
  });

  // Tests du détail d'une session
  describe('Session Detail', () => {
    // Avant chaque test, on navigue vers le détail de la première session
    beforeEach(() => {
      cy.intercept('GET', '/api/session/1', {
        body: {
          id: 1,
          name: 'Morning Yoga',
          description: 'Start your day with energy',
          date: '2024-12-01T08:00:00',
          teacher_id: 1,
          users: [1, 2],
          createdAt: '2024-11-01T00:00:00',
          updatedAt: '2024-11-01T00:00:00'
        }
      }).as('sessionDetailRequest');

      cy.intercept('GET', '/api/teacher/1', {
        body: {
          id: 1,
          firstName: 'Margot',
          lastName: 'DELAHAYE',
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        }
      }).as('teacherRequest');

      cy.get('.mat-card').first().contains('button', 'Detail').click();
      cy.wait('@sessionDetailRequest');
      cy.wait('@teacherRequest');
    });

    // Vérifie que les détails de la session s'affichent correctement
    it('should display session details', () => {
      cy.contains('Morning Yoga').should('be.visible');
      cy.contains('Start your day with energy').should('be.visible');
      cy.contains('Margot DELAHAYE').should('be.visible');
      cy.contains('2 attendees').should('be.visible');
    });

    // Vérifie que l'administrateur peut supprimer une session
    it('should allow admin to delete session', () => {
      cy.intercept('DELETE', '/api/session/1', {
        statusCode: 200
      }).as('deleteSessionRequest');

      cy.contains('button', 'Delete').click();
      cy.wait('@deleteSessionRequest');
      cy.url().should('include', '/sessions');
    });

    // Vérifie la navigation retour vers la liste des sessions
    it('should navigate back to sessions list', () => {
      cy.contains('button', 'arrow_back').click();
      cy.url().should('include', '/sessions');
    });
  });

  // Tests de la création d'une session
  describe('Session Create', () => {
    // Avant chaque test, on navigue vers la page de création
    beforeEach(() => {
      cy.intercept('GET', '/api/teacher', {
        body: [
          { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' },
          { id: 2, firstName: 'Hélène', lastName: 'THIERCELIN' }
        ]
      }).as('teachersRequest');

      cy.contains('button', 'Create').click();
      cy.wait('@teachersRequest');
    });

    // Vérifie que le formulaire de création s'affiche
    it('should display create form', () => {
      cy.url().should('include', '/sessions/create');
      cy.get('input[formControlName=name]').should('be.visible');
      cy.get('input[formControlName=date]').should('be.visible');
      cy.get('mat-select[formControlName=teacher_id]').should('be.visible');
      cy.get('textarea[formControlName=description]').should('be.visible');
      cy.get('button[type=submit]').should('be.visible').and('contain', 'Save');
    });

    // Vérifie qu'une session peut être créée avec succès
    it('should create session successfully', () => {
      cy.intercept('POST', '/api/session', {
        statusCode: 200,
        body: {
          id: 3,
          name: 'New Session',
          description: 'New session description',
          date: '2024-12-15T10:00:00',
          teacher_id: 1,
          users: [],
          createdAt: '2024-11-06T00:00:00',
          updatedAt: '2024-11-06T00:00:00'
        }
      }).as('createSessionRequest');

      // Remplissage du formulaire de création
      cy.get('input[formControlName=name]').type('New Session');
      cy.get('input[formControlName=date]').type('2024-12-15');
      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').first().click();
      cy.get('textarea[formControlName=description]').type('New session description');
      cy.get('button[type=submit]').click();

      // Vérification de la redirection après la création
      cy.wait('@createSessionRequest');
      cy.url().should('include', '/sessions');
    });

    // Vérifie que tous les champs sont obligatoires
    it('should require all fields', () => {
      cy.get('button[type=submit]').should('be.disabled');
      
      cy.get('input[formControlName=name]').type('Test Session');
      cy.get('button[type=submit]').should('be.disabled');
      
      cy.get('input[formControlName=date]').type('2024-12-15');
      cy.get('button[type=submit]').should('be.disabled');
      
      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').first().click();
      cy.get('button[type=submit]').should('be.disabled');
      
      cy.get('textarea[formControlName=description]').type('Description');
      cy.get('button[type=submit]').should('not.be.disabled');
    });
  });

  // Tests de la modification d'une session
  describe('Session Update', () => {
    // Vérifie que le formulaire de modification affiche les données existantes
    it('should display update form with existing data', () => {
      cy.intercept('GET', '/api/session/1', {
        body: {
          id: 1,
          name: 'Morning Yoga',
          description: 'Start your day with energy',
          date: '2024-12-01T08:00:00',
          teacher_id: 1,
          users: [1, 2],
          createdAt: '2024-11-01T00:00:00',
          updatedAt: '2024-11-01T00:00:00'
        }
      }).as('sessionDetailForUpdate');

      cy.intercept('GET', '/api/teacher', {
        body: [
          { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' },
          { id: 2, firstName: 'Hélène', lastName: 'THIERCELIN' }
        ]
      }).as('teachersRequestForUpdate');

      // Navigation vers la page de modification depuis la liste
      cy.get('.mat-card').first().contains('button', 'Edit').click();
      cy.wait('@sessionDetailForUpdate');
      cy.wait('@teachersRequestForUpdate');
      
      // Vérification que les données existantes sont affichées
      cy.url().should('include', '/sessions/update/1');
      cy.get('input[formControlName=name]').should('have.value', 'Morning Yoga');
      cy.get('textarea[formControlName=description]').should('have.value', 'Start your day with energy');
      cy.get('button[type=submit]').should('be.visible').and('contain', 'Save');
    });

    // Vérifie qu'une session peut être modifiée avec succès
    it('should update session successfully', () => {
      cy.intercept('GET', '/api/session/1', {
        body: {
          id: 1,
          name: 'Morning Yoga',
          description: 'Start your day with energy',
          date: '2024-12-01T08:00:00',
          teacher_id: 1,
          users: [1, 2],
          createdAt: '2024-11-01T00:00:00',
          updatedAt: '2024-11-01T00:00:00'
        }
      }).as('sessionDetailForUpdate2');

      cy.intercept('GET', '/api/teacher', {
        body: [
          { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' },
          { id: 2, firstName: 'Hélène', lastName: 'THIERCELIN' }
        ]
      }).as('teachersRequestForUpdate2');

      cy.intercept('PUT', '/api/session/1', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'Updated Morning Yoga',
          description: 'Updated description',
          date: '2024-12-01T08:00:00',
          teacher_id: 2,
          users: [1, 2],
          createdAt: '2024-11-01T00:00:00',
          updatedAt: '2024-11-06T00:00:00'
        }
      }).as('updateSessionRequest');

      // Navigation vers la page de modification depuis la liste
      cy.get('.mat-card').first().contains('button', 'Edit').click();
      cy.wait('@sessionDetailForUpdate2');
      cy.wait('@teachersRequestForUpdate2');
      
      // Modification des données et soumission
      cy.get('input[formControlName=name]').clear().type('Updated Morning Yoga');
      cy.get('textarea[formControlName=description]').clear().type('Updated description');
      cy.get('button[type=submit]').click();

      // Vérification de la redirection après la mise à jour
      cy.wait('@updateSessionRequest');
      cy.url().should('include', '/sessions');
    });
  });

  // Tests de la participation aux sessions
  describe('Session Participation', () => {
    // Avant chaque test, on se connecte en tant qu'utilisateur régulier
    beforeEach(() => {
      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 2,
          username: 'user@test.com',
          firstName: 'User',
          lastName: 'Test',
          admin: false,
          token: 'fake-jwt-token'
        },
      }).as('loginUserRequest');

      cy.intercept('GET', '/api/session', {
        body: [
          {
            id: 1,
            name: 'Morning Yoga',
            description: 'Start your day with energy',
            date: '2024-12-01T08:00:00',
            teacher_id: 1,
            users: [],
            createdAt: '2024-11-01T00:00:00',
            updatedAt: '2024-11-01T00:00:00'
          }
        ]
      }).as('sessionsRequest');

      cy.visit('/login');
      cy.get('input[formControlName=email]').clear().type("user@test.com");
      cy.get('input[formControlName=password]').clear().type("test!1234{enter}{enter}");
      cy.wait('@loginUserRequest');
      cy.wait('@sessionsRequest');
    });

    // Vérifie qu'un utilisateur peut participer à une session
    it('should allow user to participate in session', () => {
      cy.intercept('GET', '/api/session/1', {
        body: {
          id: 1,
          name: 'Morning Yoga',
          description: 'Start your day with energy',
          date: '2024-12-01T08:00:00',
          teacher_id: 1,
          users: [],
          createdAt: '2024-11-01T00:00:00',
          updatedAt: '2024-11-01T00:00:00'
        }
      }).as('sessionDetailRequest');

      cy.intercept('GET', '/api/teacher/1', {
        body: {
          id: 1,
          firstName: 'Margot',
          lastName: 'DELAHAYE'
        }
      }).as('teacherRequest');

      cy.intercept('POST', '/api/session/1/participate/2', {
        statusCode: 200
      }).as('participateRequest');

      // Navigation vers le détail et participation
      cy.get('.mat-card').first().contains('button', 'Detail').click();
      cy.wait('@sessionDetailRequest');
      cy.wait('@teacherRequest');

      cy.contains('button', 'Participate').click();
      cy.wait('@participateRequest');
    });

    // Vérifie qu'un utilisateur peut se désinscrire d'une session
    it('should allow user to unparticipate from session', () => {
      cy.intercept('GET', '/api/session/1', {
        body: {
          id: 1,
          name: 'Morning Yoga',
          description: 'Start your day with energy',
          date: '2024-12-01T08:00:00',
          teacher_id: 1,
          users: [2],
          createdAt: '2024-11-01T00:00:00',
          updatedAt: '2024-11-01T00:00:00'
        }
      }).as('sessionDetailRequest');

      cy.intercept('GET', '/api/teacher/1', {
        body: {
          id: 1,
          firstName: 'Margot',
          lastName: 'DELAHAYE'
        }
      }).as('teacherRequest');

      cy.intercept('DELETE', '/api/session/1/participate/2', {
        statusCode: 200
      }).as('unparticipateRequest');

      // Navigation vers le détail et désinscription
      cy.get('.mat-card').first().contains('button', 'Detail').click();
      cy.wait('@sessionDetailRequest');
      cy.wait('@teacherRequest');

      cy.contains('button', 'Do not participate').click();
      cy.wait('@unparticipateRequest');
    });
  });
});
