import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../common/Spinner';
import orderService from '../../services/order.service';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getOrders();
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return <Spinner />;
  }

  if (orders.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Order History</h2>
        <p className="text-gray-600">You haven&apos;t placed any orders yet.</p>
        <Link to="/products" className="text-blue-600 hover:underline">Browse products</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Order History</h2>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/account/orders/${order.id}`}
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <div>
              <p className="font-semibold">{order.order_number}</p>
              <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-800'}`}>
                {order.status}
              </span>
              <p className="font-bold">
                $
                {Number(order.total).toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default OrderHistory;
