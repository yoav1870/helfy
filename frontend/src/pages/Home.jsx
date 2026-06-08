import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';

function Home() {
  return (
    <Layout>
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-gray-900 mb-6"
        >
          Welcome to eCommerce
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 mb-8"
        >
          Discover amazing products at great prices
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Link to="/products">
            <Button size="large">Shop Now</Button>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}

export default Home;
