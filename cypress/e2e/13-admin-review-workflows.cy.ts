import { setupCommonMocks } from '../support/mockApis';

describe('Admin store and marketplace review workflows', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.loginAs('ADMIN', 'ops_admin', 'ops@optracard.com', 100);
  });

  it('opens a seller store request detail', () => {
    cy.intercept('GET', '**/api/admin/stores/1', { storeId: 1, storeName: 'PokeVault Central', ownerName: 'Saksit', storeStatus: 'PENDING', physicalStore: false, productCount: 5 }).as('getStoreRequest');
    cy.visit('/admin/store-requests/1');
    cy.wait('@getStoreRequest');
    cy.contains('PokeVault Central').should('be.visible');
    cy.get('textarea').should('be.visible');
  });

  it('approves a seller store request', () => {
    cy.intercept('GET', '**/api/admin/stores/1', { storeId: 1, storeName: 'PokeVault Central', ownerName: 'Saksit', storeStatus: 'PENDING', physicalStore: false, productCount: 5 }).as('getStoreRequest');
    cy.intercept('PUT', '**/api/admin/stores/1/review', (request) => { expect(request.body).to.include({ status: 'APPROVED' }); request.reply({ statusCode: 200, body: { storeId: 1, storeName: 'PokeVault Central', storeStatus: 'APPROVED' } }); }).as('approveStore');
    cy.visit('/admin/store-requests/1');
    cy.wait('@getStoreRequest');
    cy.contains('button', /Approve/i).click();
    cy.wait('@approveStore');
    cy.contains(/approved|success/i).should('be.visible');
  });

  it('rejects a seller store request with a review note', () => {
    cy.intercept('GET', '**/api/admin/stores/1', { storeId: 1, storeName: 'PokeVault Central', ownerName: 'Saksit', storeStatus: 'PENDING', physicalStore: false, productCount: 5 }).as('getStoreRequest');
    cy.intercept('PUT', '**/api/admin/stores/1/review', (request) => { expect(request.body).to.include({ status: 'REJECTED', note: 'Missing documents' }); request.reply({ statusCode: 200, body: { storeId: 1, storeName: 'PokeVault Central', storeStatus: 'REJECTED' } }); }).as('rejectStore');
    cy.visit('/admin/store-requests/1');
    cy.wait('@getStoreRequest');
    cy.get('textarea').type('Missing documents');
    cy.contains('button', /Reject/i).click();
    cy.wait('@rejectStore');
    cy.contains(/rejected|success/i).should('be.visible');
  });

  it('approves a marketplace listing request', () => {
    cy.intercept('PUT', '**/api/admin/marketplace/requests/1/approve', { statusCode: 200, body: { id: 1, approvalStatus: 'APPROVED', active: true } }).as('approveMarketplace');
    cy.visit('/admin/marketplace/requests');
    cy.contains('Charizard VMAX Shiny').should('be.visible');
    cy.contains('button', /Approve/i).first().click();
    cy.wait('@approveMarketplace');
    cy.contains(/approved|published|success/i).should('be.visible');
  });

  it('rejects a marketplace listing with a note', () => {
    cy.intercept('PUT', '**/api/admin/marketplace/requests/1/reject', (request) => { expect(request.body).to.include({ note: 'Incorrect listing details' }); request.reply({ statusCode: 200, body: { id: 1, approvalStatus: 'REJECTED', active: false } }); }).as('rejectMarketplace');
    cy.visit('/admin/marketplace/requests');
    cy.get('textarea').type('Incorrect listing details');
    cy.contains('button', /Reject/i).first().click();
    cy.wait('@rejectMarketplace');
    cy.contains(/rejected|deactivated|success/i).should('be.visible');
  });

  it('shows an error when marketplace review fails', () => {
    cy.intercept('PUT', '**/api/admin/marketplace/requests/1/approve', { statusCode: 500, body: { message: 'Review failed' } }).as('reviewFailed');
    cy.visit('/admin/marketplace/requests');
    cy.contains('button', /Approve/i).first().click();
    cy.wait('@reviewFailed');
    cy.get('[role="alert"]').should('be.visible');
  });
});
