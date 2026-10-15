type CatalogProduct = { name: string };

const realE2eEnabled = Cypress.env('REAL_E2E') === true || Cypress.env('REAL_E2E') === 'true';
const deployedDescribe = realE2eEnabled ? describe : describe.skip;

const apiBaseUrl = () => String(Cypress.env('API_BASE_URL') || '').replace(/\/$/, '');
const email = () => String(Cypress.env('E2E_EMAIL') || '');
const password = () => String(Cypress.env('E2E_PASSWORD') || '');

const loginThroughDeployedUi = () => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email());
  cy.get('input[name="password"]').type(password(), { log: false });
  cy.contains('button[type="submit"]', /login/i).click();
  cy.window().its('localStorage.token').should('be.a', 'string').and('not.be.empty');
};

deployedDescribe('Deployed full-stack smoke journeys', () => {
  before(() => {
    expect(Cypress.config().baseUrl, 'CYPRESS_BASE_URL').to.match(/^https?:\/\//);
    expect(apiBaseUrl(), 'CYPRESS_API_BASE_URL').to.match(/^https?:\/\//);
    expect(email(), 'CYPRESS_E2E_EMAIL').to.not.equal('');
    expect(password(), 'CYPRESS_E2E_PASSWORD').to.not.equal('');
  });

  it('returns the live backend API description', () => {
    cy.request(`${apiBaseUrl()}/v3/api-docs`).its('status').should('eq', 200);
  });

  it('shows catalog data from the deployed backend in the storefront', () => {
    cy.request<CatalogProduct[]>(`${apiBaseUrl()}/api/products/home`).then(({ body }) => {
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
        url: `${apiBaseUrl()}/api/profile`,
        headers: { Authorization: `Bearer ${token}` },
      }).its('status').should('eq', 200);
    });
  });
});
