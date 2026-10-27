import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BeforeAfterSlider } from '../../components/BeforeAfterSlider';

describe('Before & After Comparison Slider Component', () => {
  const beforeUrl = 'blob:http://localhost/mock-before';
  const afterUrl = 'blob:http://localhost/mock-after';

  it('renders slider with before and after labels', () => {
    render(
      <BeforeAfterSlider
        beforeImage={beforeUrl}
        afterImage={afterUrl}
        beforeLabel="Baseline"
        afterLabel="Simulated Toll"
      />
    );

    expect(screen.getByText('Baseline')).toBeInTheDocument();
    expect(screen.getByText('Simulated Toll')).toBeInTheDocument();
  });

  it('supports keyboard navigation using ArrowLeft and ArrowRight keys', () => {
    render(
      <BeforeAfterSlider
        beforeImage={beforeUrl}
        afterImage={afterUrl}
      />
    );

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '50');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider).toHaveAttribute('aria-valuenow', '55');

    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('toggles to side-by-side mode', async () => {
    const user = userEvent.setup();
    render(
      <BeforeAfterSlider
        beforeImage={beforeUrl}
        afterImage={afterUrl}
      />
    );

    const sideBySideBtn = screen.getByRole('button', { name: /Side-by-Side/i });
    await user.click(sideBySideBtn);

    expect(screen.getByText(/Comparing both states/i)).toBeInTheDocument();
  });
});
