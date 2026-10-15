import { setupCommonMocks } from '../support/mockApis';

const sellerProduct = {
  id: 2,
  name: 'Charizard VMAX Shiny Secret Rare',
  game: 'Pokemon',
  type: 'Single',
  cost: 3000,
  price: 4500,
  stock: 5,
  imageUrl: null,
  productSet: 'Shining Fates',
  language: 'English',
  description: 'A marketplace card.',
  approvalStatus: 'APPROVED',
  active: true,
  storeId: 2,
  storeName: 'PokeVault Central',
};

const officialProduct = {
  id: 1,
  name: 'Pikachu Illustrator Promo Card',
  game: 'Pokemon',
  type: 'Single',
  cost: 100000,
  price: 250000,
  stock: 2,
  imageUrl: null,
  productSet: 'Promo',
  language: 'Japanese',
  description: 'An official card.',
  active: true,
  listingSource: 'OFFICIAL',
  approvalStatus: 'APPROVED',
  storeId: null,
  storeName: 'Optracard Official Store',
};

describe('Order, visibility, and catalog safeguards', () => {
  beforeEach(() => {
    setupCommonMocks();
  });

  it('requires a tracking number before a seller can mark an order as shipped', () => {
    cy.intercept('PUT', '**/api/seller/orders/1/status', {
      orderId: 1,
      orderNumber: 'ORD-2026-001',
      buyerId: 1,
      total: 4500,
      status: 'Shipped',
      paymentStatus: 'PAID',
      shippingMethod: 'standard',
      trackingNumber: 'TH123456789',
      recipientName: 'Somchai',
      recipientPhone: '0812345678',
      shippingAddress: 'Bangkok',
      createdAt: '2026-09-24T10:00:00Z',
      items: [{ productId: 2, name: sellerProduct.name, game: 'Pokemon', price: 4500, quantity: 1, storeName: 'PokeVault Central' }],
    }).as('shipOrder');
    cy.loginAs('SELLER', 'saksit', 'saksit@optracard.com', 2);
    cy.visit('/orders-management');

    cy.get('[aria-label="Tracking number for ORD-2026-001"]').should('be.visible');
    cy.get('select').select('Shipped');
    cy.contains('[role="alert"]', 'Enter a tracking number before marking ORD-2026-001 as Shipped.').should('be.visible');

    cy.contains('button', 'Close').click();
    cy.get('[aria-label="Tracking number for ORD-2026-001"]').type('TH123456789');
    cy.get('select').select('Shipped');
    cy.wait('@shipOrder').its('request.body').should('deep.include', {
      status: 'Shipped',
      trackingNumber: 'TH123456789',
    });
    cy.contains('buyer has been notified with tracking number TH123456789').should('be.visible');
  });

  it('shows a buyer shipping notification and marks it read when opened', () => {
    cy.intercept('GET', '**/api/notifications', [{
      id: 1,
      orderId: 1,
      orderNumber: 'ORD-2026-001',
      message: 'Order ORD-2026-001 has shipped. Tracking number: TH123456789',
      trackingNumber: 'TH123456789',
      createdAt: '2026-10-08T10:30:00Z',
      read: false,
    }]).as('getShippingNotification');
    cy.intercept('PUT', '**/api/notifications/read-all', { statusCode: 204, body: '' }).as('readShippingNotification');
    cy.loginAs('USER', 'somchai', 'somchai@optracard.com');
    cy.visit('/');
    cy.wait('@getShippingNotification');

    cy.get('button[aria-label="Order notifications"]').click();
    cy.wait('@readShippingNotification');
    cy.contains('Tracking number: TH123456789').should('be.visible');
    cy.contains('View order ORD-2026-001').should('be.visible');
  });

  it('shows only the delivered-card collection returned by the profile API', () => {
    cy.intercept('GET', '**/api/profile', {
      userId: 1,
      username: 'somchai',
      email: 'somchai@optracard.com',
      collection: [{ id: 7, name: 'Delivered Pikachu', game: 'Pokemon', quantity: 1, imageUrl: null }],
    }).as('getDeliveredCollection');
    cy.loginAs('USER', 'somchai', 'somchai@optracard.com');
    cy.visit('/profile');
    cy.wait('@getDeliveredCollection');

    cy.contains('Cards appear here only after their order has been delivered.').should('be.visible');
    cy.contains('Delivered Pikachu').should('be.visible');
    cy.contains('Processing-only card').should('not.exist');
  });

  it('lets a seller set a listing inactive from Edit product', () => {
    cy.intercept('GET', '**/api/seller/products/2', sellerProduct).as('getSellerProduct');
    cy.intercept('PUT', '**/api/seller/products/2/active', { ...sellerProduct, active: false }).as('setSellerInactive');
    cy.loginAs('SELLER', 'saksit', 'saksit@optracard.com', 2);
    cy.visit('/edit-product/2');
    cy.wait('@getSellerProduct');

    cy.contains('Marketplace visibility').should('be.visible');
    cy.contains('button', 'Set inactive').click();
    cy.wait('@setSellerInactive').its('request.body').should('deep.equal', { active: false });
    cy.contains('span', /^Inactive$/).should('be.visible');
  });

  it('lets an admin set an Official Store listing inactive from Edit product', () => {
    cy.intercept('GET', '**/api/admin/products/1', officialProduct).as('getOfficialProduct');
    cy.intercept('PUT', '**/api/admin/products/1/active', { ...officialProduct, active: false }).as('setOfficialInactive');
    cy.loginAs('ADMIN', 'ops_admin', 'ops@optracard.com', 100);
    cy.visit('/admin/products/1/edit');
    cy.wait('@getOfficialProduct');

    cy.contains('Storefront visibility').should('be.visible');
    cy.contains('button', 'Set inactive').click();
    cy.wait('@setOfficialInactive').its('request.body').should('deep.equal', { active: false });
    cy.contains('span', /^Inactive$/).should('be.visible');
  });

  it('allows only Marketplace templates and retains Official Store stock and prices', () => {
    const catalogMatches = [
      {
        id: 30, name: 'Shared Booster', game: 'One Piece', type: 'Booster', price: 159, stock: 28,
        imageUrl: 'https://example.test/official.jpg', productSet: 'OP-10', language: 'Japanese', description: 'Official listing.',
        source: 'OFFICIAL', store: { id: null, name: 'Optracard Official Store', storeSlug: 'optracard-official' },
      },
      {
        id: 31, name: 'Shared Booster', game: 'One Piece', type: 'Booster', price: 145, stock: 20,
        imageUrl: 'https://example.test/marketplace.jpg', productSet: 'OP-10', language: 'Japanese', description: 'Marketplace listing.',
        source: 'MARKETPLACE', store: { id: 2, name: 'AAA-Trading', storeSlug: 'aaa-trading' },
      },
    ];
    cy.intercept('GET', '**/api/admin/card-games', [
      { id: 1, name: 'Pokemon' },
      { id: 2, name: 'One Piece' },
      { id: 3, name: 'Magic: The Gathering' },
      { id: 4, name: 'Yu-Gi-Oh!' },
    ]).as('getCanonicalGames');
    cy.intercept('GET', '**/api/products/search*', catalogMatches).as('searchCatalogTemplates');
    cy.loginAs('ADMIN', 'ops_admin', 'ops@optracard.com', 100);
    cy.visit('/admin/products/new');
    cy.wait('@getCanonicalGames');

    cy.get('select').first().find('option').should('contain', 'Pokemon').and('contain', 'One Piece')
      .and('not.contain', 'Pokemon TCG').and('not.contain', 'One Piece Card Game');
    cy.get('input[placeholder*="One Piece"]').type('Shared Booster');
    cy.wait('@searchCatalogTemplates');
    cy.contains('Official Store · Already in catalog').should('be.visible');
    cy.contains('button', 'Use this product').should('have.length', 1);

    cy.get('input[type="number"]').eq(0).click().type('{selectall}77');
    cy.get('input[type="number"]').eq(1).click().type('{selectall}888');
    cy.get('input[type="number"]').eq(2).click().type('{selectall}999');
    cy.contains('button', 'Use this product').click();

    cy.get('input[placeholder*="One Piece"]').should('have.value', 'Shared Booster');
    cy.get('input[type="number"]').eq(0).should('have.value', '77');
    cy.get('input[type="number"]').eq(1).should('have.value', '888');
    cy.get('input[type="number"]').eq(2).should('have.value', '999');
  });

  it('permanently deletes a seller listing after confirmation', () => {
    let deleted = false;
    cy.intercept('GET', '**/api/seller/products', (request) => {
      request.reply(deleted ? [] : [sellerProduct]);
    }).as('getMutableSellerProducts');
    cy.intercept('DELETE', '**/api/seller/products/2', (request) => {
      deleted = true;
      request.reply({ statusCode: 204, body: '' });
    }).as('deleteSellerProduct');
    cy.loginAs('SELLER', 'saksit', 'saksit@optracard.com', 2);
    cy.visit('/seller');
    cy.contains(sellerProduct.name).should('be.visible');
    cy.window().then((window) => cy.stub(window, 'confirm').returns(true));

    cy.get('button[title="Delete product permanently"]').click();
    cy.wait('@deleteSellerProduct');
    cy.contains(sellerProduct.name).should('not.exist');
  });

  it('permanently deletes an Official Store listing after confirmation', () => {
    cy.intercept('DELETE', '**/api/admin/products/1', { statusCode: 204, body: '' }).as('deleteOfficialProduct');
    cy.loginAs('ADMIN', 'ops_admin', 'ops@optracard.com', 100);
    cy.visit('/admin/stocks');
    cy.contains(officialProduct.name).should('be.visible');
    cy.window().then((window) => cy.stub(window, 'confirm').returns(true));

    cy.get('button[title="Delete product permanently"]').first().click();
    cy.wait('@deleteOfficialProduct');
    cy.contains(/was permanently deleted from the database\./).should('be.visible');
    cy.get('tbody').should('not.contain', officialProduct.name);
  });
});
