import { setupCommonMocks } from '../support/mockApis';

describe('Buyer promotion and reorder flows', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.loginAs('USER', 'somchai', 'somchai@optracard.com');
  });

  it('applies a valid promotion and sends it with checkout', () => {
    cy.intercept('POST', '**/api/orders/promotion-preview', (request) => {
      expect(request.body).to.deep.equal({ code: 'SAVE10' });
      request.reply({
        code: 'SAVE10', name: 'Welcome discount', subtotal: 259000,
        discountAmount: 25900, discountedSubtotal: 233100,
      });
    }).as('previewPromotion');
    cy.intercept('POST', '**/api/orders', (request) => {
      expect(request.body).to.include({ promotionCode: 'SAVE10' });
      request.reply({ orders: [{ orderNumber: 'ORD-PROMO-001' }], total: 233150 });
    }).as('checkoutWithPromotion');

    cy.visit('/cart');
    cy.get('#promotion-code').type('save10');
    cy.contains('button', 'Apply').click();
    cy.wait('@previewPromotion');
    cy.contains('Welcome discount applied').should('be.visible');
    cy.contains('Discount (SAVE10)').should('be.visible');

    cy.contains('button', 'Place Order').click();
    cy.contains('button', 'Confirm Order').click();
    cy.wait('@checkoutWithPromotion');
    cy.location('pathname').should('eq', '/payment-success');
  });

  it('shows the server reason when a promotion cannot be applied', () => {
    cy.intercept('POST', '**/api/orders/promotion-preview', {
      statusCode: 400,
      body: { message: 'Promotion code has expired' },
    }).as('expiredPromotion');

    cy.visit('/cart');
    cy.get('#promotion-code').type('expired');
    cy.contains('button', 'Apply').click();
    cy.wait('@expiredPromotion');
    cy.get('[role="alert"]').should('contain.text', 'Promotion code has expired');
    cy.contains('Discount (EXPIRED)').should('not.exist');
  });

  it('adds available previous-order items to the cart and explains skipped items', () => {
    cy.intercept('POST', '**/api/orders/ORD-2026-001/reorder', {
      orderNumber: 'ORD-2026-001',
      addedCount: 1,
      skippedCount: 1,
      added: [{ productId: 1, name: 'Pikachu Illustrator Promo Card', requestedQuantity: 1, addedQuantity: 1 }],
      skipped: [{
        productId: 2, name: 'Charizard VMAX Shiny Secret Rare', requestedQuantity: 2,
        addedQuantity: 0, reason: 'OUT_OF_STOCK',
        message: 'Charizard VMAX Shiny Secret Rare is out of stock.',
      }],
    }).as('reorderOrder');

    cy.visit('/order-history');
    cy.contains('button', 'Order again').first().click();
    cy.wait('@reorderOrder').its('request.headers').its('authorization').should('match', /^Bearer /);
    cy.contains('1 item from order #ORD-2026-001 added to your cart.').should('be.visible');
    cy.contains('Charizard VMAX Shiny Secret Rare is out of stock.').should('be.visible');
    cy.contains('a', 'Go to cart').should('have.attr', 'href', '/cart');
  });
});
