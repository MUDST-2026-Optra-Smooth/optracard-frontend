import { setupCommonMocks } from '../support/mockApis';

const adminOrder = {
  id: 1, orderNumber: 'ORD-2026-001', buyerName: 'Somchai', total: 250000,
  source: 'OFFICIAL', storeName: 'Optracard Official Store', status: 'Processing',
  paymentStatus: 'PAID', shippingMethod: 'standard', shippingAddress: 'Bangkok',
  recipientName: 'Somchai', recipientPhone: '0812345678', trackingNumber: null,
  createdAt: '2026-09-24T10:00:00Z', items: [],
};

describe('Admin order and product actions', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.loginAs('ADMIN', 'ops_admin', 'ops@optracard.com', 100);
  });

  it('opens an admin order detail page', () => {
    cy.intercept('GET', '**/api/admin/orders/1', adminOrder).as('getAdminOrder');
    cy.visit('/admin/orders/1');
    cy.wait('@getAdminOrder');
    cy.contains('ORD-2026-001').should('be.visible');
    cy.contains(/Admin order view|Current status/i).should('be.visible');
  });

  it('updates an order status with a tracking number', () => {
    cy.intercept('GET', '**/api/admin/orders/1', adminOrder).as('getAdminOrder');
    cy.intercept('PUT', '**/api/admin/orders/1/status', (request) => {
      expect(request.body).to.include({ status: 'SHIPPED', trackingNumber: 'TH-12345' });
      request.reply({ statusCode: 200, body: { ...adminOrder, status: 'Shipped', trackingNumber: 'TH-12345' } });
    }).as('updateAdminOrder');
    cy.visit('/admin/orders/1');
    cy.wait('@getAdminOrder');
    cy.get('input').filter(':visible').first().type('TH-12345');
    cy.contains('button', /Update status in database/i).click();
    cy.wait('@updateAdminOrder');
  });

  it('shows an error when updating an order fails', () => {
    cy.intercept('GET', '**/api/admin/orders/1', adminOrder).as('getAdminOrder');
    cy.intercept('PUT', '**/api/admin/orders/1/status', { statusCode: 500, body: { message: 'Update failed' } }).as('updateAdminOrderFailed');
    cy.visit('/admin/orders/1');
    cy.wait('@getAdminOrder');
    cy.get('input').filter(':visible').first().type('TH-12345');
    cy.contains('button', /Update status in database/i).click();
    cy.wait('@updateAdminOrderFailed');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('opens an official product detail page', () => {
    cy.intercept('GET', '**/api/admin/products/1', { id: 1, name: 'Pikachu Illustrator Promo Card', price: 250000, stock: 2, active: true, approvalStatus: 'APPROVED', source: 'OFFICIAL' }).as('getAdminProduct');
    cy.visit('/admin/products/1');
    cy.wait('@getAdminProduct');
    cy.contains('Pikachu Illustrator Promo Card').should('be.visible');
    cy.contains('button', /Delete permanently/i).should('be.visible');
  });

  it('redirects the admin root to the dashboard', () => {
    cy.visit('/admin');
    cy.url().should('eq', `${Cypress.config().baseUrl}/admin/dashboard`);
  });

  it('shows an error when an admin product cannot be loaded', () => {
    cy.intercept('GET', '**/api/admin/products/999', { statusCode: 404, body: { message: 'Product not found' } }).as('missingAdminProduct');
    cy.visit('/admin/products/999');
    cy.wait('@missingAdminProduct');
    cy.get('[role="alert"]').should('be.visible');
  });
});
