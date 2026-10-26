import { setupCommonMocks } from '../support/mockApis';

describe('API error handling and recovery', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.clearLocalStorage();
  });

  it('shows the login error when authentication fails', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid email or password' },
    }).as('loginFailed');

    cy.visit('/login');
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrong-password');
    cy.on('window:alert', (message) => {
      expect(message).to.match(/invalid email or password|login failed|unable to login/i);
    });
    cy.get('button[type="submit"]:visible').last().click({ force: true });
    cy.wait('@loginFailed');
  });

  it('shows a catalog error when the home request fails', () => {
    cy.intercept('GET', '**/api/products/home', {
      statusCode: 500,
      body: { message: 'Catalog unavailable' },
    }).as('catalogFailed');

    cy.visit('/');
    cy.wait('@catalogFailed');
    cy.contains(/catalog unavailable|failed|error|try again/i).should('be.visible');
  });

  it('shows an error when checkout cannot create an order', () => {
    cy.loginAs('USER', 'somchai', 'somchai@optracard.com');
    cy.intercept('POST', '**/api/orders', {
      statusCode: 409,
      body: { message: 'Insufficient stock' },
    }).as('checkoutFailed');

    cy.visit('/cart');
    cy.contains('button', /Place Order/i).click();
    cy.contains(/QR Payment/i).click();
    cy.contains('button', /Confirm Order/i).click();
    cy.wait('@checkoutFailed');
    cy.contains(/insufficient stock|could not|failed|error/i).should('be.visible');
    cy.url().should('include', '/cart');
  });

  it('renders an empty cart state', () => {
    cy.loginAs('USER');
    cy.intercept('GET', '**/api/cart/**', { statusCode: 200, body: { items: [], total: 0 } }).as('emptyCart');
    cy.visit('/cart');
    cy.wait('@emptyCart');
    cy.contains(/empty cart|no items|your cart is empty/i).should('be.visible');
  });
});
