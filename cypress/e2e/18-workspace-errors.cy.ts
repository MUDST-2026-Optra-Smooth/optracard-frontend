import { setupCommonMocks } from '../support/mockApis';

describe('Workspace error and recovery states', () => {
  beforeEach(() => setupCommonMocks());

  it('shows seller dashboard error when the API fails', () => {
    cy.loginAs('SELLER', 'saksit', 'saksit@optracard.com', 2);
    cy.intercept('GET', '**/api/seller/dashboard', { statusCode: 500, body: { message: 'Dashboard unavailable' } }).as('sellerDashboardFailed');
    cy.visit('/dashboard');
    cy.wait('@sellerDashboardFailed');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('shows seller orders error when the API fails', () => {
    cy.loginAs('SELLER', 'saksit', 'saksit@optracard.com', 2);
    cy.intercept('GET', '**/api/seller/orders', { statusCode: 500, body: { message: 'Orders unavailable' } }).as('sellerOrdersFailed');
    cy.visit('/orders-management');
    cy.wait('@sellerOrdersFailed');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('shows admin dashboard error when the API fails', () => {
    cy.loginAs('ADMIN', 'ops_admin', 'ops@optracard.com', 100);
    cy.intercept('GET', '**/api/admin/dashboard', { statusCode: 500, body: { message: 'Admin dashboard unavailable' } }).as('adminDashboardFailed');
    cy.visit('/admin/dashboard');
    cy.wait('@adminDashboardFailed');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('shows admin products error when the API fails', () => {
    cy.loginAs('ADMIN', 'ops_admin', 'ops@optracard.com', 100);
    cy.intercept('GET', '**/api/admin/products', { statusCode: 500, body: { message: 'Products unavailable' } }).as('adminProductsFailed');
    cy.visit('/admin/stocks');
    cy.wait('@adminProductsFailed');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('shows superadmin overview error when the API fails', () => {
    cy.loginAs('SUPER_ADMIN', 'superadmin', 'superadmin@optracard.com', 99);
    cy.intercept('GET', '**/api/superadmin/overview', { statusCode: 500, body: { message: 'Overview unavailable' } }).as('overviewFailed');
    cy.visit('/superadmin/overview');
    cy.wait('@overviewFailed');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('shows superadmin users error when the API fails', () => {
    cy.loginAs('SUPER_ADMIN', 'superadmin', 'superadmin@optracard.com', 99);
    cy.intercept('GET', '**/api/superadmin/users', { statusCode: 500, body: { message: 'Users unavailable' } }).as('usersFailed');
    cy.visit('/superadmin/users');
    cy.wait('@usersFailed');
    cy.get('[role="alert"]').should('be.visible');
  });
});
