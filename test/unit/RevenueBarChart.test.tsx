import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RevenueBarChart } from '../../src/components/dashboard/RevenueBarChart';

describe('RevenueBarChart Unit Tests', () => {
  const sampleMetrics = [
    { month: '2026-01', revenue: 12000, expenses: 8000 },
    { month: '2026-02', revenue: 15000, expenses: 9000 },
    { month: '2026-03', revenue: 20000, expenses: 11000 },
  ];

  it('renders title and empty state message when metrics list is empty', () => {
    render(<RevenueBarChart metrics={[]} />);
    expect(screen.getByText('Revenue & Expenses by Month')).toBeInTheDocument();
    expect(screen.getByText(/No monthly financial metrics recorded yet/i)).toBeInTheDocument();
  });

  it('renders summary statistics correctly for provided metrics', () => {
    render(<RevenueBarChart metrics={sampleMetrics} />);
    // Total Revenue = 12000 + 15000 + 20000 = 47000 (฿47,000.00)
    expect(screen.getByText('฿47,000.00')).toBeInTheDocument();
    // Total Expenses = 8000 + 9000 + 11000 = 28000 (฿28,000.00)
    expect(screen.getByText('฿28,000.00')).toBeInTheDocument();
    // Net profit = 47000 - 28000 = 19000 (฿19,000.00)
    expect(screen.getByText('฿19,000.00')).toBeInTheDocument();
    // Best month
    expect(screen.getByText(/2026-03 \(฿20,000\.00\)/)).toBeInTheDocument();
  });

  it('switches between Chart view and Table view via buttons', () => {
    render(<RevenueBarChart metrics={sampleMetrics} />);

    // Initially in Chart view: svg chart is present
    expect(screen.getByLabelText('Monthly Revenue and Expenses Chart')).toBeInTheDocument();

    // Click Table toggle button
    const tableButton = screen.getByLabelText('Show Table');
    fireEvent.click(tableButton);

    // Now table headers and rows should be visible
    expect(screen.getByRole('columnheader', { name: /Net Profit/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Margin/i })).toBeInTheDocument();
    expect(screen.getByText('฿4,000.00')).toBeInTheDocument(); // Profit for Jan: 12000 - 8000

    // Switch back to Chart view
    const chartButton = screen.getByLabelText('Show Bar Chart');
    fireEvent.click(chartButton);
    expect(screen.getByLabelText('Monthly Revenue and Expenses Chart')).toBeInTheDocument();
  });
});
