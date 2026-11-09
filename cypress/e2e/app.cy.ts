describe('Application root', () => {
  it('redirige la route racine vers la page upload', () => {
    cy.visit('/');

    cy.url().should('include', '/upload');
    cy.contains('h1', 'Tu veux partager un fichier ?').should('be.visible');
  });
});
