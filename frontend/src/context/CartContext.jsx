import {
  createContext, useState, useEffect, useContext, useCallback, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import cartService from '../services/cart.service';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await cartService.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      const response = await cartService.addToCart(productId, quantity);
      setCart(response.data);
      toast.success('Added to cart');
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
      throw error;
    }
  }, []);

  const updateCartItem = useCallback(async (itemId, quantity) => {
    try {
      const response = await cartService.updateCartItem(itemId, quantity);
      setCart(response.data);
      toast.success('Cart updated');
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to update cart');
      throw error;
    }
  }, []);

  const removeFromCart = useCallback(async (itemId) => {
    try {
      const response = await cartService.removeFromCart(itemId);
      setCart(response.data);
      toast.success('Item removed');
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to remove item');
      throw error;
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      const response = await cartService.clearCart();
      setCart(response.data);
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to clear cart');
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      cart,
      isLoading,
      fetchCart,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      itemCount: cart?.itemCount || 0,
    }),
    [cart, isLoading, fetchCart, addToCart, updateCartItem, removeFromCart, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
