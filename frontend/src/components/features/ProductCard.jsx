import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import Card from '../common/Card';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link to={`/products/${product.slug}`}>
      <Card hover className="h-full flex flex-col">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
          <div className="mt-auto flex items-center justify-between pt-2">
            <p className="text-blue-600 font-bold text-xl">
              $
              {product.price}
            </p>
            <Button
              size="small"
              isLoading={isAdding}
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    stock: PropTypes.number,
    image_url: PropTypes.string,
  }).isRequired,
};

export default ProductCard;
