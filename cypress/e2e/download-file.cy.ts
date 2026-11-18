describe('Download file page', () => {
  it('affiche un fichier disponible et permet son téléchargement', () => {
    cy.intercept('GET', '**/api/shares/share-token', {
      body: {
        name: 'rapport.pdf',
        mimeType: 'application/pdf',
        size: 4,
        expirationDate: '2030-01-01T00:00:00Z',
        passwordRequired: false,
      },
    }).as('getFile');
    cy.intercept('POST', '**/api/shares/share-token/download', {
      statusCode: 200,
      body: 'file content',
      headers: { 'content-type': 'application/pdf' },
    }).as('downloadFile');

    cy.visit('/download/share-token');
    cy.wait('@getFile');
    cy.contains('.file-name', 'rapport.pdf').should('be.visible');
    cy.get('.download-button').should('not.be.disabled').click();
    cy.wait('@downloadFile');
  });

  it('demande le mot de passe pour un fichier protégé', () => {
    cy.intercept('GET', '**/api/shares/protected-token', {
      body: {
        name: 'secret.txt',
        mimeType: 'text/plain',
        size: 10,
        expirationDate: '2030-01-01T00:00:00Z',
        passwordRequired: true,
      },
    }).as('getProtectedFile');
    cy.intercept('POST', '**/api/shares/protected-token/download', {
      statusCode: 200,
      body: 'secret content',
      headers: { 'content-type': 'text/plain' },
    }).as('downloadProtectedFile');

    cy.visit('/download/protected-token');
    cy.wait('@getProtectedFile');
    cy.get('#download-password').type('secret');
    cy.get('.download-button').should('not.be.disabled').click();
    cy.wait('@downloadProtectedFile').its('request.body').should('deep.equal', { password: 'secret' });
  });

  it('affiche un message si le fichier est introuvable', () => {
    cy.intercept('GET', '**/api/shares/missing-token', { statusCode: 404, body: {} }).as('missingFile');

    cy.visit('/download/missing-token');
    cy.wait('@missingFile');
    cy.get('.notice-error').should('contain', 'introuvable');
  });

  it('affiche un message pour un fichier expiré', () => {
    cy.intercept('GET', '**/api/shares/expired-token', {
      body: {
        name: 'old.pdf',
        mimeType: 'application/pdf',
        size: 4,
        expirationDate: '2020-01-01T00:00:00Z',
        passwordRequired: false,
      },
    }).as('expiredFile');

    cy.visit('/download/expired-token');
    cy.wait('@expiredFile');
    cy.get('.notice-error').should('contain', 'expiré');
    cy.get('.download-button').should('not.exist');
  });

  it('affiche une erreur si le téléchargement échoue', () => {
    cy.intercept('GET', '**/api/shares/failing-token', {
      body: {
        name: 'protected.txt',
        mimeType: 'text/plain',
        size: 4,
        expirationDate: '2030-01-01T00:00:00Z',
        passwordRequired: true,
      },
    }).as('failingFile');
    cy.intercept('POST', '**/api/shares/failing-token/download', {
      statusCode: 403,
      body: {},
    }).as('downloadError');

    cy.visit('/download/failing-token');
    cy.wait('@failingFile');
    cy.get('#download-password').type('wrong');
    cy.get('.download-button').click();
    cy.wait('@downloadError');
    cy.get('.notice-error').should('contain', 'Mot de passe incorrect');
  });
});
