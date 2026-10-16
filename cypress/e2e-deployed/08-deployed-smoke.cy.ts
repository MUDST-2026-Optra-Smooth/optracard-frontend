type CatalogProduct = { name: string };

// The deployed API URL is passed via Cypress environment (CYPRESS_API_BASE_URL or --env API_BASE_URL)
const apiBaseUrl = String(Cypress.env('API_BASE_URL') || '').replace(/\/$/, '');

const loginThroughDeployedUi = () => {
  cy.env(['E2E_EMAIL', 'E2E_PASSWORD']).then(({ E2E_EMAIL, E2E_PASSWORD }) => {
    expect(E2E_EMAIL, 'CYPRESS_E2E_EMAIL').to.be.a('string').and.not.be.empty;
    expect(E2E_PASSWORD, 'CYPRESS_E2E_PASSWORD').to.be.a('string').and.not.be.empty;

    cy.visit('/login');
    cy.get('input[name="email"]').type(E2E_EMAIL);
    cy.get('input[name="password"]').type(E2E_PASSWORD, { log: false });
    cy.contains('button[type="submit"]', /login/i).click();
    cy.window().its('localStorage.token').should('be.a', 'string').and('not.be.empty');
  });
};

describe('Deployed full-stack smoke journeys', () => {
  before(() => {
    expect(Cypress.config().baseUrl, 'CYPRESS_BASE_URL').to.match(/^https?:\/\//);
    expect(apiBaseUrl, 'BACKEND_API_URL').to.match(/^https?:\/\//);
  });

  it('returns the live backend API description', () => {
    cy.request(`${apiBaseUrl}/v3/api-docs`).its('status').should('eq', 200);
  });

  it('shows catalog data from the deployed backend in the storefront', () => {
    cy.request<CatalogProduct[]>(`${apiBaseUrl}/api/products/home`).then(({ body }) => {
      expect(body).to.be.an('array').and.not.be.empty;
      cy.visit('/');
      cy.contains(body[0].name, { timeout: 15_000 }).should('be.visible');
    });
  });

  it('authenticates through the UI and can read the protected profile API', () => {
    loginThroughDeployedUi();
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      cy.request({
        url: `${apiBaseUrl}/api/profile`,
        headers: { Authorization: `Bearer ${token}` },
      }).its('status').should('eq', 200);
    });
  });
});
