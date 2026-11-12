import { auctionRequest as request } from './auctions';
import type { Auction } from '../types/auction';
export interface AuctionSettings { bidIncrement:number; checkoutHours:number; antiSnipingMinutes:number; minDurationHours:number; maxDurationHours:number }
export interface AuctionOverview {items:Auction[];total:number;page:number;bidCount:number;bidValue:number;gmv:number;sellThroughRate:number;sellThroughDenominator:number;expiredCount:number;sellerIncidents:Record<string,number>}
export interface AuctionAudit {id:number;actorId:number|null;action:string;details:string;createdAt:string}
export const loadSuperAuctions=(filters:Record<string,string>)=>request<AuctionOverview>('/api/superadmin/auctions?'+new URLSearchParams(filters));
export const loadAuctionSettings=()=>request<AuctionSettings>('/api/superadmin/auctions/settings');
export const saveAuctionSettings=(settings:AuctionSettings)=>request<AuctionSettings>('/api/superadmin/auctions/settings',{method:'PUT',body:JSON.stringify(settings)});
export const loadAuctionAudit=(id:number)=>request<AuctionAudit[]>('/api/superadmin/auctions/'+id+'/audit');
export const moderateAuction=(id:number,action:string,reason:string)=>request<Auction>('/api/superadmin/auctions/'+id+'/moderation',{method:'PUT',body:JSON.stringify({action,reason})});
export const restrictAuctionBidder=(id:number,banned:boolean,reason:string)=>request('/api/superadmin/auctions/bidders/'+id+'/restriction',{method:'PUT',body:JSON.stringify({banned,reason})});
export const loadAuctionDisputes=()=>request<AuctionAudit[]>('/api/superadmin/auctions/disputes');
export const resolveAuctionDispute=(id:number,status:string,reason:string)=>request('/api/superadmin/auctions/disputes/'+id,{method:'PUT',body:JSON.stringify({status,reason})});
