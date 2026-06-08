import { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input';
import Button from '../common/Button';

const EMPTY_ADDRESS = {
  firstName: '',
  lastName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
};

function AddressForm({
  initialValues, onSubmit, onCancel, isSubmitting, submitLabel,
}) {
  const [formData, setFormData] = useState({ ...EMPTY_ADDRESS, ...initialValues });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
        <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
      </div>
      <Input label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required />
      <Input label="Address Line 2" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Input label="City" name="city" value={formData.city} onChange={handleChange} required />
        <Input label="State" name="state" value={formData.state} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Input label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
        <Input label="Country" name="country" value={formData.country} onChange={handleChange} required />
      </div>
      <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />

      <div className="flex gap-3 mt-2">
        <Button type="submit" isLoading={isSubmitting}>{submitLabel}</Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
}

AddressForm.propTypes = {
  initialValues: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    addressLine1: PropTypes.string,
    addressLine2: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    postalCode: PropTypes.string,
    country: PropTypes.string,
    phone: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  isSubmitting: PropTypes.bool,
  submitLabel: PropTypes.string,
};

AddressForm.defaultProps = {
  initialValues: {},
  onCancel: undefined,
  isSubmitting: false,
  submitLabel: 'Save Address',
};

export default AddressForm;
