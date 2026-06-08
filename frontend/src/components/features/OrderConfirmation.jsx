import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../common/Button';

function OrderConfirmation({ order }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-3xl">
        ✓
      </div>
      <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
      <p className="text-gray-600 mb-6">
        Order
        {' '}
        <span className="font-semibold">{order.order_number}</span>
        {' '}
        has been confirmed.
      </p>

      <div className="bg-white p-6 rounded-lg shadow text-left max-w-md mx-auto mb-6">
        <div className="flex justify-between py-1">
          <span className="text-gray-600">Subtotal</span>
          <span>
            $
            {Number(order.subtotal).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-600">Tax</span>
          <span>
            $
            {Number(order.tax).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-600">Shipping</span>
          <span>
            $
            {Number(order.shipping_cost).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between py-2 mt-2 border-t font-bold text-lg">
          <span>Total</span>
          <span>
            $
            {Number(order.total).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Link to={`/account/orders/${order.id}`}>
          <Button variant="outline">View Order</Button>
        </Link>
        <Link to="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </motion.div>
  );
}

OrderConfirmation.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.number.isRequired,
    order_number: PropTypes.string.isRequired,
    subtotal: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    tax: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    shipping_cost: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    total: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  }).isRequired,
};

export default OrderConfirmation;
