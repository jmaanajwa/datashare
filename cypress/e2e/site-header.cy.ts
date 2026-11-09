describe('Site header', () => {
  it('affiche le lien de connexion quand aucun utilisateur n’est connecté', () => {
    cy.visit('/upload');

    cy.get('.login-button')
      .should('contain', 'Se connecter')
      .and('have.attr', 'href', '/login');
  });

  it('affiche Mon espace et redirige vers le dashboard pour un utilisateur connecté', () => {
    cy.intercept('GET', '**/api/files', { body: [] }).as('listFiles');
    cy.visit('/upload', {
      onBeforeLoad: (window) => {
        window.localStorage.setItem('datashare.token', 'test-token');
        window.localStorage.setItem('datashare.user', JSON.stringify({
          id: 'alice@example.com',
          email: 'alice@example.com',
        }));
      },
    });

    cy.get('.login-button')
      .should('contain', 'Mon espace')
      .and('have.attr', 'href', '/dashboard')
      .click();

    cy.url().should('include', '/dashboard');
    cy.wait('@listFiles');
  });
});
