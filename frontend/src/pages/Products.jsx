import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import productService from '../services/product.service';
import ProductCard from '../components/features/ProductCard';
import Spinner from '../components/common/Spinner';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A-Z' },
  { value: 'name_desc', label: 'Name: Z-A' },
];

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || '';
  const page = searchParams.get('page') || '1';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = {
          page, search, category, minPrice, maxPrice, sort,
        };
        Object.keys(params).forEach((key) => {
          if (!params[key]) delete params[key];
        });

        const response = await productService.getProducts(params);
        setProducts(response.data || []);
        setPagination(response.pagination);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, minPrice, maxPrice, sort, page]);

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    next.delete('page');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const goToPage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0 space-y-6">
          <form onSubmit={handleSearchSubmit}>
            <Input
              label="Search"
              name="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
            />
            <Button type="submit" size="small" className="w-full">Search</Button>
          </form>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">Category</span>
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">Price Range</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">Sort By</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              {products.length === 0 ? (
                <p className="text-gray-600">No products found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="small"
                    disabled={pagination.page <= 1}
                    onClick={() => goToPage(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-gray-600">
                    Page
                    {' '}
                    {pagination.page}
                    {' '}
                    of
                    {' '}
                    {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="small"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => goToPage(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Products;
