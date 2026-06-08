import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';

function Cart() {
  const { cart, isLoading } = useCart();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      {cart?.items?.length === 0 ? (
        <p className="text-gray-600">Your cart is empty</p>
      ) : (
        <div>
          <div className="space-y-4">
            {cart?.items?.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow flex justify-between">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">
                    Quantity:
                    {' '}
                    {item.quantity}
                  </p>
                </div>
                <p className="font-bold">
                  $
                  {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>
                $
                {cart?.subtotal?.toFixed(2)}
              </span>
            </div>
            <Button className="w-full mt-4" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Cart;
