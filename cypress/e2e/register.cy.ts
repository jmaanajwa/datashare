const registrationToken = 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJub3ZlYXVAYXRsYXMuY29tIn0.signature';

describe('Register page', () => {
  it('signale des mots de passe différents', () => {
    cy.visit('/register');
    cy.get('#register-email').type('new@example.com');
    cy.get('#register-password').type('secret');
    cy.get('#register-confirm').type('different');
    cy.get('button.submit').click();

    cy.get('#register-confirm-error')
      .should('be.visible')
      .and('contain', 'doivent correspondre');
  });

  it('crée le compte et redirige vers la connexion', () => {
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 200,
      body: { token: registrationToken },
    }).as('register');

    cy.visit('/register');
    cy.get('#register-email').type('new@example.com');
    cy.get('#register-password').type('secret');
    cy.get('#register-confirm').type('secret');
    cy.get('button.submit').click();

    cy.wait('@register');
    cy.get('.confirmation').should('contain', 'Compte créé');
    cy.url().should('include', '/login');
  });

  it('affiche le message d’erreur renvoyé par l’API', () => {
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 409,
      body: { message: 'Adresse déjà utilisée' },
    }).as('registerError');

    cy.visit('/register');
    cy.get('#register-email').type('existing@example.com');
    cy.get('#register-password').type('secret');
    cy.get('#register-confirm').type('secret');
    cy.get('button.submit').click();

    cy.wait('@registerError');
    cy.get('.field-error').last().should('contain', 'Adresse déjà utilisée');
  });

  it('utilise le message par défaut si l’inscription échoue sans détail', () => {
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 500,
      body: {},
    }).as('registerFailure');

    cy.visit('/register');
    cy.get('#register-email').type('new@example.com');
    cy.get('#register-password').type('secret');
    cy.get('#register-confirm').type('secret');
    cy.get('button.submit').click();

    cy.wait('@registerFailure');
    cy.get('.field-error').last().should('contain', 'Impossible de créer le compte');
  });
});
