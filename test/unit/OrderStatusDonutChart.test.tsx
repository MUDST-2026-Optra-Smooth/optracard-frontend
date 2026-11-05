import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { OrderStatusDonutChart } from '../../src/components/dashboard/OrderStatusDonutChart';

describe('OrderStatusDonutChart Unit Tests', () => {
  it('renders empty state when order counts are zero', () => {
    render(<OrderStatusDonutChart orders={[]} />);
    expect(screen.getByText('Order Status Distribution')).toBeInTheDocument();
    expect(screen.getByText(/No orders to visualize yet/i)).toBeInTheDocument();
  });

  it('calculates status counts and renders total orders correctly', () => {
    const orders = [
      { status: 'Processing' },
      { status: 'Processing' },
      { status: 'Shipped' },
      { status: 'Delivered' },
      { status: 'Delivered' },
      { status: 'Delivered' },
      { status: 'Canceled' },
    ];

    render(<OrderStatusDonutChart orders={orders} />);
    expect(screen.getByText('7 Orders')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Shipped')).toBeInTheDocument();
    expect(screen.getByText('Canceled')).toBeInTheDocument();
    expect(screen.getByText('3 orders')).toBeInTheDocument(); // 3 Delivered
  });

  it('renders properly when direct counts dictionary is provided', () => {
    const counts = {
      Processing: 4,
      Shipped: 6,
      Delivered: 10,
      Canceled: 0,
    };

    render(<OrderStatusDonutChart counts={counts} />);
    expect(screen.getByText('20 Orders')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument(); // 10/20 Delivered = 50%
  });
});
