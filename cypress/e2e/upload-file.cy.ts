describe('Upload file page', () => {
  it('affiche la zone de dépôt vide', () => {
    cy.visit('/upload');

    cy.contains('h1', 'Tu veux partager un fichier ?').should('be.visible');
    cy.get('#upload-input').should('exist');
  });

  it('sélectionne et téléverse un fichier', () => {
    cy.intercept('POST', '**/api/files', {
      statusCode: 200,
      body: {
        metadata: {
          id: 'file-1',
          name: 'rapport.pdf',
          size: 4,
          expirationDate: '2030-01-01T00:00:00Z',
          linkStatus: 'active',
          downloadLink: 'http://localhost:4200/download/share-token',
        },
      },
    }).as('uploadFile');

    cy.visit('/upload');
    cy.get('#upload-input').selectFile({
      contents: Cypress.Buffer.from('file content'),
      fileName: 'rapport.pdf',
      mimeType: 'application/pdf',
    }, { force: true });

    cy.get('.file-name').should('contain', 'rapport.pdf');
    cy.get('#password').type('secret');
    cy.get('#expiration').select('7');
    cy.contains('button', 'Téléverser').click();

    cy.wait('@uploadFile').its('request.body').should('contain', 'expirationDays');
    cy.get('.success').should('contain', 'Félicitations');
    cy.get('.share-link').should('have.attr', 'href', 'http://localhost:4200/download/share-token');
  });
});
