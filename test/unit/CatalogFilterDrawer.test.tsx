import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CatalogFilterDrawer } from '../../src/components/CatalogFilterDrawer';

vi.mock('../../src/api/catalog', () => ({
  loadCatalogFilterOptions: vi.fn().mockResolvedValue({
    types: ['Single'],
    games: [{ id: 1, name: 'Pokemon' }],
    languages: ['English'],
    sources: ['OFFICIAL', 'MARKETPLACE'],
  }),
}));

describe('CatalogFilterDrawer', () => {
  it('prevents applying a price range whose minimum exceeds its maximum', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();

    render(<CatalogFilterDrawer open initialParams={new URLSearchParams()} onClose={vi.fn()} onApply={onApply} />);

    await user.type(screen.getByPlaceholderText('Min Price'), '1500');
    await user.type(screen.getByPlaceholderText('Max Price'), '1400');

    expect(screen.getByRole('alert')).toHaveTextContent('Minimum price cannot exceed maximum price.');
    expect(screen.getByRole('button', { name: 'Apply filters' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(onApply).not.toHaveBeenCalled();
  });
});
