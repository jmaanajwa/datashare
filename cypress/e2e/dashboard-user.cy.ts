const authenticatedUser = {
  id: 'alice@example.com',
  email: 'alice@example.com',
};

const filesResponse = [
  {
    id: 'active-file',
    name: 'photo.png',
    size: 2_000_000,
    expirationDate: '2030-01-01T00:00:00Z',
    linkStatus: 'active',
    downloadLink: 'http://localhost:4200/download/active-token',
  },
  {
    id: 'expired-file',
    name: 'archive.pdf',
    size: 1_000,
    expirationDate: '2020-01-01T00:00:00Z',
    linkStatus: 'expired',
    downloadLink: 'http://localhost:4200/download/expired-token',
  },
];

function visitDashboard(): void {
  cy.intercept('GET', '**/api/files', { body: filesResponse }).as('listFiles');
  cy.visit('/dashboard', {
    onBeforeLoad: (window) => {
      window.localStorage.setItem('datashare.token', 'test-token');
      window.localStorage.setItem('datashare.user', JSON.stringify(authenticatedUser));
    },
  });
  cy.wait('@listFiles');
}

describe('User dashboard', () => {
  it('affiche les fichiers et permet de filtrer les fichiers expirés', () => {
    visitDashboard();

    cy.contains('h1', 'Mes fichiers').should('be.visible');
    cy.get('.file-item').should('have.length', 2);
    cy.contains('button', 'Expiré').click();
    cy.get('.file-item').should('have.length', 1).and('contain', 'archive.pdf');
  });

  it('redirige vers upload et supprime un fichier actif', () => {
    visitDashboard();
    cy.intercept('DELETE', '**/api/files/active-file', { statusCode: 204, body: null }).as('deleteFile');

    cy.get('.add-files').should('have.attr', 'href', '/upload');
    cy.get('.file-item').first().find('.delete-button').click();
    cy.wait('@deleteFile');
    cy.get('.file-item').should('have.length', 1).and('contain', 'archive.pdf');
  });

  it('déconnecte l’utilisateur et revient à upload', () => {
    visitDashboard();
    cy.get('.logout').click();

    cy.url().should('include', '/upload');
    cy.get('.login-button').should('contain', 'Se connecter');
  });
});
