import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SPAD_ExportButton, SPAD_Field, SPAD_FilterBar, SPAD_FilterField, SPAD_Input, SPAD_Pagination, SPAD_Panel, SPAD_SectionHeading, SPAD_Select, SPAD_StatCard, SPAD_StatusBadge } from '../../src/components/SPAD_Widgets';

describe('SPAD widgets', () => {
  it('renders statistic variants, drag states and panels', () => {
    const dragStart = vi.fn();
    const dragEnd = vi.fn();
    const { rerender } = render(<SPAD_StatCard label="Revenue" value="฿100" detail="Today" tone="purple" variant="gradient" dragHandle={{ onDragStart: dragStart, onDragEnd: dragEnd }} isDragging isDragOver />);
    fireEvent.dragStart(screen.getByRole('button', { name: /Drag Revenue/ }));
    fireEvent.dragEnd(screen.getByRole('button', { name: /Drag Revenue/ }));
    expect(dragStart).toHaveBeenCalled();
    expect(dragEnd).toHaveBeenCalled();
    rerender(<SPAD_Panel title="Panel" subtitle="Sub" action={<button>Action</button>} className="custom"><span>Body</span></SPAD_Panel>);
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders headings, fields, badges, filters and controls', () => {
    render(<>
      <SPAD_StatusBadge label="Approved" tone="green" />
      <SPAD_SectionHeading eyebrow="Admin" title="Users" description="Manage users" action={<button>New</button>} />
      <SPAD_FilterBar><SPAD_FilterField label="Search"><SPAD_Input aria-label="search" /></SPAD_FilterField><SPAD_Field label="Game"><SPAD_Select aria-label="game"><option>Pokemon</option></SPAD_Select></SPAD_Field></SPAD_FilterBar>
    </>);
    expect(screen.getByText(/Approved/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('search'), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText('game'), { target: { value: 'Pokemon' } });
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('paginates safely and exports both populated and empty rows', () => {
    const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { rerender } = render(<><SPAD_Pagination count="Showing 1-3" pageCount={3} /><SPAD_ExportButton label="Export" fileName="rows.csv" rows={[{ name: 'A', value: 1 }]} /></>);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    expect(createUrl).toHaveBeenCalled();
    expect(anchorClick).toHaveBeenCalled();
    rerender(<SPAD_ExportButton label="Empty export" fileName="empty.csv" rows={[]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Empty export' }));
    expect(createUrl).toHaveBeenCalledTimes(2);
    anchorClick.mockRestore();
    createUrl.mockRestore();
  });
});
