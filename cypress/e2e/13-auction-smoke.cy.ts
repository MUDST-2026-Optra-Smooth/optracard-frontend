import { setupCommonMocks } from '../support/mockApis';

describe('Critical auction browse and bidding journeys', () => {
  beforeEach(() => setupCommonMocks());

  it('lets a visitor browse, search, and filter published auctions', () => {
    cy.visit('/auctions');
    cy.wait('@getAuctions');
    cy.contains('Auction Hub').should('be.visible');
    cy.contains('Umbreon VMAX Alternate Art').should('be.visible');
    cy.get('input[placeholder="Search auctions"]').type('Pikachu');
    cy.contains('Pikachu Trophy Promo').should('be.visible');
    cy.contains('Umbreon VMAX Alternate Art').should('not.exist');
    cy.get('input[placeholder="Search auctions"]').clear();
    cy.get('select[aria-label="Source"]').select('MARKETPLACE');
    cy.wait('@getAuctions');
    cy.contains('Umbreon VMAX Alternate Art').should('be.visible');
  });

  it('keeps an unauthenticated visitor from bidding and exposes the action accessibly', () => {
    cy.visit('/auctions/101');
    cy.wait('@getAuctionDetail');
    cy.wait('@getAuctionBids');
    cy.contains('You are currently the highest bidder').should('not.exist');
    cy.contains('button', 'Log in to bid').should('be.enabled');
    cy.get('input[type="number"]').should('be.disabled');
  });

  it('submits an authenticated bid with the exact outbound amount and retains the leading-bid notice', () => {
    cy.visit('/auctions/101', {
      onBeforeLoad(window) {
        window.localStorage.setItem('token', 'fake-jwt-token-user');
        window.localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'somchai', email: 'somchai@optracard.com', role: 'USER' }));
      },
    });
    cy.wait('@getAuctionDetail');
    cy.get('input[type="number"]').type('1300');
    cy.contains('button', 'Raise your bid').click();
    cy.wait('@placeAuctionBid').its('request.body').should('deep.equal', { amount: 1300 });
    cy.contains('[role="status"]', 'currently the highest bidder').should('be.visible');
  });
});
