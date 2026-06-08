import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route
              path="/cart"
              element={(
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/checkout"
              element={(
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/account/*"
              element={(
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              )}
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
