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
});
