import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import AddressForm from './AddressForm';
import AddressCard from './AddressCard';
import userService from '../../services/user.service';

function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAddresses = async () => {
    try {
      const response = await userService.getAddresses();
      setAddresses(response.data);
    } catch (error) {
      toast.error(error.message || 'Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const closeForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleSubmit = async (addressData) => {
    setIsSubmitting(true);
    try {
      if (editingAddress) {
        const response = await userService.updateAddress(editingAddress.id, addressData);
        setAddresses((prev) => prev.map((a) => (a.id === editingAddress.id ? response.data : a)));
        toast.success('Address updated');
      } else {
        const response = await userService.addAddress(addressData);
        setAddresses((prev) => [...prev, response.data]);
        toast.success('Address added');
      }
      closeForm();
    } catch (error) {
      toast.error(error.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    setDeletingId(addressId);
    try {
      await userService.deleteAddress(addressId);
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      toast.success('Address removed');
    } catch (error) {
      toast.error(error.message || 'Failed to delete address');
    } finally {
      setDeletingId(null);
    }
  };

  const editingInitialValues = editingAddress ? {
    firstName: editingAddress.first_name,
    lastName: editingAddress.last_name,
    addressLine1: editingAddress.address_line1,
    addressLine2: editingAddress.address_line2 || '',
    city: editingAddress.city,
    state: editingAddress.state,
    postalCode: editingAddress.postal_code,
    country: editingAddress.country,
    phone: editingAddress.phone || '',
  } : {};

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Saved Addresses</h2>
        {!showForm && (
          <Button size="small" onClick={() => setShowForm(true)}>+ Add Address</Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-6 max-w-lg">
          <h3 className="font-semibold mb-3">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
          <AddressForm
            initialValues={editingInitialValues}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isSubmitting={isSubmitting}
            submitLabel={editingAddress ? 'Update Address' : 'Add Address'}
          />
        </div>
      )}

      {addresses.length === 0 ? (
        <p className="text-gray-600">No saved addresses yet.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deletingId === address.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AddressBook;
