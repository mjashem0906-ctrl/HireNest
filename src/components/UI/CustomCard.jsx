//-------------------------19/01------------------5.46-----------------

import React from 'react';
import styles from './CustomCard.module.scss';
import PropTypes from 'prop-types';

function CustomCard({ 
  children, 
  className = '', 
  padding = 'medium',
  hover = false,
  ...props // 1. Capture extra props like onClick
}) {
  return (
    <div 
      className={`${styles.card} ${styles[padding]} ${hover ? styles.hover : ''} ${className}`}
      {...props} // 2. Pass them to the div so click events work
    >
      {children}
    </div>
  );
};

{/*** CustomCard.propTypes={
  children: PropTypes.node.isRequired, 
  className: PropTypes.string, 
  padding: PropTypes.oneOf(['small','medium','large']),
  hover: PropTypes.bool
};
***/}

export default CustomCard;