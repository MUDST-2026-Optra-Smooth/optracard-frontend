let apiBaseUrl = '';

describe('Staging read-only buyer verification', () => {
  before(function () {
    const configured = Cypress.env('API_BASE_URL');
    if (typeof configured !== 'string' || !configured) this.skip();
    apiBaseUrl = configured.replace(/\/$/, '');
  });

  it('serves the public catalog and tolerant Thai search without mocked responses', () => {
    cy.request(`${apiBaseUrl}/api/products/catalog?page=0&pageSize=5`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.items).to.be.an('array');
    });
    cy.request(`${apiBaseUrl}/api/products/search?q=%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B8%9E%E0%B8%B5%E0%B8%8A`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  it('allows a resettable staging buyer to read profile and order history', function () {
    const email = Cypress.env('E2E_EMAIL');
    const password = Cypress.env('E2E_PASSWORD');
    if (!email || !password) this.skip();

    cy.request('POST', `${apiBaseUrl}/api/auth/login`, { email, password }).then((login) => {
      expect(login.status).to.eq(200);
      const headers = { Authorization: `Bearer ${login.body.token}` };
      cy.request({ url: `${apiBaseUrl}/api/profile`, headers }).its('status').should('eq', 200);
      cy.request({ url: `${apiBaseUrl}/api/orders`, headers }).its('status').should('eq', 200);
    });
  });
});
