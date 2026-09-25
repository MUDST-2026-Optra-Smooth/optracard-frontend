export function setupCommonMocks() {
  // Public catalog & products
  cy.intercept('GET', '**/api/products/home', { fixture: 'products.json' }).as('getProductsHome');
  cy.intercept('GET', '**/api/products/search*', { fixture: 'products.json' }).as('searchProducts');
  cy.intercept('GET', '**/api/products/1', {
    id: 1,
    name: 'Pikachu Illustrator Promo Card',
    description: 'Legendary Holy Grail Pokemon card, certified PSA 9 condition.',
    price: 250000,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=500',
    game: 'Pokemon',
    type: 'Single',
    source: 'OFFICIAL',
    listingSource: 'OFFICIAL',
    approvalStatus: 'APPROVED',
    store: { id: 1, name: 'Optracard Official Store', storeSlug: 'optracard-official' }
  }).as('getProductDetail');

  // Profile
  const profileMock = {
    userId: 1,
    username: 'somchai',
    email: 'somchai@optracard.com',
    phone: '0812345678',
    address: '123 Card St, Bangkok',
    collection: [
      { id: 1, name: 'Pikachu Illustrator Promo Card', game: 'Pokemon', quantity: 1, imageUrl: '' }
    ]
  };
  cy.intercept('GET', '**/api/profile', profileMock).as('getProfile');
  cy.intercept('GET', '**/api/users/profile', profileMock).as('getUserProfile');

  // Cart
  cy.intercept('GET', '**/api/cart/**', { fixture: 'cart.json' }).as('getCart');
  cy.intercept('GET', '**/api/cart', { fixture: 'cart.json' }).as('getCartRoot');
  cy.intercept('POST', '**/api/cart/checkout', {
    orderNumbers: ['ORD-2026-001'],
  }).as('checkoutCart');
  cy.intercept('POST', '**/api/orders', {
    orderNumber: 'ORD-2026-001',
    orders: [{ orderNumber: 'ORD-2026-001' }],
  }).as('createOrder');

  // Orders
  const ordersMock = [
    {
      orderId: 1,
      orderNumber: 'ORD-2026-001',
      total: 259000,
      status: 'Processing',
      createdAt: '2026-09-24T10:00:00Z',
      storeName: 'Optracard Official Store',
      source: 'OFFICIAL',
      shippingMethod: 'standard',
      recipientName: 'somchai',
      recipientPhone: '0812345678',
      shippingAddress: '123 Card St, Bangkok',
      items: [
        { productId: 1, name: 'Pikachu Illustrator Promo Card', quantity: 1, price: 250000, game: 'Pokemon' },
        { productId: 2, name: 'Charizard VMAX Shiny Secret Rare', quantity: 2, price: 4500, game: 'Pokemon' }
      ]
    }
  ];
  cy.intercept('GET', '**/api/orders', ordersMock).as('getOrders');
  cy.intercept('GET', '**/api/orders/ORD-2026-001', ordersMock[0]).as('getOrderDetail');
  cy.intercept('GET', '**/api/orders/*', ordersMock[0]).as('getOrderByAny');

  // Auth mocks
  cy.intercept('POST', '**/api/auth/login', {
    token: 'fake-jwt-token-user',
    userId: 1,
    username: 'somchai',
    email: 'somchai@optracard.com',
    role: 'USER',
  }).as('authLogin');

  cy.intercept('POST', '**/api/auth/register', {
    message: 'User registered successfully',
  }).as('authRegister');

  // Store & Games
  cy.intercept('GET', '**/api/stores/my', {
    id: 2,
    storeId: 2,
    storeName: 'PokeVault Central',
    storeSlug: 'pokevault-central',
    ownerName: 'saksit',
    ownerEmail: 'saksit@optracard.com',
    ownerPhone: '0898765432',
    location: 'Bangkok',
    description: 'Specialist in vintage Pokemon cards.',
    status: 'APPROVED',
  }).as('getMyStore');

  cy.intercept('GET', '**/api/marketplace/stores/*', {
    id: 2,
    storeId: 2,
    name: 'PokeVault Central',
    storeName: 'PokeVault Central',
    slug: 'pokevault-central',
    storeSlug: 'pokevault-central',
    ownerName: 'Saksit',
    ownerEmail: 'saksit@optracard.com',
    location: 'Bangkok',
    description: 'Specialist in vintage Pokemon cards.',
    rating: 4.9,
    totalSales: 120,
    products: []
  }).as('getMarketplaceStore');

  cy.intercept('GET', '**/api/seller/games', [
    { id: 1, name: 'Pokemon' },
    { id: 2, name: 'Yu-Gi-Oh!' },
    { id: 3, name: 'One Piece' }
  ]).as('getSellerGames');

  // Seller Mocks
  cy.intercept('GET', '**/api/seller/dashboard', {
    totalRevenue: 520000,
    totalOrders: 42,
    activeListings: 25,
    pendingOrders: 3,
  }).as('getSellerDashboard');

  cy.intercept('GET', '**/api/seller/orders', [
    {
      id: 1,
      orderId: 1,
      orderNumber: 'ORD-2026-001',
      buyerId: 1,
      buyerName: 'Somchai',
      recipientName: 'Somchai',
      total: 4500,
      status: 'Processing',
      paymentStatus: 'PAID',
      createdAt: '2026-09-24T10:00:00Z',
      items: [
        {
          productId: 2,
          name: 'Charizard VMAX Shiny Secret Rare',
          game: 'Pokemon',
          imageUrl: null,
          price: 4500,
          quantity: 1,
          storeName: 'PokeVault Central'
        }
      ]
    }
  ]).as('getSellerOrders');

  cy.intercept('GET', '**/api/seller/products', [
    {
      id: 2,
      name: 'Charizard VMAX Shiny Secret Rare',
      price: 4500,
      cost: 3000,
      stock: 5,
      approvalStatus: 'APPROVED',
      active: true,
      game: 'Pokemon',
      type: 'Single',
      category: 'Single',
      storeId: 2,
      storeName: 'PokeVault Central'
    }
  ]).as('getSellerProducts');

  cy.intercept('GET', '**/api/seller/profile', {
    storeName: 'PokeVault Central',
    ownerName: 'saksit',
    email: 'saksit@optracard.com',
    phone: '0898765432',
    location: 'Bangkok',
    description: 'Specialist in vintage Pokemon cards.'
  }).as('getSellerProfile');

  // Admin Mocks matching AdminDashboard type
  cy.intercept('GET', '**/api/admin/dashboard', {
    totalRevenue: 1540000,
    totalExpenses: 820000,
    totalProfit: 720000,
    totalOrders: 128,
    totalItems: 340,
    averageOrderValue: 12031,
    activeOfficialProducts: 45,
    activeMarketplaceProducts: 89,
    pendingStoreVerifications: 3,
    pendingMarketplaceRequests: 5,
    lowStockProducts: 2,
    monthlyMetrics: [
      { month: '2026-08', revenue: 650000, expenses: 340000 },
      { month: '2026-09', revenue: 890000, expenses: 480000 }
    ],
    recentOrders: [
      {
        id: 1,
        orderNumber: 'ORD-2026-001',
        buyerId: 1,
        buyerName: 'Somchai',
        total: 250000,
        source: 'OFFICIAL',
        storeId: 1,
        storeName: 'Optracard Official Store',
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        shippingMethod: 'standard',
        shippingAddress: 'Bangkok',
        recipientName: 'Somchai',
        recipientPhone: '0812345678',
        trackingNumber: null,
        createdAt: '2026-09-24T10:00:00Z',
        items: []
      }
    ]
  }).as('getAdminDashboard');

  cy.intercept('GET', '**/api/admin/products', { fixture: 'products.json' }).as('getAdminProducts');
  cy.intercept('GET', '**/api/admin/orders', [
    {
      id: 1,
      orderNumber: 'ORD-2026-001',
      buyerId: 1,
      buyerName: 'Somchai',
      total: 250000,
      source: 'OFFICIAL',
      storeId: 1,
      storeName: 'Optracard Official Store',
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      shippingMethod: 'standard',
      shippingAddress: 'Bangkok',
      recipientName: 'Somchai',
      recipientPhone: '0812345678',
      trackingNumber: null,
      createdAt: '2026-09-24T10:00:00Z',
      items: []
    }
  ]).as('getAdminOrders');

  const adminStoresMock = [
    {
      storeId: 1,
      storeSlug: 'pokevault-central',
      storeName: 'PokeVault Central',
      ownerName: 'Saksit',
      ownerEmail: 'saksit@optracard.com',
      storeStatus: 'PENDING',
      submittedAt: '2026-09-20T10:00:00Z',
      physicalStore: false,
      productCount: 5
    }
  ];
  cy.intercept('GET', '**/api/admin/store-requests*', adminStoresMock).as('getAdminStoreRequests');
  cy.intercept('GET', '**/api/admin/stores*', adminStoresMock).as('getAdminStores');

  cy.intercept('GET', '**/api/admin/marketplace/requests*', [
    {
      id: 1,
      name: 'Charizard VMAX Shiny',
      game: 'Pokemon',
      type: 'Single',
      storeName: 'PokeVault Central',
      price: 4500,
      stock: 5,
      approvalStatus: 'PENDING',
      active: true,
      cost: 3000,
      listingSource: 'MARKETPLACE'
    }
  ]).as('getAdminMarketplaceRequests');
  cy.intercept('GET', '**/api/admin/marketplace/products', { fixture: 'products.json' }).as('getAdminMarketplaceProducts');

  // Super Admin Mocks matching SuperAdminOverview type
  cy.intercept('GET', '**/api/superadmin/overview', {
    totalStores: 18,
    approvedStores: 14,
    pendingStores: 3,
    listedProducts: 134,
    activeListings: 120,
    gmvLast30Days: 2450000,
    ordersLast30Days: 128,
    averageOrderValueLast30Days: 19140,
    inStockListings: 110,
    lowStockListings: 8,
    outOfStockListings: 2,
    monthlyMetrics: [
      { month: '2026-08', revenue: 1150000, orders: 58 },
      { month: '2026-09', revenue: 1300000, orders: 70 }
    ],
    topStores: [
      { storeId: 2, storeName: 'PokeVault Central', ownerName: 'Saksit', status: 'APPROVED', productCount: 25, orderCount: 42, gmv: 520000 }
    ],
    catalogByGame: [
      { game: 'Pokemon', listings: 85 },
      { game: 'Yu-Gi-Oh!', listings: 35 },
      { game: 'One Piece', listings: 14 }
    ]
  }).as('getSuperAdminOverview');

  cy.intercept('GET', '**/api/superadmin/stores', [
    {
      storeId: 2,
      storeSlug: 'pokevault-central',
      storeName: 'PokeVault Central',
      ownerName: 'Saksit',
      ownerEmail: 'saksit@optracard.com',
      location: 'Bangkok',
      productCount: 25,
      totalStock: 120,
      orderCount: 42,
      gmv: 520000,
      storeStatus: 'APPROVED',
      submittedAt: '2026-09-10T08:00:00Z',
      activeProductCount: 22,
      products: []
    }
  ]).as('getSuperAdminStores');

  cy.intercept('GET', '**/api/superadmin/stores/2', {
    storeId: 2,
    storeSlug: 'pokevault-central',
    storeName: 'PokeVault Central',
    ownerName: 'Saksit',
    ownerEmail: 'saksit@optracard.com',
    ownerPhone: '0812345678',
    location: 'Bangkok',
    description: 'Specialist in vintage Pokemon cards.',
    storeStatus: 'APPROVED',
    submittedAt: '2026-09-10T08:00:00Z',
    reviewedAt: '2026-09-11T10:00:00Z',
    productCount: 25,
    activeProductCount: 22,
    totalStock: 120,
    orderCount: 42,
    gmv: 520000,
    products: [
      { id: 2, name: 'Charizard VMAX Shiny Secret Rare', game: 'Pokemon', type: 'Single', price: 4500, stock: 5, active: true, approvalStatus: 'APPROVED' }
    ]
  }).as('getSuperAdminStoreDetail');

  cy.intercept('GET', '**/api/superadmin/catalog', [
    { id: 1, name: 'Pikachu Illustrator Promo Card', game: 'Pokemon', type: 'Single', listingSource: 'OFFICIAL', storeName: 'Optracard Official', price: 250000, stock: 2, active: true, approvalStatus: 'APPROVED', imageUrl: '' },
    { id: 2, name: 'Charizard VMAX Shiny Secret Rare', game: 'Pokemon', type: 'Single', listingSource: 'MARKETPLACE', storeName: 'PokeVault Central', price: 4500, stock: 5, active: true, approvalStatus: 'APPROVED', imageUrl: '' }
  ]).as('getSuperAdminCatalog');

  cy.intercept('GET', '**/api/superadmin/transactions', [
    { id: 1, orderNumber: 'ORD-2026-001', buyerName: 'Somchai', storeName: 'Optracard Official Store', source: 'OFFICIAL', shippingMethod: 'Standard Delivery', itemCount: 2, total: 250000, paymentStatus: 'PAID', status: 'Processing', createdAt: '2026-09-24T10:00:00Z' }
  ]).as('getSuperAdminTransactions');

  cy.intercept('GET', '**/api/superadmin/users', [
    { id: 1, username: 'somchai', email: 'somchai@optracard.com', phone: '0812345678', role: 'USER', storeId: null, storeName: null, storeStatus: null, createdAt: '2026-09-01T12:00:00Z' },
    { id: 2, username: 'saksit', email: 'saksit@optracard.com', phone: '0898765432', role: 'SELLER', storeId: 2, storeName: 'PokeVault Central', storeStatus: 'APPROVED', createdAt: '2026-09-02T12:00:00Z' }
  ]).as('getSuperAdminUsers');

  cy.intercept('GET', '**/api/superadmin/staff', [
    { id: 99, username: 'superadmin', email: 'superadmin@optracard.com', role: 'SUPER_ADMIN', phone: '0800000000', createdAt: '2026-08-01T00:00:00Z' },
    { id: 100, username: 'ops_admin', email: 'ops@optracard.com', role: 'ADMIN', phone: '0811111111', createdAt: '2026-08-15T00:00:00Z' }
  ]).as('getSuperAdminStaff');
}
