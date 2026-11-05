import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SalesTrendLineChart } from '../../src/components/dashboard/SalesTrendLineChart';

describe('SalesTrendLineChart Unit Tests', () => {
  it('renders empty state when data array is empty', () => {
    render(<SalesTrendLineChart data={[]} />);
    expect(screen.getByText('Sales & Revenue Trend')).toBeInTheDocument();
    expect(screen.getByText(/No trend data available/i)).toBeInTheDocument();
  });

  it('renders total gross sales and order volume', () => {
    const data = [
      { label: 'Oct 01', revenue: 500, orders: 2 },
      { label: 'Oct 02', revenue: 1200, orders: 5 },
      { label: 'Oct 03', revenue: 800, orders: 3 },
    ];

    render(<SalesTrendLineChart data={data} />);
    expect(screen.getByText(/Gross Sales: ฿2,500\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/10 Orders/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Sales Trend Line Chart')).toBeInTheDocument();
  });
});
