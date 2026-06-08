import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import productService from '../services/product.service';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await productService.getProductBySlug(slug);
        setProduct(response.data);
        setQuantity(1);
      } catch {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <p className="text-gray-600">Product not found</p>
        <Link to="/products" className="text-blue-600 hover:underline">Back to products</Link>
      </Layout>
    );
  }

  return (
    <Layout>
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/products" className="hover:text-blue-600">Products</Link>
        {' / '}
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-96 object-cover rounded-lg shadow-md"
        />

        <div>
          <p className="text-sm text-blue-600 font-medium mb-2">{product.category_name}</p>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-bold text-gray-900 mb-4">
            $
            {product.price}
          </p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <p className="mb-6">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">
                In Stock (
                {product.stock}
                {' '}
                available)
              </span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </p>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  type="button"
                  className="px-3 py-1 text-lg disabled:opacity-50"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="px-4">{quantity}</span>
                <button
                  type="button"
                  className="px-3 py-1 text-lg disabled:opacity-50"
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <Button
            isLoading={isAdding}
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export default ProductDetail;
