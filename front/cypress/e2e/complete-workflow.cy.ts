/// <reference types="cypress" />

describe('Complete User Journey spec', () => {
  describe('New User Complete Workflow', () => {
    it('should complete full user journey: register -> login -> view sessions -> participate -> view profile -> logout', () => {
      // Étape 1 : Inscription d'un nouvel utilisateur
      cy.visit('/register');
      
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 200,
        body: {
          message: 'User registered successfully!'
        }
      }).as('registerRequest');

      cy.get('input[formControlName=firstName]').type("Jane");
      cy.get('input[formControlName=lastName]').type("Smith");
      cy.get('input[formControlName=email]').type("jane.smith@test.com");
      cy.get('input[formControlName=password]').type("password123");
      cy.get('button[type=submit]').click();
      cy.wait('@registerRequest');
      
      // Étape 2 : Connexion avec les nouveaux identifiants
      // Après l'inscription, navigation vers la page de connexion
      cy.visit('/login');
      
      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 3,
          username: 'jane.smith@test.com',
          firstName: 'Jane',
          lastName: 'Smith',
          admin: false,
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
            users: [],
            createdAt: '2024-11-01T00:00:00',
            updatedAt: '2024-11-01T00:00:00'
          }
        ]
      }).as('sessionsRequest');

      cy.get('input[formControlName=email]').type("jane.smith@test.com");
      cy.get('input[formControlName=password]').type("password123{enter}{enter}");
      cy.wait('@loginRequest');
      cy.wait('@sessionsRequest');

      // Étape 3 : Affichage de la liste des sessions
      cy.url().should('include', '/sessions');
      cy.contains('Morning Yoga').should('be.visible');

      // Étape 4 : Affichage du détail de la session et participation
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

      cy.intercept('POST', '/api/session/1/participate/3', {
        statusCode: 200
      }).as('participateRequest');

      cy.get('.mat-card').first().contains('button', 'Detail').click();
      cy.wait('@sessionDetailRequest');
      cy.wait('@teacherRequest');

      cy.contains('button', 'Participate').should('be.visible');
      cy.contains('button', 'Participate').click();
      cy.wait('@participateRequest');

      // Étape 5 : Retour aux sessions et affichage du profil
      cy.contains('button', 'arrow_back').click();
      cy.url().should('include', '/sessions');

      cy.intercept('GET', '/api/user/3', {
        body: {
          id: 3,
          email: 'jane.smith@test.com',
          lastName: 'Smith',
          firstName: 'Jane',
          admin: false,
          createdAt: '2024-11-06T00:00:00',
          updatedAt: '2024-11-06T00:00:00'
        }
      }).as('userRequest');

      cy.get('span[routerLink=me]').click();
      cy.wait('@userRequest');

      cy.url().should('include', '/me');
      cy.contains('Name: Jane SMITH').should('be.visible');
      cy.contains('Email: jane.smith@test.com').should('be.visible');

      // Étape 6 : Déconnexion
      cy.get('button[mat-icon-button]').contains('arrow_back').click();
      cy.get('span[class*="link"]').contains('Logout').click();
      cy.url().should('include', '/');
    });
  });

  describe('Admin Complete Workflow', () => {
    it('should complete full admin journey: login -> create session -> update session -> delete session -> logout', () => {
      // Étape 1 : Connexion en tant qu'administrateur
      cy.visit('/login');

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
            name: 'Existing Session',
            description: 'Existing description',
            date: '2024-12-01T08:00:00',
            teacher_id: 1,
            users: [2],
            createdAt: '2024-11-01T00:00:00',
            updatedAt: '2024-11-01T00:00:00'
          }
        ]
      }).as('sessionsRequest');

      cy.get('input[formControlName=email]').type("yoga@studio.com");
      cy.get('input[formControlName=password]').type("test!1234{enter}{enter}");
      cy.wait('@loginRequest');
      cy.wait('@sessionsRequest');

      // Étape 2 : Création d'une nouvelle session
      cy.url().should('include', '/sessions');
      cy.contains('button', 'Create').should('be.visible');

      cy.intercept('GET', '/api/teacher', {
        body: [
          { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' },
          { id: 2, firstName: 'Hélène', lastName: 'THIERCELIN' }
        ]
      }).as('teachersRequest');

      cy.contains('button', 'Create').click();

      cy.intercept('POST', '/api/session', {
        statusCode: 200,
        body: {
          id: 2,
          name: 'New Yoga Session',
          description: 'Brand new session',
          date: '2024-12-15T10:00:00',
          teacher_id: 1,
          users: [],
          createdAt: '2024-11-06T00:00:00',
          updatedAt: '2024-11-06T00:00:00'
        }
      }).as('createSessionRequest');

      cy.intercept('GET', '/api/session', {
        body: [
          {
            id: 1,
            name: 'Existing Session',
            description: 'Existing description',
            date: '2024-12-01T08:00:00',
            teacher_id: 1,
            users: [2],
            createdAt: '2024-11-01T00:00:00',
            updatedAt: '2024-11-01T00:00:00'
          },
          {
            id: 2,
            name: 'New Yoga Session',
            description: 'Brand new session',
            date: '2024-12-15T10:00:00',
            teacher_id: 1,
            users: [],
            createdAt: '2024-11-06T00:00:00',
            updatedAt: '2024-11-06T00:00:00'
          }
        ]
      }).as('sessionsRequestAfterCreate');

      cy.get('input[formControlName=name]').type('New Yoga Session');
      cy.get('input[formControlName=date]').type('2024-12-15');
      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').first().click();
      cy.get('textarea[formControlName=description]').type('Brand new session');
      cy.get('button[type=submit]').click();

      cy.wait('@createSessionRequest');
      cy.wait('@sessionsRequestAfterCreate');
      cy.url().should('include', '/sessions');
      cy.contains('New Yoga Session').should('be.visible');

      // Étape 3 : Mise à jour de la session créée
      cy.intercept('GET', '/api/session/2', {
        body: {
          id: 2,
          name: 'New Yoga Session',
          description: 'Brand new session',
          date: '2024-12-15T10:00:00',
          teacher_id: 1,
          users: [],
          createdAt: '2024-11-06T00:00:00',
          updatedAt: '2024-11-06T00:00:00'
        }
      }).as('sessionDetailForUpdate');

      cy.intercept('GET', '/api/teacher', {
        body: [
          { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' },
          { id: 2, firstName: 'Hélène', lastName: 'THIERCELIN' }
        ]
      }).as('teachersRequestForUpdate');

      // Clic sur le bouton Edit pour la session nouvellement créée
      cy.contains('.mat-card', 'New Yoga Session').contains('button', 'Edit').click();
      cy.wait('@sessionDetailForUpdate');
      cy.wait('@teachersRequestForUpdate');

      cy.intercept('PUT', '/api/session/2', {
        statusCode: 200,
        body: {
          id: 2,
          name: 'Updated Yoga Session',
          description: 'Updated description',
          date: '2024-12-15T10:00:00',
          teacher_id: 2,
          users: [],
          createdAt: '2024-11-06T00:00:00',
          updatedAt: '2024-11-06T12:00:00'
        }
      }).as('updateSessionRequest');
      
      // Interception de la liste des sessions pour retourner la session mise à jour AVANT la soumission
      cy.intercept('GET', '/api/session', {
        body: [
          {
            id: 1,
            name: 'Existing Session',
            description: 'Existing description',
            date: '2024-12-01T08:00:00',
            teacher_id: 1,
            users: [2],
            createdAt: '2024-11-01T00:00:00',
            updatedAt: '2024-11-01T00:00:00'
          },
          {
            id: 2,
            name: 'Updated Yoga Session',
            description: 'Updated description',
            date: '2024-12-15T10:00:00',
            teacher_id: 2,
            users: [],
            createdAt: '2024-11-06T00:00:00',
            updatedAt: '2024-11-06T12:00:00'
          }
        ]
      }).as('sessionsRequestAfterUpdate');

      cy.get('input[formControlName=name]').clear().type('Updated Yoga Session');
      cy.get('textarea[formControlName=description]').clear().type('Updated description');
      cy.get('button[type=submit]').click();

      cy.wait('@updateSessionRequest');
      cy.url().should('include', '/sessions');
      cy.wait('@sessionsRequestAfterUpdate');

      // Étape 4 : Affichage et suppression de la session
      cy.intercept('GET', '/api/session/2', {
        body: {
          id: 2,
          name: 'Updated Yoga Session',
          description: 'Updated description',
          date: '2024-12-15T10:00:00',
          teacher_id: 2,
          users: [],
          createdAt: '2024-11-06T00:00:00',
          updatedAt: '2024-11-06T12:00:00'
        }
      }).as('sessionDetailRequestForDelete');

      cy.intercept('GET', '/api/teacher/2', {
        body: {
          id: 2,
          firstName: 'Hélène',
          lastName: 'THIERCELIN'
        }
      }).as('teacherRequestForDelete');

      cy.intercept('DELETE', '/api/session/2', {
        statusCode: 200
      }).as('deleteSessionRequest');

      // Clic sur le bouton Detail pour la session mise à jour
      cy.contains('.mat-card', 'Updated Yoga Session').contains('button', 'Detail').click();
      cy.wait('@sessionDetailRequestForDelete');
      cy.wait('@teacherRequestForDelete');

      cy.contains('button', 'Delete').should('be.visible');
      cy.contains('button', 'Delete').click();
      cy.wait('@deleteSessionRequest');
      cy.url().should('include', '/sessions');

      // Étape 5 : Affichage du profil administrateur
      cy.intercept('GET', '/api/user/1', {
        body: {
          id: 1,
          email: 'yoga@studio.com',
          lastName: 'Admin',
          firstName: 'Admin',
          admin: true,
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        }
      }).as('userRequest');

      cy.get('span[routerLink=me]').click();
      cy.wait('@userRequest');
      cy.contains('You are admin').should('be.visible');
      cy.contains('Delete my account:').should('not.exist');

      // Étape 6 : Déconnexion
      cy.get('button[mat-icon-button]').contains('arrow_back').click();
      cy.get('span[class*="link"]').contains('Logout').click();
      cy.url().should('include', '/');
    });
  });

  describe('User Participation Workflow', () => {
    it('should allow user to participate and unparticipate in sessions', () => {
      // Connexion en tant qu'utilisateur
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 2,
          username: 'user@test.com',
          firstName: 'User',
          lastName: 'Test',
          admin: false,
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
            users: [],
            createdAt: '2024-11-01T00:00:00',
            updatedAt: '2024-11-01T00:00:00'
          },
          {
            id: 2,
            name: 'Evening Yoga',
            description: 'Relax in the evening',
            date: '2024-12-01T18:00:00',
            teacher_id: 2,
            users: [2],
            createdAt: '2024-11-01T00:00:00',
            updatedAt: '2024-11-01T00:00:00'
          }
        ]
      }).as('sessionsRequest');

      cy.get('input[formControlName=email]').type("user@test.com");
      cy.get('input[formControlName=password]').type("test!1234{enter}{enter}");
      cy.wait('@loginRequest');
      cy.wait('@sessionsRequest');

      // Participation à la première session
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
      }).as('session1DetailRequest');

      cy.intercept('GET', '/api/teacher/1', {
        body: {
          id: 1,
          firstName: 'Margot',
          lastName: 'DELAHAYE'
        }
      }).as('teacher1Request');

      cy.intercept('POST', '/api/session/1/participate/2', {
        statusCode: 200
      }).as('participateSession1Request');

      cy.get('.mat-card').first().contains('button', 'Detail').click();
      cy.wait('@session1DetailRequest');
      cy.wait('@teacher1Request');
      cy.contains('button', 'Participate').click();
      cy.wait('@participateSession1Request');

      // Retour en arrière et affichage de la deuxième session
      cy.contains('button', 'arrow_back').click();
      cy.url().should('include', '/sessions');

      cy.intercept('GET', '/api/session/2', {
        body: {
          id: 2,
          name: 'Evening Yoga',
          description: 'Relax in the evening',
          date: '2024-12-01T18:00:00',
          teacher_id: 2,
          users: [2],
          createdAt: '2024-11-01T00:00:00',
          updatedAt: '2024-11-01T00:00:00'
        }
      }).as('session2DetailRequest');

      cy.intercept('GET', '/api/teacher/2', {
        body: {
          id: 2,
          firstName: 'Hélène',
          lastName: 'THIERCELIN'
        }
      }).as('teacher2Request');

      cy.intercept('DELETE', '/api/session/2/participate/2', {
        statusCode: 200
      }).as('unparticipateSession2Request');

      cy.get('.mat-card').last().contains('button', 'Detail').click();
      cy.wait('@session2DetailRequest');
      cy.wait('@teacher2Request');
      cy.contains('button', 'Do not participate').click();
      cy.wait('@unparticipateSession2Request');

      cy.contains('button', 'arrow_back').click();
      cy.url().should('include', '/sessions');
    });
  });
});
