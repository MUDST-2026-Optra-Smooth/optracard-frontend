import { setupCommonMocks } from '../support/mockApis';

describe('Cart and checkout edge cases', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.loginAs('USER', 'somchai', 'somchai@optracard.com');
  });

  it('shows an error when increasing quantity exceeds stock', () => {
    cy.visit('/cart');
    cy.get('[aria-label="Increase quantity"]').click();
    cy.get('[role="alert"]').should('be.visible');
  });

  it('updates quantity through the cart API', () => {
    cy.intercept('PUT', '**/api/cart/update*', { statusCode: 200, body: { items: [], total: 0 } }).as('updateCart');
    cy.visit('/cart');
    cy.get('[aria-label="Decrease quantity"]').click();
    cy.wait('@updateCart').its('request.url').should('include', 'quantity=');
  });

  it('removes an item through the cart API', () => {
    cy.intercept('DELETE', '**/api/cart/remove*', { statusCode: 200, body: { items: [], total: 0 } }).as('removeCart');
    cy.visit('/cart');
    cy.get('[aria-label="Remove item"]').click();
    cy.wait('@removeCart');
  });

  it('redirects to login when the cart API returns unauthorized', () => {
    cy.intercept('GET', '**/api/cart/**', { statusCode: 401, body: { message: 'Unauthorized' } }).as('cartUnauthorized');
    cy.visit('/cart');
    cy.wait('@cartUnauthorized');
    cy.url().should('include', '/login');
  });

  it('keeps the cart page visible when checkout fails', () => {
    cy.intercept('POST', '**/api/orders', { statusCode: 409, body: { message: 'Insufficient stock' } }).as('checkoutFailed');
    cy.visit('/cart');
    cy.contains('button', /Place Order/i).click();
    cy.contains(/QR Payment/i).click();
    cy.contains('button', /Confirm Order/i).click();
    cy.wait('@checkoutFailed');
    cy.url().should('include', '/cart');
    cy.get('[role="alert"]').should('be.visible');
  });
});
