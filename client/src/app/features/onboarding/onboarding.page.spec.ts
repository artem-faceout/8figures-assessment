import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { OnboardingPage } from './onboarding.page';

jest.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: jest.fn().mockResolvedValue({ value: null }),
    set: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('OnboardingPage', () => {
  const mockRouter = {
    navigate: jest.fn().mockResolvedValue(true),
  };

  async function setup() {
    return render(OnboardingPage, {
      providers: [
        provideNoopAnimations(),
        { provide: Router, useValue: mockRouter },
      ],
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start on the Hook screen', async () => {
    await setup();
    expect(screen.getByText(/working for/i)).toBeInTheDocument();
  });

  it('should show page indicators on non-paywall steps', async () => {
    await setup();
    // Page indicators should be present (3 dots)
    const indicators = document.querySelectorAll('app-page-indicator');
    expect(indicators.length).toBe(1);
  });

  it('should advance to Promise screen when Continue is clicked', async () => {
    await setup();
    const user = userEvent.setup();

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    await user.click(continueBtn);

    expect(screen.getByText(/meet your ai/i)).toBeInTheDocument();
  });

  it('should advance through all steps to Paywall', async () => {
    await setup();
    const user = userEvent.setup();

    // Hook → Promise
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/meet your ai/i)).toBeInTheDocument();

    // Promise → Bridge
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/set up your portfolio/i)).toBeInTheDocument();

    // Select a card to enable Continue Journey
    await user.click(screen.getByText(/i have investments/i));

    // Bridge → navigate to /chat
    await user.click(screen.getByRole('button', { name: /continue journey/i }));
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/chat'], {
      state: { mode: 'onboarding', persona: 'experienced' },
    });
  });
});
