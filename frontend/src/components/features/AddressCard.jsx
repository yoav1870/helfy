import PropTypes from 'prop-types';
import Button from '../common/Button';

function AddressCard({
  address, onEdit, onDelete, isDeleting,
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-start justify-between">
      <div>
        {address.is_default ? (
          <span className="inline-block mb-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            Default
          </span>
        ) : null}
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
      <div className="flex gap-2">
        <Button size="small" variant="outline" onClick={() => onEdit(address)}>Edit</Button>
        <Button size="small" variant="danger" isLoading={isDeleting} onClick={() => onDelete(address.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
}

AddressCard.propTypes = {
  address: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    address_line1: PropTypes.string.isRequired,
    address_line2: PropTypes.string,
    city: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    postal_code: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    is_default: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
};

AddressCard.defaultProps = {
  isDeleting: false,
};

export default AddressCard;
