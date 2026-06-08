import { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input';
import Button from '../common/Button';

const PAYMENT_METHODS = ['Credit Card', 'PayPal'];

const EMPTY_CARD = {
  cardHolder: '', cardNumber: '', expiry: '', cvv: '',
};

function PaymentStep({
  paymentMethod, onSelectMethod, onBack, onNext, isSubmitting,
}) {
  const [card, setCard] = useState(EMPTY_CARD);

  const handleCardChange = (e) => {
    setCard({ ...card, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
      <p className="text-sm text-gray-500 mb-4">
        This is a mock checkout — no real payment is processed and your card details are not stored.
      </p>

      <div className="flex gap-3 mb-6">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => onSelectMethod(method)}
            className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
              paymentMethod === method
                ? 'border-blue-600 bg-blue-50 text-blue-600'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            {method}
          </button>
        ))}
      </div>

      {paymentMethod === 'Credit Card' && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <Input label="Card Holder Name" name="cardHolder" value={card.cardHolder} onChange={handleCardChange} required />
          <Input label="Card Number" name="cardNumber" value={card.cardNumber} onChange={handleCardChange} placeholder="•••• •••• •••• ••••" required />
          <div className="grid grid-cols-2 gap-x-4">
            <Input label="Expiry" name="expiry" value={card.expiry} onChange={handleCardChange} placeholder="MM/YY" required />
            <Input label="CVV" name="cvv" type="password" value={card.cvv} onChange={handleCardChange} placeholder="•••" required />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>Back</Button>
        <Button type="submit" isLoading={isSubmitting}>Place Order</Button>
      </div>
    </form>
  );
}

PaymentStep.propTypes = {
  paymentMethod: PropTypes.string.isRequired,
  onSelectMethod: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

PaymentStep.defaultProps = {
  isSubmitting: false,
};

export default PaymentStep;
