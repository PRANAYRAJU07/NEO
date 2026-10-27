import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Consent } from '../../pages/Consent';
import { AppProvider } from '../../app/AppContext';

describe('Consent & Privacy Notice Screen', () => {
  const renderConsent = () => {
    return render(
      <BrowserRouter>
        <AppProvider>
          <Consent />
        </AppProvider>
      </BrowserRouter>
    );
  };

  it('renders privacy notice bullets explaining local processing', () => {
    renderConsent();
    expect(screen.getByText(/Privacy Notice & Informed Choice/i)).toBeInTheDocument();
    expect(screen.getByText(/100% On-Device Processing/i)).toBeInTheDocument();
    expect(screen.getByText(/No Uploads/i)).toBeInTheDocument();
  });

  it('disables proceed button until all 3 consent checkboxes are checked', async () => {
    const user = userEvent.setup();
    renderConsent();

    const proceedBtn = screen.getByRole('button', { name: /Proceed to Photo Selection/i });
    expect(proceedBtn).toBeDisabled();

    // Find all checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);

    // Check first checkbox
    await user.click(checkboxes[0]!);
    expect(proceedBtn).toBeDisabled();

    // Check second checkbox
    await user.click(checkboxes[1]!);
    expect(proceedBtn).toBeDisabled();

    // Check third checkbox
    await user.click(checkboxes[2]!);
    expect(proceedBtn).toBeEnabled();
  });

  it('provides an immediate "Continue Without Photo" option that requires no selfie', () => {
    renderConsent();
    const optOutBtn = screen.getByRole('button', { name: /Continue Without Photo/i });
    expect(optOutBtn).toBeEnabled();
  });
});
