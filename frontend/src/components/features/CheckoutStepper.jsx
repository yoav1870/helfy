import PropTypes from 'prop-types';

const STEPS = ['Cart Review', 'Shipping', 'Payment', 'Confirmation'];

function CheckoutStepper({ currentStep }) {
  return (
    <ol className="flex items-center justify-between mb-10">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <li key={label} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-1">
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                  isActive || isComplete ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </span>
              <span className={`mt-2 text-xs text-center ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                {label}
              </span>
            </div>
            {stepNumber < STEPS.length && (
              <div className={`h-0.5 flex-1 -mt-5 ${isComplete ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

CheckoutStepper.propTypes = {
  currentStep: PropTypes.number.isRequired,
};

export default CheckoutStepper;
