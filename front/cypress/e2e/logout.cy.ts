/// <reference types="cypress" />

describe('Logout spec', () => {
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

  it('should logout successfully', () => {
    // Vérification que nous sommes connectés
    cy.url().should('include', '/sessions');
    cy.get('span[class*="link"]').contains('Logout').should('be.visible');

    // Déconnexion
    cy.get('span[class*="link"]').contains('Logout').click();

    // Vérification de la redirection vers la page d'accueil
    cy.url().should('eq', 'http://localhost:4200/');
    
    // Vérification que nous ne pouvons pas accéder aux routes protégées
    cy.visit('/sessions');
    cy.url().should('include', '/login');
  });

  it('should clear session and require re-login', () => {
    // Déconnexion
    cy.get('span[class*="link"]').contains('Logout').click();
    cy.url().should('eq', 'http://localhost:4200/');

    // Tentative d'accès à une route protégée
    cy.visit('/me');
    cy.url().should('include', '/login');

    // Vérification que nous devons nous reconnecter
    cy.get('input[formControlName=email]').should('be.visible');
    cy.get('input[formControlName=password]').should('be.visible');
  });

  it('should hide logout button when not logged in', () => {
    cy.get('span[class*="link"]').contains('Logout').click();
    cy.url().should('eq', 'http://localhost:4200/');
    cy.get('span[class*="link"]').contains('Logout').should('not.exist');
  });
});
