import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { loadAuctionNotifications, readAuctionNotification, type AuctionNotification } from '../api/auctions';
export const AuctionNotifications = () => {
 const {user}=useAuth();
 const destination=(event:AuctionNotification)=>user?.role==='SUPER_ADMIN'?'/superadmin/auctions':user?.role==='ADMIN'?'/admin/auctions':user?.role==='SELLER'&&['APPROVE','REJECT','ADMIN_CANCEL','SELLER_CANCEL','WINNER_SELECTED','CHECKOUT'].includes(event.action)?'/seller/auctions':'/auctions/'+event.auctionId;
 const [rows,setRows]=useState<AuctionNotification[]>([]);const [error,setError]=useState('');const [loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;let timer:ReturnType<typeof setTimeout>;const load=async()=>{try{const data=await loadAuctionNotifications();if(active){setRows(data);setError('');}}catch(e){if(active)setError(e instanceof Error?e.message:'Could not load notifications.');}finally{if(active){setLoading(false);timer=setTimeout(()=>void load(),15000);}}};void load();return()=>{active=false;clearTimeout(timer);};},[]);
 const read=async(id:number)=>{try{await readAuctionNotification(id);setRows(r=>r.map(e=>e.id===id?{...e,readAt:new Date().toISOString()}:e));}catch(e){setError(e instanceof Error?e.message:'Could not mark notification read.');}};
 return <div className="mx-auto max-w-3xl space-y-4 px-5 py-10"><h1 className="text-3xl font-bold">Auction notifications</h1><Link to="/my-auctions">My bids and wins</Link>{error&&<p role="alert">{error}</p>}{loading?<p>Loading notifications...</p>:rows.length===0?<p>No auction notifications yet.</p>:rows.map(e=><article key={e.id} className={'rounded-xl border p-4 '+(e.readAt?'bg-white':'bg-blue-50')}><p className="font-semibold">{e.details}</p><p className="text-sm text-slate-500">{e.createdAt}</p><Link to={destination(e)}>View auction</Link>{!e.readAt&&<button className="ml-5 underline" onClick={()=>void read(e.id)}>Mark as read</button>}</article>)}</div>;
};
