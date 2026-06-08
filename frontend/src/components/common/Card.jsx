import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

function Card({ children, className, hover }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' } : {}}
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
};

Card.defaultProps = {
  className: '',
  hover: false,
};

export default Card;
