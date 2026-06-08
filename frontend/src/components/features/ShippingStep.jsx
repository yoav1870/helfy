import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import AddressForm from './AddressForm';
import userService from '../../services/user.service';

function ShippingStep({
  selectedAddressId, onSelectAddress, onBack, onNext,
}) {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddresses = async () => {
    try {
      const response = await userService.getAddresses();
      setAddresses(response.data);
      if (!selectedAddressId && response.data.length > 0) {
        const defaultAddress = response.data.find((a) => a.is_default) || response.data[0];
        onSelectAddress(defaultAddress.id);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddAddress = async (addressData) => {
    setIsSubmitting(true);
    try {
      const response = await userService.addAddress(addressData);
      setAddresses((prev) => [...prev, response.data]);
      onSelectAddress(response.data.id);
      setShowForm(false);
      toast.success('Address added');
    } catch (error) {
      toast.error(error.message || 'Failed to add address');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="text-gray-600">Loading addresses...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>

      {addresses.length > 0 && (
        <div className="space-y-3 mb-6">
          {addresses.map((address) => (
            <label
              key={address.id}
              htmlFor={`address-${address.id}`}
              className={`flex items-start gap-3 bg-white p-4 rounded-lg shadow border-2 cursor-pointer ${
                selectedAddressId === address.id ? 'border-blue-600' : 'border-transparent'
              }`}
            >
              <input
                type="radio"
                id={`address-${address.id}`}
                name="shippingAddress"
                checked={selectedAddressId === address.id}
                onChange={() => onSelectAddress(address.id)}
                className="mt-1"
              />
              <div>
                <p className="font-semibold">
                  {address.first_name}
                  {' '}
                  {address.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  {address.address_line1}
                  {address.address_line2 ? `, ${address.address_line2}` : ''}
                </p>
                <p className="text-sm text-gray-600">
                  {address.city}
                  {', '}
                  {address.state}
                  {' '}
                  {address.postal_code}
                </p>
                <p className="text-sm text-gray-600">{address.country}</p>
              </div>
            </label>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <AddressForm
            onSubmit={handleAddAddress}
            onCancel={() => setShowForm(false)}
            isSubmitting={isSubmitting}
            submitLabel="Add Address"
          />
        </div>
      ) : (
        <Button variant="outline" size="small" onClick={() => setShowForm(true)} className="mb-6">
          + Add New Address
        </Button>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button disabled={!selectedAddressId} onClick={onNext}>Continue to Payment</Button>
      </div>
    </div>
  );
}

ShippingStep.propTypes = {
  selectedAddressId: PropTypes.number,
  onSelectAddress: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};

ShippingStep.defaultProps = {
  selectedAddressId: null,
};

export default ShippingStep;
