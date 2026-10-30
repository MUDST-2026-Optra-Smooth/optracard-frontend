import React, { useState, useEffect, useMemo } from 'react';
import { ADsidebar } from './ADsidebar';
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  RefreshCw, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  AlertCircle
} from 'lucide-react';

interface TopProductDto {
  productId: number;
  name: string;
  quantitySold: number;
  totalRevenue: number;
  currentStock: number;
  daysUntilOut: number | null;
  recommendedRestock: number | null;
  status: string;
}

interface WeeklyReportResponse {
  revenue: number;
  cost: number;
  profit: number;
  totalOrders: number;
  itemsSold: number;
  topProducts: TopProductDto[];
}

type SortField = 'name' | 'quantitySold' | 'totalRevenue';
type SortDirection = 'asc' | 'desc';

export const AdminWeeklyReport: React.FC = () => {
  const getInitialDates = () => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    return {
      start: lastWeek.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  };

  const initialDates = getInitialDates();
  const [startDate, setStartDate] = useState<string>(initialDates.start);
  const [endDate, setEndDate] = useState<string>(initialDates.end);

  const [report, setReport] = useState<WeeklyReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>('quantitySold');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = 
        localStorage.getItem('token') || 
        localStorage.getItem('jwt_token') || 
        localStorage.getItem('accessToken');

      const response = await fetch(
        `/api/admin/reports/weekly?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : ''
          }
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied (Status 403): Unauthorized request or expired session token.');
        } else if (response.status === 400) {
          throw new Error('Bad request (Status 400): Invalid date range parameters.');
        } else {
          throw new Error(`Failed to load report (Status: ${response.status})`);
        }
      }

      const data: WeeklyReportResponse = await response.json();
      setReport(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred while fetching the report.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedProducts = useMemo(() => {
    if (!report?.topProducts) return [];

    return [...report.topProducts].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string') {
        return sortDirection === 'asc'
          ? (aValue as string).localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue as string);
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [report, sortField, sortDirection]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 ml-1 inline" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600 ml-1 inline" />
      : <ArrowDown className="w-3.5 h-3.5 text-indigo-600 ml-1 inline" />;
  };

  const handleExportCSV = () => {
    if (!report) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Weekly Performance Report (${startDate} to ${endDate})\n\n`;
    csvContent += `Revenue,Total Expenses,Profit,Total Orders,Items Sold\n`;
    csvContent += `${report.revenue},${report.cost},${report.profit},${report.totalOrders},${report.itemsSold}\n\n`;
    csvContent += `Top Selling Products\nProduct ID,Product Name,Quantity Sold,Total Revenue\n`;

    sortedProducts.forEach(p => {
      csvContent += `${p.productId},"${p.name.replace(/"/g, '""')}",${p.quantitySold},${p.totalRevenue}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Weekly_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <ADsidebar currentTab="weekly-report" />

      <main className="flex-1 mt-16 p-8 overflow-y-auto">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Weekly Performance Report</h1>
            <p className="text-sm text-slate-500 mt-1">Overview of financial metrics, top-selling items, and inventory predictions.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm text-sm">
              <Calendar className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="outline-none bg-transparent text-slate-700 font-medium cursor-pointer"
              />
              <span className="mx-2 text-slate-400">➔</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="outline-none bg-transparent text-slate-700 font-medium cursor-pointer"
              />
            </div>

            <button
              onClick={handleExportCSV}
              disabled={loading || !!error}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
            <button 
              onClick={fetchReport} 
              className="px-3 py-1 bg-white border border-red-300 rounded-lg font-semibold text-xs flex items-center gap-1 hover:bg-red-50 transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Revenue</span>
            <p className="text-xl font-bold text-slate-900 mt-2">
              {loading ? '...' : `฿${(report?.revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Expenses</span>
            <p className="text-xl font-bold text-red-600 mt-2">
              {loading ? '...' : `฿${(report?.cost ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Estimated Profit</span>
            <p className="text-xl font-bold text-emerald-600 mt-2">
              {loading ? '...' : `฿${(report?.profit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Orders</span>
            <p className="text-xl font-bold text-slate-900 mt-2">
              {loading ? '...' : (report?.totalOrders ?? 0).toLocaleString('en-US')}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Items Sold</span>
            <p className="text-xl font-bold text-indigo-600 mt-2">
              {loading ? '...' : (report?.itemsSold ?? 0).toLocaleString('en-US')}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Top Performing Products & Restock Suggestions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time inventory sales analytics for the selected period.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
  <thead>
    <tr className="border-b text-sm text-gray-500 uppercase">
      <th className="py-3 px-4 font-semibold">
        <button type="button" onClick={() => handleSort('name')} className="cursor-pointer">
          Product Name{renderSortIcon('name')}
        </button>
      </th>
      <th className="py-3 px-4 font-semibold text-center">
        <button type="button" onClick={() => handleSort('quantitySold')} className="cursor-pointer">
          Quantity Sold{renderSortIcon('quantitySold')}
        </button>
      </th>
      <th className="py-3 px-4 font-semibold text-right">
        <button type="button" onClick={() => handleSort('totalRevenue')} className="cursor-pointer">
          Total Revenue{renderSortIcon('totalRevenue')}
        </button>
      </th>
      <th className="py-3 px-4 font-semibold text-center">Current Stock</th>
      <th className="py-3 px-4 font-semibold text-center">Days Until Out</th>
      <th className="py-3 px-4 font-semibold text-center">Restock Qty</th>
      <th className="py-3 px-4 font-semibold text-center">Status</th>
    </tr>
  </thead>
  
  <tbody>
    {report?.topProducts && report.topProducts.length > 0 ? (
      sortedProducts.map((product, index) => (
        <tr key={product.productId || index} className="border-b hover:bg-gray-50">
          <td className="py-3 px-4 text-gray-800 font-medium">{product.name}</td>
          <td className="py-3 px-4 text-center text-blue-600 font-semibold">{product.quantitySold}</td>
          <td className="py-3 px-4 text-right text-gray-800">
            ฿{product.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </td>
          <td className="py-3 px-4 text-center text-gray-800">{product.currentStock}</td>
          
          {product.status === "ยังมีข้อมูลไม่เพียงพอ" ? (
            <>
              <td className="py-3 px-4 text-center text-gray-400">-</td>
              <td className="py-3 px-4 text-center text-gray-400">-</td>
              <td className="py-3 px-4 text-center">
                <span className="bg-gray-100 text-gray-600 text-xs py-1 px-2 rounded-full border border-gray-200 whitespace-nowrap">
                  {product.status}
                </span>
              </td>
            </>
          ) : (
            <>
              <td className="py-3 px-4 text-center font-medium">{product.daysUntilOut} วัน</td>
              <td className="py-3 px-4 text-center text-green-600 font-semibold">+{product.recommendedRestock}</td>
              <td className="py-3 px-4 text-center">
                <span className={`text-xs py-1 px-2 rounded-full border whitespace-nowrap ${
                  product.status === "ควรเติมด่วน" ? "bg-red-50 text-red-600 border-red-200" :
                  product.status === "ใกล้หมด" ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                  "bg-green-50 text-green-600 border-green-200"
                }`}>
                  {product.status}
                </span>
              </td>
            </>
          )}
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={7} className="py-8 text-center text-gray-400">
          No product data available for the selected date range.
        </td>
      </tr>
    )}
  </tbody>
</table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminWeeklyReport;
