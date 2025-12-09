
import { render, screen, fireEvent } from '@testing-library/react';
import CheckoutContent from './page';

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'productId') return '1';
      if (key === 'quantity') return '1';
      return '';
    },
  }),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/app/components/auth/AuthGuard', () => ({
  useAuth: () => ({
    user: { id: '1' },
    isAuthenticated: true,
    loading: false,
  }),
}));

jest.mock('@/app/lib/api', () => ({
  getProduct: jest.fn(() => Promise.resolve({
    success: true,
    data: {
      id: '1',
      name: 'Test Product',
      price: { amount: '10.00', currency: 'USD' },
      seller_id: '2',
    },
  })),
  placeOrder: jest.fn(() => Promise.resolve({ success: true, order_id: '123' })),
}));

describe('CheckoutContent', () => {
  it('should show an error if the address is too short', async () => {
    render(<CheckoutContent />);

    // Wait for the product to load
    await screen.findByText('Order Summary');

    const addressTextarea = screen.getByPlaceholderText(
      'Street address, City, State/Province, ZIP/Postal Code, Country'
    );
    const placeOrderButton = screen.getByText('Place Order');

    // Enter a short address
    fireEvent.change(addressTextarea, { target: { value: 'short' } });

    // Submit the form
    fireEvent.click(placeOrderButton);

    // Check for the error message
    const errorMessage = await screen.findByText('Please enter a more complete address');
    expect(errorMessage).toBeInTheDocument();
  });
});
