import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Help } from '../../pages/Help';

describe('Get Help Today Support Directory', () => {
  it('renders official Australian Anti Ice Campaign contact info', () => {
    render(<Help />);
    expect(screen.getAllByText(/Australian Anti Ice Campaign/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/1300 424 238/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders verified national support lines (Kids Helpline, Lifeline, National Drug Hotline)', () => {
    render(<Help />);
    expect(screen.getByText(/National Alcohol and Other Drug Hotline/i)).toBeInTheDocument();
    expect(screen.getByText(/1800 250 015/i)).toBeInTheDocument();
    expect(screen.getByText(/Kids Helpline/i)).toBeInTheDocument();
    expect(screen.getByText(/1800 55 1800/i)).toBeInTheDocument();
    expect(screen.getByText(/Lifeline Australia/i)).toBeInTheDocument();
    expect(screen.getByText(/13 11 14/i)).toBeInTheDocument();
  });

  it('filters contacts by category pill', async () => {
    const user = userEvent.setup();
    render(<Help />);

    const youthFilterBtn = screen.getByRole('button', { name: /Youth Support/i });
    await user.click(youthFilterBtn);

    expect(screen.getByText(/Kids Helpline/i)).toBeInTheDocument();
    expect(screen.getByText(/headspace/i)).toBeInTheDocument();
    // Non-youth specific entry should be filtered out
    expect(screen.queryByText(/Lifeline Australia/i)).not.toBeInTheDocument();
  });
});
