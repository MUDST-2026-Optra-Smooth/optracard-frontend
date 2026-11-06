import { setupCommonMocks } from '../support/mockApis';

describe('Critical access and keyboard journeys', () => {
  beforeEach(() => setupCommonMocks());

  it('redirects a guest from a buyer-only route to login', () => {
    cy.visit('/order-history');

    cy.location('pathname').should('eq', '/login');
  });

  it('submits a Thai search with the keyboard and keeps its encoded query', () => {
    cy.visit('/');

    cy.get('nav input[placeholder*="Search"]').type('วันพีซ{enter}');
    cy.location('pathname').should('eq', '/search');
    cy.location('search').should('include', encodeURIComponent('วันพีซ'));
    cy.contains('One Piece').should('be.visible');
  });

  it('exposes the cart promotion failure as an accessible alert', () => {
    cy.intercept('GET', '**/api/cart/1', { fixture: 'cart.json' }).as('buyerCart');
    cy.intercept('POST', '**/api/orders/promotion-preview*', {
      statusCode: 400,
      body: { message: 'This promotion has expired' },
    }).as('expiredPromotion');
    cy.visit('/cart', {
      onBeforeLoad(window) {
        window.localStorage.setItem('token', 'fake-jwt-token-user');
        window.localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'somchai', email: 'somchai@optracard.com', role: 'USER' }));
      },
    });
    cy.wait('@buyerCart');

    cy.get('#promotion-code').type('EXPIRED');
    cy.contains('button', 'Apply').click();
    cy.wait('@expiredPromotion');
    cy.get('[role="alert"]').should('contain.text', 'This code cannot be applied: This promotion has expired.');
  });
});
