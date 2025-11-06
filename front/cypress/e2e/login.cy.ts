/// <reference types="cypress" />

// Tests de la page de connexion
describe('Login spec', () => {
  // Avant chaque test, on navigue vers la page de connexion
  beforeEach(() => {
    cy.visit('/login');
  });

  // Vérifie que le formulaire de connexion s'affiche correctement
  it('should display login form', () => {
    cy.url().should('include', '/login');
    cy.get('input[formControlName=email]').should('be.visible');
    cy.get('input[formControlName=password]').should('be.visible');
    cy.get('button[type=submit]').should('be.visible').and('contain', 'Submit');
  });

  // Vérifie qu'un utilisateur peut se connecter avec des identifiants valides
  it('should login successfully with valid credentials', () => {
    // Interception de la requête de connexion avec une réponse réussie
    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'yoga@studio.com',
        firstName: 'Admin',
        lastName: 'Admin',
        admin: true
      },
    }).as('loginRequest');

    // Interception de la requête des sessions
    cy.intercept('GET', '/api/session', {
      body: []
    }).as('sessionsRequest');

    // Saisie des identifiants et soumission du formulaire
    cy.get('input[formControlName=email]').type("yoga@studio.com");
    cy.get('input[formControlName=password]').type("test!1234{enter}{enter}");

    // Attente des requêtes et vérification de la redirection
    cy.wait('@loginRequest');
    cy.wait('@sessionsRequest');
    cy.url().should('include', '/sessions');
  });

  // Vérifie qu'un message d'erreur s'affiche avec des identifiants invalides
  it('should show error with invalid credentials', () => {
    // Interception de la requête de connexion avec une erreur 401
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        message: 'Invalid credentials'
      }
    }).as('loginRequest');

    // Saisie d'identifiants incorrects
    cy.get('input[formControlName=email]').type("wrong@email.com");
    cy.get('input[formControlName=password]').type("wrongpassword{enter}{enter}");

    // Vérification que le message d'erreur s'affiche
    cy.wait('@loginRequest');
    cy.get('.error').should('be.visible').and('contain', 'An error occurred');
  });

  // Vérifie que le bouton de soumission est désactivé si le formulaire est invalide
  it('should disable submit button when form is invalid', () => {
    // Le bouton doit être désactivé quand le formulaire est vide
    cy.get('button[type=submit]').should('be.disabled');
    
    // Le bouton reste désactivé avec un email invalide
    cy.get('input[formControlName=email]').type("invalid-email");
    cy.get('button[type=submit]').should('be.disabled');
    
    // Le bouton est activé quand les champs sont valides
    cy.get('input[formControlName=email]').clear().type("valid@email.com");
    cy.get('input[formControlName=password]').type("123");
    cy.get('button[type=submit]').should('not.be.disabled');
  });

  // Vérifie la navigation vers la page d'inscription
  it('should navigate to register page', () => {
    // Clic sur le lien d'inscription et vérification de la redirection
    cy.contains('Register').click();
    cy.url().should('include', '/register');
  });
});
