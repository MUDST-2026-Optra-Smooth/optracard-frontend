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
    cy.get('nav').should('contain.text', 'Optracard');
  });

  it('returns public catalog, search, product, and published auction responses from the deployed backend', () => {
    cy.then(() => {
      cy.request(`${apiBaseUrl}/api/products/home`).then((catalog) => {
        expect(catalog.status).to.eq(200);
        expect(catalog.body).to.be.an('array');

        cy.request(`${apiBaseUrl}/api/products/search?q=pokemon`).then((search) => {
          expect(search.status).to.eq(200);
          expect(search.body).to.be.an('array');
        });

        const productId = catalog.body[0]?.id ?? catalog.body[0]?.proId;
        if (productId !== undefined) {
          cy.request(`${apiBaseUrl}/api/products/${productId}`).its('status').should('eq', 200);
        }

        cy.request(`${apiBaseUrl}/api/auctions?status=LIVE`).then((auctions) => {
          expect(auctions.status).to.eq(200);
          expect(auctions.body).to.be.an('array');
          const auctionId = auctions.body[0]?.id;
          if (auctionId !== undefined) {
            cy.request(`${apiBaseUrl}/api/auctions/${auctionId}`).then((auction) => {
              expect(auction.status).to.eq(200);
              expect(auction.body).to.have.property('status');
              expect(auction.body).to.have.property('currentPrice');
            });
          }
        });
      });
    });
  });

  it('authenticates a dedicated smoke user and reads only profile and history', function () {
    const email = Cypress.env('E2E_EMAIL');
    const password = Cypress.env('E2E_PASSWORD');
    if (!email || !password) this.skip();

    cy.then(() => {
      cy.request('POST', `${apiBaseUrl}/api/auth/login`, { email, password }).then((login) => {
        expect(login.status).to.eq(200);
        expect(login.body.token).to.be.a('string').and.not.be.empty;
        const headers = { Authorization: `Bearer ${login.body.token}` };
        cy.request({ url: `${apiBaseUrl}/api/profile`, headers }).then((profile) => {
          expect(profile.status).to.eq(200);
          expect(profile.body.email).to.eq(email);
        });
        cy.request({ url: `${apiBaseUrl}/api/orders`, headers }).its('status').should('eq', 200);
      });
    });
  });
});
