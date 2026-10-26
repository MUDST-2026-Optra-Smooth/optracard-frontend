import { setupCommonMocks } from '../support/mockApis';

describe('Seller product lifecycle', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.loginAs('SELLER', 'saksit', 'saksit@optracard.com', 2);
  });

  it('shows required fields on the add product form', () => {
    cy.visit('/add-product');
    cy.wait('@getSellerGames');
    cy.get('input[required]').should('have.length.at.least', 3);
    cy.contains('button', /Submit for approval/i).should('be.visible');
  });

  it('creates a seller product with the entered values', () => {
    cy.intercept('POST', '**/api/seller/products', (request) => {
      expect(request.body).to.include({ name: 'New Test Card', stock: 3, price: 1200 });
      request.reply({ statusCode: 201, body: { id: 10, ...request.body, approvalStatus: 'PENDING' } });
    }).as('createSellerProduct');
    cy.visit('/add-product');
    cy.wait('@getSellerGames');
    cy.get('input').eq(0).type('New Test Card');
    cy.get('input[type="number"]').eq(0).clear().type('3');
    cy.get('input[type="number"]').eq(2).clear().type('1200');
    cy.contains('button', /Submit for approval/i).click();
    cy.wait('@createSellerProduct');
  });

  it('shows an error when creating a seller product fails', () => {
    cy.intercept('POST', '**/api/seller/products', { statusCode: 500, body: { message: 'Could not save product' } }).as('createSellerProductFailed');
    cy.visit('/add-product');
    cy.wait('@getSellerGames');
    cy.get('input').eq(0).type('Broken Card');
    cy.get('input[type="number"]').eq(0).clear().type('1');
    cy.get('input[type="number"]').eq(2).clear().type('100');
    cy.contains('button', /Submit for approval/i).click();
    cy.wait('@createSellerProductFailed');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('loads an existing seller product for editing', () => {
    cy.intercept('GET', '**/api/seller/products/2', { id: 2, name: 'Charizard VMAX Shiny Secret Rare', game: 'Pokemon', type: 'Single', stock: 5, cost: 3000, price: 4500, active: true }).as('getSellerProductDetail');
    cy.visit('/edit-product/2');
    cy.wait('@getSellerProductDetail');
    cy.contains('Charizard VMAX Shiny Secret Rare').should('be.visible');
    cy.contains('button', /Save and resubmit/i).should('be.visible');
  });

  it('updates a seller product and sends the changed price', () => {
    cy.intercept('GET', '**/api/seller/products/2', { id: 2, name: 'Charizard VMAX Shiny Secret Rare', game: 'Pokemon', type: 'Single', stock: 5, cost: 3000, price: 4500, active: true }).as('getSellerProductDetail');
    cy.intercept('PUT', '**/api/seller/products/2', (request) => { expect(request.body.price).to.eq(5000); request.reply({ statusCode: 200, body: { id: 2, ...request.body } }); }).as('updateSellerProduct');
    cy.visit('/edit-product/2');
    cy.wait('@getSellerProductDetail');
    cy.get('input[type="number"]').last().clear().type('5000');
    cy.contains('button', /Save and resubmit/i).click();
    cy.wait('@updateSellerProduct');
  });

  it('shows an error when updating a seller product fails', () => {
    cy.intercept('GET', '**/api/seller/products/2', { id: 2, name: 'Charizard VMAX Shiny Secret Rare', game: 'Pokemon', type: 'Single', stock: 5, cost: 3000, price: 4500, active: true }).as('getSellerProductDetail');
    cy.intercept('PUT', '**/api/seller/products/2', { statusCode: 500, body: { message: 'Update failed' } }).as('updateSellerProductFailed');
    cy.visit('/edit-product/2');
    cy.wait('@getSellerProductDetail');
    cy.contains('button', /Save and resubmit/i).click();
    cy.wait('@updateSellerProductFailed');
    cy.get('[role="alert"]').should('be.visible');
  });
});
