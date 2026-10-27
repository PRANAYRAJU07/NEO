import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Welcome } from '../../pages/Welcome';
import { AppProvider } from '../../app/AppContext';

describe('Welcome Screen Component', () => {
  const renderWelcome = () => {
    return render(
      <BrowserRouter>
        <AppProvider>
          <Welcome />
        </AppProvider>
      </BrowserRouter>
    );
  };

  it('renders title and AAIC branding', () => {
    renderWelcome();
    expect(screen.getByText(/NEO –/i)).toBeInTheDocument();
    expect(screen.getByText(/Face the Future/i)).toBeInTheDocument();
    expect(screen.getByText(/Australian Anti Ice Campaign/i)).toBeInTheDocument();
  });

  it('displays the official AAIC slogans', () => {
    renderWelcome();
    expect(screen.getByText(/ICE — NOT EVEN ONCE/i)).toBeInTheDocument();
    expect(screen.getByText(/CHOOSE LIFE SO THAT YOU MAY LIVE/i)).toBeInTheDocument();
  });

  it('renders start CTA and help button', () => {
    renderWelcome();
    expect(screen.getByRole('button', { name: /Start Prevention Experience/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get Help Today/i })).toBeInTheDocument();
  });

  it('renders the prominent educational disclaimer', () => {
    renderWelcome();
    expect(screen.getByText(/Educational Visual Simulation Only/i)).toBeInTheDocument();
    expect(screen.getByText(/fictional educational illustrations/i)).toBeInTheDocument();
  });
});
