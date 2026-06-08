import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Spinner from '../common/Spinner';
import orderService from '../../services/order.service';

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const response = await orderService.getOrderById(id);
        setOrder(response.data);
      } catch {
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (isLoading) {
    return <Spinner />;
  }

  if (!order) {
    return (
      <div>
        <p className="text-gray-600">Order not found.</p>
        <Link to="/account/orders" className="text-blue-600 hover:underline">Back to orders</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/account/orders" className="text-sm text-blue-600 hover:underline">&larr; Back to orders</Link>

      <div className="flex items-center justify-between mt-2 mb-6">
        <div>
          <h2 className="text-xl font-semibold">{order.order_number}</h2>
          <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Shipping Address</h3>
          <p className="text-sm text-gray-600">
            {order.shipping_first_name}
            {' '}
            {order.shipping_last_name}
          </p>
          <p className="text-sm text-gray-600">
            {order.address_line1}
            {order.address_line2 ? `, ${order.address_line2}` : ''}
          </p>
          <p className="text-sm text-gray-600">
            {order.city}
            {', '}
            {order.state}
            {' '}
            {order.postal_code}
          </p>
          <p className="text-sm text-gray-600">{order.country}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Payment</h3>
          <p className="text-sm text-gray-600">{order.payment_method}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-3">Items</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded" />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Qty:
                    {' '}
                    {item.quantity}
                    {' '}
                    × $
                    {item.price}
                  </p>
                </div>
              </div>
              <p className="font-semibold">
                $
                {Number(item.subtotal).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow max-w-sm ml-auto">
        <div className="flex justify-between py-1 text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span>
            $
            {Number(order.subtotal).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between py-1 text-sm">
          <span className="text-gray-600">Tax</span>
          <span>
            $
            {Number(order.tax).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between py-1 text-sm">
          <span className="text-gray-600">Shipping</span>
          <span>
            $
            {Number(order.shipping_cost).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between py-2 mt-2 border-t font-bold">
          <span>Total</span>
          <span>
            $
            {Number(order.total).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
