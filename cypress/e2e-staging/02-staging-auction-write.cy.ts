/**
 * Deliberately opt-in: this mutates only resettable staging accounts and removes
 * its auction through the ordinary admin API in `after`.
 */
describe('Staging resettable auction journey', () => {
  let apiBaseUrl = '';
  let sellerToken = '';
  let adminToken = '';
  let buyerToken = '';
  let auctionId: number | undefined;
  const runId = Cypress.env('RUN_ID') || `${Date.now()}`;

  const login = (email: string, password: string) => cy.request('POST', `${apiBaseUrl}/api/auth/login`, { email, password })
    .its('body.token').should('be.a', 'string').and('not.be.empty');

  before(function () {
    if (Cypress.env('ENABLE_WRITES') !== true && Cypress.env('ENABLE_WRITES') !== 'true') this.skip();
    apiBaseUrl = String(Cypress.env('API_BASE_URL') ?? '').replace(/\/$/, '');
    const sellerEmail = Cypress.env('E2E_SELLER_EMAIL');
    const sellerPassword = Cypress.env('E2E_SELLER_PASSWORD');
    const adminEmail = Cypress.env('E2E_ADMIN_EMAIL');
    const adminPassword = Cypress.env('E2E_ADMIN_PASSWORD');
    const buyerEmail = Cypress.env('E2E_BUYER_EMAIL');
    const buyerPassword = Cypress.env('E2E_BUYER_PASSWORD');
    if (!apiBaseUrl || !sellerEmail || !sellerPassword || !adminEmail || !adminPassword || !buyerEmail || !buyerPassword) this.skip();
    login(sellerEmail, sellerPassword).then((token) => { sellerToken = token; });
    login(adminEmail, adminPassword).then((token) => { adminToken = token; });
    login(buyerEmail, buyerPassword).then((token) => { buyerToken = token; });
  });

  it('creates, submits, approves and bids on a run-scoped Marketplace auction', () => {
    const startsAt = new Date(Date.now() - 60_000).toISOString().slice(0, 16);
    const endsAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    cy.request({
      method: 'POST', url: `${apiBaseUrl}/api/seller/auctions`, headers: { Authorization: `Bearer ${sellerToken}` },
      body: { title: `E2E-${runId}-auction`, gameId: 1, type: 'Single', imageUrl: '', description: 'Resettable staging fixture', startingPrice: 500, startsAt, endsAt },
    }).then((created) => {
      expect(created.status).to.be.oneOf([200, 201]);
      auctionId = created.body.id;
      expect(auctionId).to.be.a('number');
      return cy.request({ method: 'POST', url: `${apiBaseUrl}/api/seller/auctions/${auctionId}/submit`, headers: { Authorization: `Bearer ${sellerToken}` } });
    }).then((submitted) => {
      expect(submitted.status).to.eq(200);
      return cy.request({ method: 'PUT', url: `${apiBaseUrl}/api/admin/auctions/${auctionId}/review`, headers: { Authorization: `Bearer ${adminToken}` }, body: { approved: true, note: '' } });
    }).then((approved) => {
      expect(approved.status).to.eq(200);
      expect(approved.body.status).to.eq('LIVE');
      return cy.request({ method: 'POST', url: `${apiBaseUrl}/api/auctions/${auctionId}/bids`, headers: { Authorization: `Bearer ${buyerToken}` }, body: { amount: 500 } });
    }).then((bid) => {
      expect(bid.status).to.eq(200);
      expect(bid.body.amount).to.eq(500);
    });
  });

  after(() => {
    if (!auctionId || !adminToken) return;
    cy.request({
      method: 'PUT', url: `${apiBaseUrl}/api/admin/auctions/${auctionId}/cancel`, headers: { Authorization: `Bearer ${adminToken}` },
      body: { note: `E2E-${runId} cleanup` }, failOnStatusCode: false,
    }).its('status').should('be.oneOf', [200, 404, 409]);
  });
});
