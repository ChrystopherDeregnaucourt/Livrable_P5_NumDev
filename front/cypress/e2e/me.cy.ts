/// <reference types="cypress" />

describe('Me (User Profile) spec', () => {
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
      body: []
    }).as('sessionsRequest');

    cy.visit('/login');
    cy.get('input[formControlName=email]').type("yoga@studio.com");
    cy.get('input[formControlName=password]').type("test!1234{enter}{enter}");
    cy.wait('@loginRequest');
    cy.wait('@sessionsRequest');
  });

  it('should display user profile information', () => {
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

    // Navigation vers la page de profil
    cy.get('span[routerLink=me]').click();
    cy.wait('@userRequest');

    cy.url().should('include', '/me');
    cy.contains('User information').should('be.visible');
    cy.contains('Name: Admin ADMIN').should('be.visible');
    cy.contains('Email: yoga@studio.com').should('be.visible');
    cy.contains('You are admin').should('be.visible');
    cy.contains('Create at:').should('be.visible');
    cy.contains('Last update:').should('be.visible');
  });

  it('should display non-admin user profile', () => {
    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 2,
        username: 'user@test.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false,
        token: 'fake-jwt-token'
      },
    }).as('loginUserRequest');

    cy.intercept('GET', '/api/user/2', {
      body: {
        id: 2,
        email: 'user@test.com',
        lastName: 'Doe',
        firstName: 'John',
        admin: false,
        createdAt: '2024-02-01T00:00:00',
        updatedAt: '2024-02-01T00:00:00'
      }
    }).as('userRequest');

    // Reconnexion en tant qu'utilisateur régulier
    cy.get('span[class*="link"]').contains('Logout').click();
    cy.visit('/login');
    cy.get('input[formControlName=email]').type("user@test.com");
    cy.get('input[formControlName=password]').type("test!1234{enter}{enter}");
    cy.wait('@loginUserRequest');

    // Navigation vers la page de profil
    cy.get('span[routerLink=me]').click();
    cy.wait('@userRequest');

    cy.url().should('include', '/me');
    cy.contains('Name: John DOE').should('be.visible');
    cy.contains('Email: user@test.com').should('be.visible');
    cy.contains('Delete my account:').should('be.visible');
    cy.get('button').contains('Detail').should('be.visible');
  });

  it('should navigate back from profile page', () => {
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

    cy.get('button[mat-icon-button]').contains('arrow_back').click();
    cy.url().should('include', '/sessions');
  });

  it('should delete user account', () => {
    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 2,
        username: 'user@test.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false,
        token: 'fake-jwt-token'
      },
    }).as('loginUserRequest');

    cy.intercept('GET', '/api/user/2', {
      body: {
        id: 2,
        email: 'user@test.com',
        lastName: 'Doe',
        firstName: 'John',
        admin: false,
        createdAt: '2024-02-01T00:00:00',
        updatedAt: '2024-02-01T00:00:00'
      }
    }).as('userRequest');

    cy.intercept('DELETE', '/api/user/2', {
      statusCode: 200
    }).as('deleteUserRequest');

    // Reconnexion en tant qu'utilisateur régulier
    cy.get('span[class*="link"]').contains('Logout').click();
    cy.visit('/login');
    cy.get('input[formControlName=email]').type("user@test.com");
    cy.get('input[formControlName=password]').type("test!1234{enter}{enter}");
    cy.wait('@loginUserRequest');

    // Navigation vers le profil et suppression du compte
    cy.get('span[routerLink=me]').click();
    cy.wait('@userRequest');

    cy.get('button').contains('Detail').click();
    cy.wait('@deleteUserRequest');

    // Le snackbar devrait s'afficher et rediriger vers la page d'accueil
    cy.contains('Your account has been deleted !').should('be.visible');
    cy.url().should('eq', 'http://localhost:4200/');
  });

  it('should not show delete button for admin users', () => {
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

    cy.contains('Delete my account:').should('not.exist');
    cy.contains('You are admin').should('be.visible');
  });
});
