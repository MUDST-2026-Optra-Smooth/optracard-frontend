import { setupCommonMocks } from '../support/mockApis';

describe('Super Admin Workspace & System Management', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.loginAs('SUPER_ADMIN', 'superadmin', 'superadmin@optracard.com', 99);
  });

  it('loads super admin overview with live GMV, stores, and export button', () => {
    cy.visit('/superadmin/overview');

    cy.contains(/Platform Overview/i).should('be.visible');
    cy.contains('Total stores').should('be.visible');
    cy.contains('Products listed').should('be.visible');
    cy.contains('PokeVault Central').should('be.visible');

    // Verify Export report action button
    cy.contains('button', /Export report/i).should('be.visible');
  });

  it('displays stores management with status filter and store list', () => {
    cy.visit('/superadmin/stores');

    cy.contains('PokeVault Central').should('be.visible');
    cy.get('select').should('be.visible');
    cy.contains('a', /View/i).should('be.visible');
  });

  it('opens store detail view with back link', () => {
    cy.visit('/superadmin/stores/2');

    cy.contains('PokeVault Central').should('be.visible');
    cy.contains('a', /Back to stores/i).should('be.visible');
  });

  it('displays catalog management with filter selects', () => {
    cy.visit('/superadmin/catalog');

    cy.contains('Pikachu Illustrator Promo Card').should('be.visible');
    cy.contains('Charizard VMAX Shiny Secret Rare').should('be.visible');

    // Filter dropdowns and navigation link
    cy.get('select').first().should('be.visible');
    cy.contains('a', /Open/i).first().should('be.visible');
  });

  it('displays transactions list and fulfillment filters', () => {
    cy.visit('/superadmin/transactions');

    cy.contains('ORD-2026-001').should('be.visible');
    cy.contains('Somchai').should('be.visible');
    cy.get('select').should('be.visible');
  });

  it('displays platform user accounts and delete modal button', () => {
    cy.visit('/superadmin/users');

    cy.contains('somchai').should('be.visible');
    cy.contains('saksit').should('be.visible');

    // Delete button
    cy.get('button[aria-label*="Delete" i]').first().should('be.visible');
  });

  it('manages staff and administrator accounts', () => {
    cy.visit('/superadmin/staff');

    cy.contains('superadmin').should('be.visible');
    cy.contains('ops_admin').should('be.visible');

    // Navigate to Add Admin form
    cy.contains('a', /\+ Add admin/i)
      .should('be.visible')
      .click();

    cy.url().should('include', '/superadmin/staff/add');
    cy.contains('a', /Back to staff/i).should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });
});
