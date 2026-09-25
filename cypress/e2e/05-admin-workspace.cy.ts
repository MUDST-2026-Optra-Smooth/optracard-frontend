import { setupCommonMocks } from '../support/mockApis';

describe('Admin Workspace & Operations', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.loginAs('ADMIN', 'ops_admin', 'ops@optracard.com', 100);
  });

  it('loads admin dashboard with metrics, monthly summary, and action cards', () => {
    cy.visit('/admin/dashboard');

    cy.contains(/Dashboard/i).should('be.visible');
    cy.contains(/1,540,000|฿1,540,000/i).should('be.visible');
    cy.contains('ORD-2026-001').should('be.visible');
  });

  it('manages official stocks inventory and displays product list', () => {
    cy.visit('/admin/stocks');

    cy.contains(/Stocks|Inventory/i).should('be.visible');
    cy.contains('Pikachu Illustrator Promo Card').should('be.visible');
    cy.get('select, button').should('exist');
  });

  it('displays platform orders management', () => {
    cy.visit('/admin/orders');

    cy.contains(/Orders/i).should('be.visible');
    cy.contains('ORD-2026-001').should('be.visible');
    cy.contains('Somchai').should('be.visible');
  });

  it('displays seller store verification requests', () => {
    cy.visit('/admin/store-requests');

    cy.contains(/Store Request|Verification/i).should('be.visible');
    cy.contains('PokeVault Central').should('be.visible');
  });

  it('displays marketplace listing review requests', () => {
    cy.visit('/admin/marketplace/requests');

    cy.contains(/Marketplace|Requests|Review/i).should('be.visible');
    cy.contains('Charizard VMAX Shiny').should('be.visible');
  });
});
