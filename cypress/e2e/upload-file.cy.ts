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
          downloadLink: 'http://localhost:8080/api/shares/share-token',
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
    cy.get('.share-link').should('have.attr', 'href').and('include', '/download/share-token');
  });

  it('retire un fichier sélectionné avant le téléversement', () => {
    cy.visit('/upload');
    cy.get('#upload-input').selectFile({
      contents: Cypress.Buffer.from('file content'),
      fileName: 'remove.txt',
      mimeType: 'text/plain',
    }, { force: true });

    cy.get('.file-name').should('contain', 'remove.txt');
    cy.contains('button', 'Retirer').click();
    cy.get('#upload-input').should('exist');
    cy.get('.file-name').should('not.exist');
  });

  it('affiche une erreur quand le téléversement échoue', () => {
    cy.intercept('POST', '**/api/files', { statusCode: 500, body: {} }).as('uploadError');
    cy.visit('/upload');
    cy.get('#upload-input').selectFile({
      contents: Cypress.Buffer.from('file content'),
      fileName: 'failure.txt',
      mimeType: 'text/plain',
    }, { force: true });
    cy.contains('button', 'Téléverser').click();

    cy.wait('@uploadError');
    cy.get('.error').should('contain', 'Impossible de téléverser');
  });

  it('copie le lien après un téléversement réussi', () => {
    cy.intercept('POST', '**/api/files', {
      statusCode: 200,
      body: {
        metadata: {
          id: 'file-copy',
          name: 'copy.txt',
          size: 4,
          expirationDate: '2030-01-01T00:00:00Z',
          linkStatus: 'active',
          downloadLink: 'http://localhost:8080/api/shares/copy-token',
        },
      },
    }).as('copyUpload');

    cy.visit('/upload');
    cy.window().then((window) => {
      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: { writeText: cy.stub().as('writeText') },
      });
    });
    cy.get('#upload-input').selectFile({
      contents: Cypress.Buffer.from('file content'),
      fileName: 'copy.txt',
      mimeType: 'text/plain',
    }, { force: true });
    cy.contains('button', 'Téléverser').click();
    cy.wait('@copyUpload');
    cy.contains('button', 'Copier le lien').click();
    cy.get('@writeText').should('have.been.calledOnce');
  });
});
