import { setupCommonMocks } from '../support/mockApis';

describe('Auction buyer navigation and checkout',()=>{
 it('browses, bids, sees a win, checks out and finds the auction order',()=>{
  setupCommonMocks();cy.loginAs('USER','auctionbuyer','buyer@auction.test',1);
  const now=Date.now();
  let auction={id:501,title:'E2E auction card',game:'Pokemon',type:'Single',imageUrl:null,description:'Verified card',startingPrice:100,currentPrice:100,bidCount:0,startsAt:new Date(now-3600000).toISOString(),endsAt:new Date(now+3600000).toISOString(),checkoutDeadline:new Date(now+86400000).toISOString(),status:'LIVE',source:'OFFICIAL',storeId:null,storeName:'Optracard Official Store',sellerUserId:9,winningUserId:null as number|null,leadingUserId:null as number|null,reviewNote:null,createdAt:new Date(now).toISOString()};
  cy.intercept('GET',/\/api\/auctions(?:\?.*)?$/,{body:[auction]}).as('hub');
  cy.intercept('GET','**/api/auctions/501',req=>req.reply({body:auction})).as('detail');
  cy.intercept('GET','**/api/auctions/501/bids',{body:[]});
  cy.intercept('POST','**/api/auctions/501/bids',req=>{expect(req.body.amount).to.eq(100);auction={...auction,bidCount:1,status:'AWAITING_CHECKOUT',winningUserId:1,leadingUserId:1};req.reply({body:{id:1,amount:100,bidderCode:'Bidder A',createdAt:new Date(now).toISOString()}});}).as('bid');
  cy.intercept('POST','**/api/auctions/501/checkout',req=>{expect(req.body.shippingMethod).to.eq('PICKUP');auction={...auction,status:'COMPLETED'};req.reply({body:auction});}).as('checkout');
  cy.intercept('GET','**/api/orders',{body:[{orderId:701,orderNumber:'ORD-AUCTION-701',auctionId:501,createdAt:new Date(now).toISOString(),status:'Processing',storeName:'Optracard Official Store',source:'OFFICIAL',shippingMethod:'PICKUP',total:100,items:[{productId:10,name:'E2E auction card',game:'Pokemon',storeName:'Optracard Official Store',price:100,quantity:1}]}]}).as('orders');
  cy.visit('/auctions');cy.wait('@hub');cy.contains('E2E auction card').click();cy.wait('@detail');
  cy.get('input[type="number"]').type('100');cy.contains('button','Place bid').click();cy.wait('@bid');
  cy.contains('Complete auction checkout').click();cy.contains('label','Recipient name').find('input').type('Auction Buyer');cy.contains('label','Phone number').find('input').type('0800000000');cy.contains('label','Fulfilment method').find('select').select('PICKUP');cy.contains('button','Pay and place auction order').click();cy.wait('@checkout');cy.wait('@orders');cy.url().should('include','/order-history');cy.contains('Auction win #501').should('be.visible');cy.contains('E2E auction card').should('be.visible');
 });
 it('requires login before auction checkout',()=>{setupCommonMocks();cy.clearLocalStorage();cy.visit('/auctions/501/checkout');cy.url().should('include','/login');});
});
