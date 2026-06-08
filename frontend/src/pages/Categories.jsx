import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import productService from '../services/product.service';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8">Categories</h1>
      {categories.length === 0 ? (
        <p className="text-gray-600">No categories available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} to={`/products?category=${category.id}`}>
              <Card hover className="h-full">
                <div className="p-6">
                  <h3 className="font-semibold text-xl mb-2">{category.name}</h3>
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  )}
                  <p className="text-blue-600 font-medium text-sm">
                    {category.product_count}
                    {' '}
                    {category.product_count === 1 ? 'product' : 'products'}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Categories;
