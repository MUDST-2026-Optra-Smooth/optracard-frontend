type CatalogProduct = { name: string };

let apiBaseUrl = '';

const loginThroughDeployedUi = () => {
  cy.env(['E2E_EMAIL', 'E2E_PASSWORD']).then((env: Record<string, unknown>) => {
    const email = typeof env?.E2E_EMAIL === 'string' ? env.E2E_EMAIL : '';
    const password = typeof env?.E2E_PASSWORD === 'string' ? env.E2E_PASSWORD : '';
    expect(email, 'CYPRESS_E2E_EMAIL').to.be.a('string').and.not.be.empty;
    expect(password, 'CYPRESS_E2E_PASSWORD').to.be.a('string').and.not.be.empty;

    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password, { log: false });
    cy.contains('button[type="submit"]', /login/i).click();
    cy.window().its('localStorage.token').should('be.a', 'string').and('not.be.empty');
  });
};

describe('Deployed full-stack smoke journeys', () => {
  before(() => {
    expect(Cypress.config().baseUrl, 'CYPRESS_BASE_URL').to.match(/^https?:\/\//);
    cy.env('API_BASE_URL').then((url: unknown) => {
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

  it('shows catalog data from the deployed backend in the storefront', () => {
    cy.then(() => {
      cy.request<CatalogProduct[]>(`${apiBaseUrl}/api/products/home`).then(({ body }) => {
        expect(body).to.be.an('array').and.not.be.empty;
        cy.visit('/');
        cy.contains(body[0].name, { timeout: 15_000 }).should('be.visible');
      });
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
