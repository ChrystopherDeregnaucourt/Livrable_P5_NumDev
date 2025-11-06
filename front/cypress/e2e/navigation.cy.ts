/// <reference types="cypress" />

describe('Navigation spec', () => {
  describe('Unauthenticated Navigation', () => {
    it('should redirect to login when accessing protected routes', () => {
      cy.visit('/sessions');
      cy.url().should('include', '/login');

      cy.visit('/me');
      cy.url().should('include', '/login');

      cy.visit('/sessions/create');
      cy.url().should('include', '/login');
    });

    it('should show login and register links', () => {
      cy.visit('/login');
      cy.contains('Login').should('be.visible');
      cy.contains('Register').should('be.visible');
    });

    it('should navigate between login and register', () => {
      cy.visit('/login');
      cy.contains('Register').click();
      cy.url().should('include', '/register');

      cy.contains('Login').click();
      cy.url().should('include', '/login');
    });

    it('should redirect to 404 for unknown routes', () => {
      cy.visit('/unknown-route');
      cy.url().should('include', '/404');
      cy.contains('Page not found !').should('be.visible');
    });
  });

  describe('Authenticated Navigation', () => {
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

    it('should display authenticated navigation items', () => {
      cy.get('span[class*="link"]').contains('Sessions').should('be.visible');
      cy.get('span[routerLink=me]').contains('Account').should('be.visible');
      cy.get('span[class*="link"]').contains('Logout').should('be.visible');
    });

    it('should navigate to sessions from navbar', () => {
      cy.intercept('GET', '/api/user/1', {
        body: {
          id: 1,
          email: 'yoga@studio.com',
          lastName: 'Admin',
          firstName: 'Admin',
          admin: true
        }
      }).as('userRequest');

      // Aller d'abord sur le profil
      cy.get('span[routerLink=me]').click();
      cy.wait('@userRequest');
      cy.url().should('include', '/me');

      // Retour vers les sessions
      cy.get('span[class*="link"]').contains('Sessions').click();
      cy.url().should('include', '/sessions');
    });

    it('should navigate to account from navbar', () => {
      cy.intercept('GET', '/api/user/1', {
        body: {
          id: 1,
          email: 'yoga@studio.com',
          lastName: 'Admin',
          firstName: 'Admin',
          admin: true
        }
      }).as('userRequest');

      cy.get('span[routerLink=me]').click();
      cy.wait('@userRequest');
      cy.url().should('include', '/me');
    });

    it('should not show login/register links when authenticated', () => {
      // Vérification que nous sommes sur la page des sessions
      cy.url().should('include', '/sessions');
      
      // Vérification que les liens login et register ne sont pas visibles
      cy.get('span[routerLink=login]').should('not.exist');
      cy.get('span[routerLink=register]').should('not.exist');
      
      // Vérification que les liens authentifiés sont visibles à la place
      cy.get('span[class*="link"]').contains('Sessions').should('be.visible');
      cy.get('span[routerLink=me]').should('be.visible');
      cy.get('span[class*="link"]').contains('Logout').should('be.visible');
    });
  });

  describe('App Title Navigation', () => {
    it('should display app title', () => {
      cy.visit('/register');
      cy.get('mat-toolbar span').first().should('contain', 'Yoga app');
    });

    it('should keep navigation items visible when authenticated', () => {
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

      cy.intercept('GET', '/api/user/1', {
        body: {
          id: 1,
          email: 'yoga@studio.com',
          lastName: 'Admin',
          firstName: 'Admin',
          admin: true
        }
      }).as('userRequest');

      cy.visit('/login');
      cy.get('input[formControlName=email]').type("yoga@studio.com");
      cy.get('input[formControlName=password]').type("test!1234{enter}{enter}");
      cy.wait('@loginRequest');

      // Vérification que la navigation est disponible
      cy.get('span[class*="link"]').contains('Sessions').should('be.visible');
      cy.get('span[routerLink=me]').should('be.visible');
      cy.get('span[class*="link"]').contains('Logout').should('be.visible');
    });
  });
});
