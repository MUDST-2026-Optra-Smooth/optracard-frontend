describe('Deployed auction API read-only smoke',()=>{
 let base='';
 before(function(){const value=Cypress.env('API_BASE_URL');if(typeof value!=='string'||!value){this.skip();return;}base=value.replace(/\/$/,'');});
 it('lists auctions without private bidder IDs and reads public detail/history',()=>{
  cy.request(base+'/api/auctions').then(response=>{expect(response.status).to.eq(200);expect(response.body).to.be.an('array');
   for(const auction of response.body){expect(auction.winningUserId).to.be.null;expect(auction.leadingUserId).to.be.null;}
   const auction=response.body[0];if(!auction)return;
   cy.request(base+'/api/auctions/'+auction.id).then(detail=>{expect(detail.status).to.eq(200);expect(detail.body.winningUserId).to.be.null;expect(detail.body.leadingUserId).to.be.null;});
   cy.request(base+'/api/auctions/'+auction.id+'/bids').its('body').should('be.an','array');
  });
 });
 it('denies anonymous access to oversight and account notifications',()=>{
  for(const path of ['/api/superadmin/auctions','/api/auction-account/notifications'])cy.request({url:base+path,failOnStatusCode:false}).its('status').should('be.oneOf',[401,403]);
 });
});
