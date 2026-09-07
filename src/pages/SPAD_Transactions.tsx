import { useMemo, useState } from 'react';
import { SPAD_ExportButton, SPAD_FilterBar, SPAD_FilterField, SPAD_Input, SPAD_Pagination, SPAD_Panel, SPAD_SectionHeading, SPAD_StatCard, SPAD_StatusBadge, SPAD_Select } from '../components/SPAD_Widgets';
import { SPAD_Shell } from '../components/SPAD_Shell';

const transactions = [
  { id: 'ORD-20250819-0842', store: 'Pokemon Center TH', buyer: 'Buyer_08421', items: '3', amount: '฿6,980', payment: 'Paid', tone: 'green' as const, date: '19 Aug 2025\n14:12', dateValue: '2025-08-19' },
  { id: 'ORD-20250819-0839', store: 'Card Realm', buyer: 'Buyer_07118', items: '2', amount: '฿3,420', payment: 'Shipped', tone: 'blue' as const, date: '19 Aug 2025\n13:48', dateValue: '2025-08-19' },
  { id: 'ORD-20250819-0828', store: 'Meta TCG', buyer: 'Buyer_09377', items: '1', amount: '฿3,200', payment: 'Pending', tone: 'orange' as const, date: '19 Aug 2025\n12:20', dateValue: '2025-08-19' },
  { id: 'ORD-20250818-0812', store: "Dragon's Shield", buyer: 'Buyer_05644', items: '4', amount: '฿1,450', payment: 'Paid', tone: 'green' as const, date: '18 Aug 2025\n17:42', dateValue: '2025-08-18' },
  { id: 'ORD-20250818-0798', store: "Collector's Club", buyer: 'Buyer_05112', items: '1', amount: '฿42,000', payment: 'Refunded', tone: 'red' as const, date: '18 Aug 2025\n16:30', dateValue: '2025-08-18' },
];

const dateRangeOptions = [
  { value: '', label: 'All time' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last-7-days', label: 'Last 7 days' },
  { value: 'last-30-days', label: 'Last 30 days' },
  { value: 'last-90-days', label: 'Last 90 days' },
  { value: 'this-year', label: 'This year' },
];

const orderStatusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Refunded', label: 'Refunded' },
];

const latestTransactionDate = new Date('2025-08-19T23:59:59');

const isWithinDateRange = (dateValue: string, range: string) => {
  if (!range) return true;
  const transactionDate = new Date(dateValue);
  const daysSinceLatest = Math.floor((latestTransactionDate.getTime() - transactionDate.getTime()) / 86_400_000);
  if (range === 'yesterday') return daysSinceLatest === 1;
  if (range === 'last-7-days') return daysSinceLatest >= 0 && daysSinceLatest < 7;
  if (range === 'last-30-days') return daysSinceLatest >= 0 && daysSinceLatest < 30;
  if (range === 'last-90-days') return daysSinceLatest >= 0 && daysSinceLatest < 90;
  if (range === 'this-year') return transactionDate.getFullYear() === latestTransactionDate.getFullYear();
  return true;
};

export function SPAD_Transactions() {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [status, setStatus] = useState('');
  const visibleTransactions = useMemo(() => transactions.filter((transaction) => {
    const matchesQuery = `${transaction.id} ${transaction.store} ${transaction.buyer}`.toLowerCase().includes(appliedQuery.toLowerCase());
    const matchesDate = isWithinDateRange(transaction.dateValue, dateRange);
    const matchesStatus = !status || transaction.payment === status;
    return matchesQuery && matchesDate && matchesStatus;
  }), [appliedQuery, dateRange, status]);

  return (
    <SPAD_Shell>
      <div className="mx-auto max-w-[1440px] space-y-4">
        <SPAD_SectionHeading eyebrow="05 / Transactions" title="Sales & Transactions" description="Monitor platform-wide sales activity across all stores" action={<><span className="hidden rounded border border-[#e1e6ee] bg-white px-3 py-2 text-[8px] font-semibold text-[#687486] sm:inline-flex">✦ Aggregated marketplace data</span><SPAD_ExportButton label="Export transactions" fileName="optracard-transactions.csv" rows={transactions.map((transaction) => ({ 'Order ID': transaction.id, Store: transaction.store, 'Buyer ID': transaction.buyer, Items: transaction.items, Total: transaction.amount, Status: transaction.payment, Date: transaction.date }))} /></>} />

        <div className="grid gap-3 md:grid-cols-3"><SPAD_StatCard label="GMV · 30 days" value="฿8.42M" detail="+14.8%" /><SPAD_StatCard label="Completed orders" value="1,284" detail="+13.2%" tone="teal" /><SPAD_StatCard label="Avg. order value" value="฿1,864" detail="+2.3%" tone="orange" /></div>

        <SPAD_FilterBar>
          <SPAD_FilterField label="Search transaction"><SPAD_Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Order ID, store or buyer ID" /></SPAD_FilterField>
          <SPAD_FilterField label="Date range"><SPAD_Select value={dateRange} onChange={(event) => setDateRange(event.target.value)}>{dateRangeOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}</SPAD_Select></SPAD_FilterField>
          <SPAD_FilterField label="Order status"><SPAD_Select value={status} onChange={(event) => setStatus(event.target.value)}>{orderStatusOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}</SPAD_Select></SPAD_FilterField>
          <button type="button" onClick={() => setAppliedQuery(query.trim())} className="self-end rounded bg-[#2f65ff] px-4 py-2 text-[9px] font-bold text-white hover:bg-[#1647c4]">⌕ Search</button>
        </SPAD_FilterBar>

        <SPAD_Panel title="Recent marketplace orders · 1,284 orders" subtitle="Sales and orders from all stores across the marketplace." action={<span className="text-[8px] text-[#a1a8b3]">Showing first 5</span>}>
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="border-b border-[#edf0f4] bg-[#f4f7fb] text-[8px] font-bold text-[#687486]"><tr><th className="px-3 py-2.5">Order ID</th><th className="px-3 py-2.5">Store</th><th className="px-3 py-2.5">Buyer ID</th><th className="px-3 py-2.5 text-center">Items</th><th className="px-3 py-2.5 text-right">Order total</th><th className="px-3 py-2.5">Payment status</th><th className="px-3 py-2.5 text-right">Date &amp; time</th></tr></thead><tbody className="divide-y divide-[#f0f2f5] text-[9px]">{visibleTransactions.map((transaction) => <tr key={transaction.id} className="hover:bg-[#fafbfd]"><td className="px-3 py-2.5 font-bold text-[#2f65ff]">{transaction.id}</td><td className="px-3 py-2.5 font-semibold text-[#303844]">{transaction.store}</td><td className="px-3 py-2.5 text-[#687486]">{transaction.buyer}</td><td className="px-3 py-2.5 text-center font-bold text-[#303844]">{transaction.items}</td><td className="px-3 py-2.5 text-right font-bold text-[#303844]">{transaction.amount}</td><td className="px-3 py-2.5"><SPAD_StatusBadge label={transaction.payment} tone={transaction.tone} /></td><td className="whitespace-pre-line px-3 py-2.5 text-right text-[8px] text-[#687486]">{transaction.date}</td></tr>)}</tbody></table></div>
          <SPAD_Pagination count={`Showing ${visibleTransactions.length ? '1–5' : '0'} of 1,284 orders`} />
        </SPAD_Panel>
      </div>
    </SPAD_Shell>
  );
}
