import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CatalogFilterDrawer } from '../../src/components/CatalogFilterDrawer';

const loadCatalogFilterOptions = vi.hoisted(() => vi.fn());
vi.mock('../../src/api/catalog', () => ({ loadCatalogFilterOptions }));

describe('CatalogFilterDrawer', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it('loads options, applies filters, clears values and closes on escape', async () => {
    loadCatalogFilterOptions.mockResolvedValue({
      types: ['Single'], games: [{ id: 1, name: 'Pokemon' }], languages: ['English'], sources: ['OFFICIAL'],
    });
    const onApply = vi.fn();
    const onClose = vi.fn();
    render(<CatalogFilterDrawer open initialParams={new URLSearchParams('type=Booster')} defaultSource="OFFICIAL" onClose={onClose} onApply={onApply} />);
    expect(await screen.findByRole('option', { name: 'Pokemon' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Game'), { target: { value: 'Pokemon' } });
    fireEvent.change(screen.getByPlaceholderText('Min Price'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('Max Price'), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(onApply).toHaveBeenCalledWith(expect.any(URLSearchParams));
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('blocks invalid ranges and falls back when options fail', async () => {
    loadCatalogFilterOptions.mockRejectedValue(new Error('offline'));
    const onApply = vi.fn();
    render(<CatalogFilterDrawer open initialParams={new URLSearchParams()} onClose={vi.fn()} onApply={onApply} />);
    await waitFor(() => expect(screen.getByRole('option', { name: 'Pokemon' })).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Min Price'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('Max Price'), { target: { value: '10' } });
    expect(screen.getByRole('alert')).toHaveTextContent(/cannot exceed/i);
    expect(screen.getByRole('button', { name: 'Apply filters' })).toBeDisabled();
    expect(onApply).not.toHaveBeenCalled();
  });

  it('renders nothing while closed', () => {
    const { container } = render(<CatalogFilterDrawer open={false} initialParams={new URLSearchParams()} onClose={vi.fn()} onApply={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
