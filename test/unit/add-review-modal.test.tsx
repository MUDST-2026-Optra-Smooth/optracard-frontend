import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AddReviewModal from '../../src/components/AddReviewModal';

describe('AddReviewModal', () => {
  it('does not render when closed and closes from backdrop/header', () => {
    const onClose = vi.fn();
    const view = render(<AddReviewModal isOpen={false} onClose={onClose} sellerName="Shop" onSubmit={vi.fn()} />);
    expect(view.container).toBeEmptyDOMElement();
    view.rerender(<AddReviewModal isOpen onClose={onClose} sellerName="Shop" onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByText(/Share your experience/).parentElement!.parentElement!.parentElement!);
    fireEvent.click(screen.getByRole('button', { name: '' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('selects stars, edits comment and submits trimmed review', () => {
    const onSubmit = vi.fn();
    render(<AddReviewModal isOpen onClose={vi.fn()} sellerName="Rare Finds" onSubmit={onSubmit} />);
    const submit = screen.getByRole('button', { name: 'Submit Review' });
    expect(submit).toBeDisabled();
    fireEvent.mouseEnter(screen.getByRole('button', { name: '4 star' }));
    fireEvent.mouseLeave(screen.getByRole('button', { name: '4 star' }));
    fireEvent.click(screen.getByRole('button', { name: '5 star' }));
    fireEvent.change(screen.getByPlaceholderText(/What did you think/), { target: { value: '  Great seller  ' } });
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith({ rating: 5, comment: 'Great seller' });
  });
});
