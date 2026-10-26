import { setupCommonMocks } from '../support/mockApis';

describe('Public details and route compatibility', () => {
  beforeEach(() => setupCommonMocks());

  it('shows an error when a product detail is not found', () => {
    cy.intercept('GET', '**/api/products/999', { statusCode: 404, body: { message: 'Product not found' } }).as('missingProduct');
    cy.visit('/product/999');
    cy.wait('@missingProduct');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('shows an error when product offers cannot be loaded', () => {
    cy.intercept('GET', '**/api/products/1', { id: 1, name: 'Pikachu Illustrator Promo Card', price: 250000, stock: 2, game: 'Pokemon', type: 'Single', source: 'OFFICIAL' }).as('getProduct');
    cy.intercept('GET', '**/api/products/1/offers', { statusCode: 500, body: { message: 'Offers unavailable' } }).as('offersFailed');
    cy.visit('/product/1');
    cy.wait('@getProduct');
    cy.wait('@offersFailed');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('loads a public seller profile', () => {
    cy.intercept('GET', '**/api/marketplace/stores/2', { storeId: 2, storeName: 'PokeVault Central', ownerName: 'Saksit', storeStatus: 'APPROVED', productCount: 5, products: [] }).as('getPublicStore');
    cy.visit('/seller-profile/2');
    cy.wait('@getPublicStore');
    cy.contains('PokeVault Central').should('be.visible');
  });

  it('redirects the admin root to the admin dashboard', () => {
    cy.visit('/admin');
    cy.url().should('include', '/admin/dashboard');
  });

  it('redirects the superadmin root to the overview', () => {
    cy.loginAs('SUPER_ADMIN', 'superadmin', 'superadmin@optracard.com', 99);
    cy.visit('/superadmin');
    cy.url().should('include', '/superadmin/overview');
  });

  it('redirects an unknown route to home', () => {
    cy.visit('/route-that-does-not-exist');
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });
});
