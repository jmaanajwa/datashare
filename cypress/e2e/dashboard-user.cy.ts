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
    cy.get('.file-item').first().find('.file-info span')
      .should('contain', 'Expire dans')
      .and('not.contain', 'NaN');
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

  it('filtre les fichiers actifs', () => {
    visitDashboard();

    cy.contains('button', 'Actifs').click();
    cy.get('.file-item').should('have.length', 1).and('contain', 'photo.png');
  });

  it('affiche un message quand le chargement échoue', () => {
    cy.intercept('GET', '**/api/files', { statusCode: 500, body: {} }).as('listFilesError');
    cy.visit('/dashboard', {
      onBeforeLoad: (window) => {
        window.localStorage.setItem('datashare.token', 'test-token');
        window.localStorage.setItem('datashare.user', JSON.stringify(authenticatedUser));
      },
    });

    cy.wait('@listFilesError');
    cy.get('.state-message.error').should('contain', 'Impossible de charger');
  });

  it('affiche les types de fichiers, une date inconnue et une expiration proche', () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString();
    cy.intercept('GET', '**/api/files', {
      body: [
        { id: 'audio', name: 'audio.mp3', size: 1, expirationDate: tomorrow, linkStatus: 'active', downloadLink: 'http://localhost:8080/api/shares/audio' },
        { id: 'video', name: 'video.mp4', size: 1, expirationDate: 'invalid-date', linkStatus: 'active', downloadLink: 'http://localhost:8080/api/shares/video' },
      ],
    }).as('typedFiles');
    cy.visit('/dashboard', {
      onBeforeLoad: (window) => {
        window.localStorage.setItem('datashare.token', 'test-token');
        window.localStorage.setItem('datashare.user', JSON.stringify(authenticatedUser));
      },
    });

    cy.wait('@typedFiles');
    cy.get('.file-item').should('have.length', 2);
    cy.get('.file-info').eq(0).should('contain', '1 jour');
    cy.get('.file-info').eq(1).should('contain', 'date inconnue');
  });

  it('affiche une erreur si la suppression échoue', () => {
    visitDashboard();
    cy.intercept('DELETE', '**/api/files/active-file', { statusCode: 500, body: {} }).as('deleteError');

    cy.get('.file-item').first().find('.delete-button').click();
    cy.wait('@deleteError');
    cy.get('.state-message.error').should('contain', 'Impossible de supprimer');
    cy.get('.file-item').should('not.exist');
  });

  it('affiche le fichier protégé et le filtre vide', () => {
    cy.intercept('GET', '**/api/files', {
      body: [{ id: 'protected', name: 'secret.txt', size: 1, expirationDate: '2030-01-01T00:00:00Z', linkStatus: 'active', downloadLink: 'http://localhost:8080/api/shares/protected' }],
    }).as('protectedFiles');
    cy.visit('/dashboard', {
      onBeforeLoad: (window) => {
        window.localStorage.setItem('datashare.token', 'test-token');
        window.localStorage.setItem('datashare.user', JSON.stringify(authenticatedUser));
      },
    });
    cy.wait('@protectedFiles');
    cy.contains('.file-item', 'secret.txt').should('exist');
    cy.contains('button', 'Expiré').click();
    cy.get('.state-message').should('contain', 'Aucun fichier');
  });
});
