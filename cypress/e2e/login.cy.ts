const validToken = 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJhbGljZUBleGFtcGxlLmNvbSJ9.signature';

describe('Login page', () => {
  it('affiche les erreurs de validation pour un formulaire vide', () => {
    cy.visit('/login');
    cy.get('button.submit').click();

    cy.get('#login-email-error').should('be.visible');
    cy.get('#login-password-error').should('be.visible');
  });

  it('connecte l’utilisateur et ouvre son dashboard', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { token: validToken },
    }).as('login');
    cy.intercept('GET', '**/api/files', { body: [] }).as('listFiles');

    cy.visit('/login');
    cy.get('#login-email').type('alice@example.com');
    cy.get('#login-password').type('secret');
    cy.get('button.submit').click();

    cy.wait('@login');
    cy.url().should('include', '/dashboard');
    cy.wait('@listFiles');
    cy.contains('h1', 'Mes fichiers').should('be.visible');
  });

  it('affiche le message d’erreur renvoyé par l’API', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { message: 'Compte bloqué' },
    }).as('loginError');

    cy.visit('/login');
    cy.get('#login-email').type('alice@example.com');
    cy.get('#login-password').type('wrong');
    cy.get('button.submit').click();

    cy.wait('@loginError');
    cy.get('.field-error').last().should('contain', 'Compte bloqué');
  });

  it('utilise le message par défaut si l’API ne fournit pas de détail', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { token: 'invalid-token' },
    }).as('invalidLogin');

    cy.visit('/login');
    cy.get('#login-email').type('alice@example.com');
    cy.get('#login-password').type('wrong');
    cy.get('button.submit').click();

    cy.wait('@invalidLogin');
    cy.get('.field-error').last().should('contain', 'Identifiants incorrects');
  });
});
