import PropTypes from 'prop-types';

function Input({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  className,
}) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

Input.defaultProps = {
  label: undefined,
  type: 'text',
  placeholder: undefined,
  error: undefined,
  required: false,
  disabled: false,
  className: '',
};

export default Input;
