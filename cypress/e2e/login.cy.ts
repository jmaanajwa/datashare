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
});
