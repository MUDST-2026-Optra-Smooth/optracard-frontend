import { setupCommonMocks } from '../support/mockApis';

describe('Seller Portal & Store Management', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.loginAs('SELLER', 'saksit', 'saksit@optracard.com', 2);
  });

  it('loads seller dashboard with store info, metrics, and summary cards', () => {
    cy.visit('/dashboard');

    cy.contains('PokeVault Central').should('be.visible');
    cy.contains(/Products|Listings|Review/i).should('exist');
    cy.contains(/4,500|฿4,500|Total Products/i).should('exist');
  });

  it('loads seller stock/inventory management view', () => {
    cy.visit('/seller');

    cy.contains(/Inventory|Products|Stock/i).should('be.visible');
    cy.contains('Charizard VMAX Shiny Secret Rare').should('be.visible');
    cy.contains(/Approved|Active/i).should('exist');
  });

  it('loads seller orders management page', () => {
    cy.visit('/orders-management');

    cy.contains(/Order Management|Orders/i).should('be.visible');
    cy.contains('ORD-2026-001').should('be.visible');
    cy.contains('Somchai').should('be.visible');
  });

  it('navigates to Add Product form and displays required fields', () => {
    cy.visit('/add-product');

    cy.contains(/Marketplace listing|Back to Stocks/i).should('be.visible');
    cy.contains('label', /Product name/i).find('input').should('be.visible');
    cy.contains('label', /Selling price/i).find('input').should('be.visible');
  });

  it('displays seller store profile', () => {
    cy.visit('/seller-profile/my');

    cy.contains('PokeVault Central').should('be.visible');
    cy.contains(/Specialist in vintage Pokemon cards/i).should('be.visible');
  });
});
