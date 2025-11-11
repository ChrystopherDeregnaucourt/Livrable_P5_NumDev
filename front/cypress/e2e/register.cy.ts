/// <reference types="cypress" />

// Tests de la page d'inscription
describe('Register spec', () => {
  // Avant chaque test, on navigue vers la page d'inscription
  beforeEach(() => {
    cy.visit('/register');
  });

  // Vérifie que le formulaire d'inscription s'affiche correctement
  it('should display register form', () => {
    cy.url().should('include', '/register');
    cy.get('input[formControlName=firstName]').should('be.visible');
    cy.get('input[formControlName=lastName]').should('be.visible');
    cy.get('input[formControlName=email]').should('be.visible');
    cy.get('input[formControlName=password]').should('be.visible');
    cy.get('button[type=submit]').should('be.visible').and('contain', 'Submit');
  });

  // Vérifie qu'un utilisateur peut s'inscrire avec des données valides
  it('should register successfully with valid data', () => {
    // Interception de la requête d'inscription avec une réponse réussie
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: {
        message: 'User registered successfully!'
      }
    }).as('registerRequest');

    // Remplissage du formulaire d'inscription
    cy.get('input[formControlName=firstName]').type("John");
    cy.get('input[formControlName=lastName]').type("Doe");
    cy.get('input[formControlName=email]').type("john.doe@test.com");
    cy.get('input[formControlName=password]').type("password123{enter}{enter}");

    // Vérification de la redirection vers la page de connexion
    cy.wait('@registerRequest');
    cy.url().should('include', '/login');
  });

  // Vérifie qu'une erreur s'affiche si l'email existe déjà
  it('should show error when email already exists', () => {
    // Interception de la requête d'inscription avec une erreur 400
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: {
        message: 'Email already exists'
      }
    }).as('registerRequest');

    // Tentative d'inscription avec un email existant
    cy.get('input[formControlName=firstName]').type("John");
    cy.get('input[formControlName=lastName]').type("Doe");
    cy.get('input[formControlName=email]').type("yoga@studio.com");
    cy.get('input[formControlName=password]').type("password123{enter}{enter}");

    // Vérification que le message d'erreur s'affiche
    cy.wait('@registerRequest');
    cy.get('.error').should('be.visible').and('contain', 'An error occurred');
  });

  // Vérifie que le bouton de soumission est désactivé si le formulaire est invalide
  it('should disable submit button when form is invalid', () => {
    // Le bouton doit être désactivé quand le formulaire est vide
    cy.get('button[type=submit]').should('be.disabled');
    
    // Le bouton reste désactivé avec un email invalide
    cy.get('input[formControlName=firstName]').type("John");
    cy.get('input[formControlName=lastName]').type("Doe");
    cy.get('input[formControlName=email]').type("invalid");
    cy.get('button[type=submit]').should('be.disabled');
    
    // Le bouton est activé quand tous les champs sont valides
    cy.get('input[formControlName=email]').clear().type("valid@email.com");
    cy.get('input[formControlName=password]').type("password123");
    cy.get('button[type=submit]').should('not.be.disabled');
  });

  // Vérifie que tous les champs sont obligatoires
  it('should require all fields', () => {
    // Le bouton doit être désactivé initialement
    cy.get('button[type=submit]').should('be.disabled');
    
    // Le bouton reste désactivé après chaque champ rempli jusqu'au dernier
    cy.get('input[formControlName=firstName]').type("John");
    cy.get('button[type=submit]').should('be.disabled');
    
    cy.get('input[formControlName=lastName]').type("Doe");
    cy.get('button[type=submit]').should('be.disabled');
    
    cy.get('input[formControlName=email]').type("john@test.com");
    cy.get('button[type=submit]').should('be.disabled');
    
    // Le bouton est activé seulement quand tous les champs sont remplis
    cy.get('input[formControlName=password]').type("password");
    cy.get('button[type=submit]').should('not.be.disabled');
  });

  // Vérifie la navigation vers la page de connexion
  it('should navigate to login page', () => {
    // Clic sur le lien de connexion et vérification de la redirection
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });
});
