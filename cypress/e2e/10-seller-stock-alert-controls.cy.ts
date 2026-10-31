import { setupCommonMocks } from '../support/mockApis';

describe('Seller stock alert controls', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.intercept('GET', '**/api/stock-alerts', [
      { productId: 2, productName: 'Charizard VMAX Shiny Secret Rare', currentStock: 5, alertType: 'LOW_STOCK' },
    ]).as('getSellerStockAlerts');
    cy.loginAs('SELLER', 'saksit', 'saksit@optracard.com', 2);
  });

  it('persists a seller-specific stock alert threshold and refreshes alerts', () => {
    cy.intercept('PUT', '**/api/stock-alerts/settings', (request) => {
      expect(request.body).to.deep.equal({ defaultThreshold: 8 });
      request.reply({ defaultThreshold: 8 });
    }).as('saveSellerThreshold');

    cy.visit('/seller');
    cy.wait('@getSellerStockAlerts');
    cy.contains('Store stock alert threshold').should('be.visible');
    cy.contains('label', 'Store threshold').find('input').click().type('{backspace}8');
    cy.contains('button', 'Save threshold').click();
    cy.wait('@saveSellerThreshold');
    cy.contains('This store now uses 8 as its stock alert threshold.').should('be.visible');
  });

  it('blocks an invalid seller threshold without calling the API', () => {
    cy.intercept('PUT', '**/api/stock-alerts/settings').as('invalidSellerThreshold');

    cy.visit('/seller');
    // A number input may reject decimal keystrokes before React receives them.
    // Use zero instead: it is a valid numeric value for the control, but outside
    // the permitted threshold range, so this exercises the client-side guard.
    cy.contains('label', 'Store threshold').find('input').click().type('{backspace}0');
    cy.contains('button', 'Save threshold').click();
    cy.get('[role="alert"]').should('contain.text', 'between 1 and 100,000');
    cy.get('@invalidSellerThreshold.all').should('have.length', 0);
  });
});
