import PropTypes from 'prop-types';
import Button from '../common/Button';

function CartReviewStep({ cart, onNext }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Review Your Cart</h2>
      <div className="space-y-3">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">
                  Qty:
                  {' '}
                  {item.quantity}
                  {' '}
                  × $
                  {item.price}
                </p>
              </div>
            </div>
            <p className="font-bold">
              $
              {(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-lg font-bold mt-6 pt-4 border-t">
        <span>Subtotal</span>
        <span>
          $
          {cart.subtotal.toFixed(2)}
        </span>
      </div>

      <div className="mt-6">
        <Button onClick={onNext}>Continue to Shipping</Button>
      </div>
    </div>
  );
}

CartReviewStep.propTypes = {
  cart: PropTypes.shape({
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      image_url: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      quantity: PropTypes.number.isRequired,
    })).isRequired,
    subtotal: PropTypes.number.isRequired,
  }).isRequired,
  onNext: PropTypes.func.isRequired,
};

export default CartReviewStep;
