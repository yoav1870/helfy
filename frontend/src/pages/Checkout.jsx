import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import CheckoutStepper from '../components/features/CheckoutStepper';
import CartReviewStep from '../components/features/CartReviewStep';
import ShippingStep from '../components/features/ShippingStep';
import PaymentStep from '../components/features/PaymentStep';
import OrderConfirmation from '../components/features/OrderConfirmation';
import { useCart } from '../context/CartContext';
import orderService from '../services/order.service';

function Checkout() {
  const { cart, isLoading: isCartLoading, fetchCart } = useCart();

  const [step, setStep] = useState(1);
  const [shippingAddressId, setShippingAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const response = await orderService.createOrder({ shippingAddressId, paymentMethod });
      setOrder(response.data);
      setStep(4);
      toast.success('Order placed successfully!');
      await fetchCart();
    } catch (error) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isCartLoading) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  if (step !== 4 && (!cart || cart.items.length === 0)) {
    return (
      <Layout>
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-600 mb-4">Your cart is empty — add some products before checking out.</p>
        <Link to="/products">
          <Button>Browse Products</Button>
        </Link>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="max-w-2xl mx-auto">
        <CheckoutStepper currentStep={step} />

        {step === 1 && <CartReviewStep cart={cart} onNext={() => setStep(2)} />}

        {step === 2 && (
          <ShippingStep
            selectedAddressId={shippingAddressId}
            onSelectAddress={setShippingAddressId}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <PaymentStep
            paymentMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
            onBack={() => setStep(2)}
            onNext={handlePlaceOrder}
            isSubmitting={isPlacingOrder}
          />
        )}

        {step === 4 && order && <OrderConfirmation order={order} />}
      </div>
    </Layout>
  );
}

export default Checkout;
