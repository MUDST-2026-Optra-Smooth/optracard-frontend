import { setupCommonMocks } from '../support/mockApis';

describe('Full mocked auction and settlement role workflows', () => {
  beforeEach(() => setupCommonMocks());

  it('lets a seller submit a draft auction and inspect an auction settlement', () => {
    cy.visit('/seller/auctions', {
      onBeforeLoad(window) {
        window.localStorage.setItem('token', 'seller-token');
        window.localStorage.setItem('user', JSON.stringify({ userId: 2, username: 'seller', email: 'seller@example.com', role: 'SELLER' }));
      },
    });
    cy.wait('@getSellerAuctions');
    cy.contains('button', 'Submit').click();
    cy.wait('@submitSellerAuction').its('request.method').should('eq', 'POST');

    cy.visit('/seller/settlements');
    cy.wait('@getSellerSettlements');
    cy.contains('AUC-101').should('be.visible');
    cy.get('select').select('AUCTION_CHARGE');
    cy.contains('button', 'Apply filters').click();
    cy.wait('@getSellerSettlements').its('request.url').should('include', 'type=AUCTION_CHARGE');
  });

  it('lets an administrator approve a pending auction with the review API contract', () => {
    cy.visit('/admin/auctions', {
      onBeforeLoad(window) {
        window.localStorage.setItem('token', 'admin-token');
        window.localStorage.setItem('user', JSON.stringify({ userId: 99, username: 'admin', email: 'admin@example.com', role: 'ADMIN' }));
      },
    });
    cy.wait('@getAdminAuctions');
    cy.contains('button', 'Approve').click();
    cy.wait('@reviewAuction').its('request.body').should('deep.equal', { approved: true, note: '' });
  });
});
