let apiBaseUrl = '';

describe('Deployed full-stack smoke journeys', () => {
  before(() => {
    expect(Cypress.config().baseUrl, 'CYPRESS_BASE_URL').to.match(/^https?:\/\//);
    cy.env(['API_BASE_URL']).then((env: Record<string, unknown>) => {
      const url = env?.API_BASE_URL;
      const exposed = typeof Cypress.expose === 'function' ? Cypress.expose('API_BASE_URL') : '';
      const rawUrl =
        (typeof url === 'string' && url) || (typeof exposed === 'string' ? exposed : '') || '';
      apiBaseUrl = String(rawUrl).replace(/\/$/, '');
      expect(apiBaseUrl, 'BACKEND_API_URL').to.match(/^https?:\/\//);
    });
  });

  it('returns the live backend API description', () => {
    cy.then(() => {
      cy.request(`${apiBaseUrl}/v3/api-docs`).its('status').should('eq', 200);
    });
  });

  it('loads the deployed frontend storefront successfully', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  it.skip('shows catalog data from the deployed backend in the storefront', () => {
  });

  it.skip('authenticates through the UI and can read the protected profile API', () => {
  });
});