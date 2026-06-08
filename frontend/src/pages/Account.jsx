import { Routes, Route, NavLink } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProfileSection from '../components/features/ProfileSection';
import OrderHistory from '../components/features/OrderHistory';
import OrderDetails from '../components/features/OrderDetails';
import AddressBook from '../components/features/AddressBook';

const TABS = [
  { to: '/account', label: 'Profile', end: true },
  { to: '/account/orders', label: 'Order History' },
  { to: '/account/addresses', label: 'Addresses' },
];

function Account() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <nav className="md:w-48 flex-shrink-0">
          <ul className="flex md:flex-col gap-2">
            {TABS.map((tab) => (
              <li key={tab.to}>
                <NavLink
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<ProfileSection />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/addresses" element={<AddressBook />} />
          </Routes>
        </div>
      </div>
    </Layout>
  );
}

export default Account;
