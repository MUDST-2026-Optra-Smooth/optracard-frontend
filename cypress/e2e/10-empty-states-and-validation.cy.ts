import { setupCommonMocks } from '../support/mockApis';

describe('Empty states and form validation', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.clearLocalStorage();
  });

  it('shows no-results state for an unmatched product search', () => {
    cy.intercept('GET', '**/api/products/search*', { statusCode: 200, body: [] }).as('emptySearch');
    cy.visit('/search?q=does-not-exist');
    cy.wait('@emptySearch');
    cy.contains(/no products|no results|not found/i).should('be.visible');
  });

  it('rejects mismatched registration passwords before calling the API', () => {
    cy.intercept('POST', '**/api/auth/register').as('registerRequest');
    cy.visit('/register');
    cy.get('input[name="username"]').type('newuser');
    cy.get('input[name="email"]').type('new@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('different456');
    cy.get('button[type="submit"]').click();
    cy.contains(/passwords do not match/i).should('be.visible');
    cy.get('@registerRequest.all').should('have.length', 0);
  });

  it('requires login fields', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    cy.get('input[name="email"]').should('have.attr', 'required');
    cy.get('input[name="password"]').should('have.attr', 'required');
  });

  it('shows an empty order history state', () => {
    cy.loginAs('USER');
    cy.intercept('GET', '**/api/orders', { statusCode: 200, body: [] }).as('emptyOrders');
    cy.visit('/order-history');
    cy.wait('@emptyOrders');
    cy.contains(/no orders|order history is empty|haven't placed/i).should('be.visible');
  });

  it('shows an empty seller inventory state', () => {
    cy.loginAs('SELLER', 'saksit', 'saksit@optracard.com', 2);
    cy.intercept('GET', '**/api/seller/products', { statusCode: 200, body: [] }).as('emptySellerProducts');
    cy.visit('/seller');
    cy.wait('@emptySellerProducts');
    cy.contains(/no products|no listings|empty/i).should('be.visible');
  });
});
