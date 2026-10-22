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

  it('defaults to Official Store orders and filters Marketplace orders', () => {
    cy.visit('/admin/orders');
    cy.wait('@getAdminOrders').its('request.url').should('include', 'source=OFFICIAL');

    cy.contains(/Orders/i).should('be.visible');
    cy.contains('ORD-2026-001').should('be.visible');
    cy.contains('Somchai').should('be.visible');

    cy.get('[aria-label="Order source"]').contains('button', 'Marketplace').click();
    cy.wait('@getAdminOrders').its('request.url').should('include', 'source=MARKETPLACE');
    cy.contains('ORD-2026-002').should('be.visible');
    cy.contains('Moonlight TCG').should('be.visible');
    cy.contains('ORD-2026-001').should('not.exist');

    cy.get('[aria-label="Order source"]').contains('button', 'All orders').click();
    cy.wait('@getAdminOrders').its('request.url').should('include', 'source=ALL');
    cy.contains('ORD-2026-001').should('be.visible');
    cy.contains('ORD-2026-002').should('be.visible');
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

  it('does not display a shopping cart in the admin workspace header', () => {
    cy.visit('/admin/dashboard');
    cy.get('header').find('a[aria-label="Shopping Cart"]').should('not.exist');
  });
});
