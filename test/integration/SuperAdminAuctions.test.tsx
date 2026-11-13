/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../../src/api/superadminAuctions';
import { SuperAdminAuctions } from '../../src/pages/SuperAdminAuctions';
import type { Auction } from '../../src/types/auction';
vi.mock('../../src/components/SPAD_Shell',()=>({SPAD_Shell:({children}:{children:React.ReactNode})=><div>{children}</div>}));
vi.mock('../../src/api/superadminAuctions',()=>({loadSuperAuctions:vi.fn(),loadAuctionSettings:vi.fn(),saveAuctionSettings:vi.fn(),loadAuctionAudit:vi.fn(),moderateAuction:vi.fn(),restrictAuctionBidder:vi.fn(),loadAuctionDisputes:vi.fn(),resolveAuctionDispute:vi.fn()}));
const settings={bidIncrement:50,checkoutHours:24,antiSnipingMinutes:5,minDurationHours:1,maxDurationHours:168};
const lot={id:1,title:'Review card',storeName:'Test shop',status:'LIVE',bidCount:1} as Auction;
beforeEach(()=>{vi.clearAllMocks();vi.mocked(api.loadSuperAuctions).mockResolvedValue({items:[lot],total:21,page:0,bidCount:10,bidValue:1200,gmv:800,sellThroughRate:0.5,sellThroughDenominator:2,expiredCount:1,sellerIncidents:{'9':2}});vi.mocked(api.loadAuctionSettings).mockResolvedValue(settings);vi.mocked(api.loadAuctionAudit).mockResolvedValue([]);vi.mocked(api.loadAuctionDisputes).mockResolvedValue([]);});
const show=()=>render(<MemoryRouter><SuperAdminAuctions/></MemoryRouter>);
describe('Superadmin auction oversight',()=>{
 it('loads metrics and server filters with pagination',async()=>{show();await screen.findByText('Review card');expect(screen.getByText('50%')).toBeInTheDocument();fireEvent.change(screen.getByLabelText('Auction status'),{target:{value:'LIVE'}});await waitFor(()=>expect(api.loadSuperAuctions).toHaveBeenLastCalledWith(expect.objectContaining({status:'LIVE',page:'0'})));fireEvent.click(screen.getByRole('button',{name:'Next'}));await waitFor(()=>expect(api.loadSuperAuctions).toHaveBeenLastCalledWith(expect.objectContaining({page:'1'})));});
 it('requires a reason before force close and records moderation',async()=>{vi.mocked(api.moderateAuction).mockResolvedValue(lot);show();await screen.findByText('Review card');fireEvent.click(screen.getByRole('button',{name:'Audit and moderate'}));expect(screen.getByRole('button',{name:'Force close'})).toBeDisabled();fireEvent.change(screen.getByLabelText('Reason'),{target:{value:'Authenticity issue'}});fireEvent.click(screen.getByRole('button',{name:'Force close'}));await waitFor(()=>expect(api.moderateAuction).toHaveBeenCalledWith(1,'CLOSE','Authenticity issue'));});
 it('keeps bid increments per auction while saving platform timing defaults',async()=>{vi.mocked(api.saveAuctionSettings).mockResolvedValue({...settings,checkoutHours:48});show();expect(await screen.findByText('Platform auction defaults')).toBeInTheDocument();expect(screen.queryByLabelText('Minimum bid increment (THB)')).not.toBeInTheDocument();fireEvent.change(screen.getByLabelText('Checkout window (hours)'),{target:{value:'48'}});fireEvent.click(screen.getByRole('button',{name:'Save auction settings'}));await waitFor(()=>expect(api.saveAuctionSettings).toHaveBeenCalledWith(expect.objectContaining({checkoutHours:48,bidIncrement:50})));expect(await screen.findByText('Settings saved. Existing auction terms are unchanged.')).toBeInTheDocument();});
 it('shows access failures without a successful dashboard',async()=>{vi.mocked(api.loadSuperAuctions).mockRejectedValue(new Error('Access denied'));show();expect(await screen.findByRole('alert')).toHaveTextContent('Access denied');expect(screen.queryByText('Review card')).not.toBeInTheDocument();});

 it('covers bidder restrictions, disputes, audit rendering and moderation errors',async()=>{
  const event={id:10,action:'UPDATED',actorId:null,createdAt:'2026-01-01T00:00:00',details:JSON.stringify({before:JSON.stringify({status:'LIVE'}),after:JSON.stringify({status:'SUSPENDED'})})} as any;
  vi.mocked(api.loadAuctionAudit).mockResolvedValue([event]);
  vi.mocked(api.loadAuctionDisputes).mockResolvedValue([{id:21,action:'OPEN',actorId:8,createdAt:'2026-01-01T00:00:00',details:'Buyer reported a problem'}] as any);
  vi.mocked(api.restrictAuctionBidder).mockResolvedValue({} as any);
  vi.mocked(api.resolveAuctionDispute).mockResolvedValue({} as any);
  vi.mocked(api.moderateAuction).mockRejectedValue(new Error('Moderation failed'));
  show();
  await screen.findByText('Review card');
  fireEvent.click(screen.getByRole('button',{name:'Audit and moderate'}));
  await waitFor(()=>expect(api.loadAuctionAudit).toHaveBeenCalledWith(1));
  expect(await screen.findByText(/status: LIVE/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Reason'),{target:{value:'policy violation'}});
  fireEvent.click(screen.getByRole('button',{name:'Suspend auction'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Moderation failed');

  fireEvent.change(screen.getByLabelText('Bidder user ID'),{target:{value:'8'}});
  fireEvent.change(screen.getByLabelText('Restriction or appeal reason'),{target:{value:'appeal review'}});
  fireEvent.click(screen.getByRole('button',{name:'Suspend bidder'}));
  await waitFor(()=>expect(api.restrictAuctionBidder).toHaveBeenCalledWith(8,true,'appeal review'));
  fireEvent.click(screen.getByRole('button',{name:'Reinstate bidder'}));
  await waitFor(()=>expect(api.restrictAuctionBidder).toHaveBeenCalledWith(8,false,'appeal review'));

  fireEvent.change(screen.getByLabelText('Decision reason'),{target:{value:'Refund approved'}});
  fireEvent.click(screen.getByRole('button',{name:'Resolve'}));
  await waitFor(()=>expect(api.resolveAuctionDispute).toHaveBeenCalledWith(21,'RESOLVED','Refund approved'));
 });

 it('handles settings and dispute loading failures plus filter controls',async()=>{
  vi.mocked(api.loadAuctionSettings).mockRejectedValue(new Error('Settings unavailable'));
  vi.mocked(api.loadAuctionDisputes).mockRejectedValue(new Error('Disputes unavailable'));
  vi.mocked(api.loadSuperAuctions).mockResolvedValue({items:[],total:0,page:0,bidCount:0,bidValue:0,gmv:0,sellThroughRate:0,sellThroughDenominator:0,expiredCount:0,sellerIncidents:{}});
  show();
  expect(await screen.findByRole('alert')).toHaveTextContent(/unavailable/);
  fireEvent.change(screen.getByLabelText('Search all auctions'),{target:{value:'Pokemon'}});
  fireEvent.change(screen.getByLabelText('Store ID'),{target:{value:'7'}});
  fireEvent.change(screen.getByLabelText('Created from'),{target:{value:'2026-01-01'}});
  fireEvent.change(screen.getByLabelText('Created to'),{target:{value:'2026-01-31'}});
  await waitFor(()=>expect(api.loadSuperAuctions).toHaveBeenLastCalledWith(expect.objectContaining({query:'Pokemon',storeId:'7',startDate:'2026-01-01',endDate:'2026-01-31',page:'0'})));
 });

 it('shows empty incidents and handles malformed audit details and settings save errors',async()=>{
  vi.mocked(api.loadSuperAuctions).mockResolvedValue({items:[lot],total:1,page:0,bidCount:0,bidValue:0,gmv:0,sellThroughRate:0,sellThroughDenominator:0,expiredCount:0,sellerIncidents:{}});
  vi.mocked(api.loadAuctionAudit).mockResolvedValue([{id:11,action:'NOTE',actorId:2,createdAt:'2026-01-01T00:00:00',details:'not json'}] as any);
  vi.mocked(api.saveAuctionSettings).mockRejectedValue(new Error('Cannot save settings'));
  show();
  await screen.findByText('No seller incidents in the selected period.');
  fireEvent.click(screen.getByRole('button',{name:'Audit and moderate'}));
  expect(await screen.findByText('not json')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Checkout window (hours)'),{target:{value:'48'}});
  fireEvent.click(screen.getByRole('button',{name:'Save auction settings'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Cannot save settings');
 });
});
