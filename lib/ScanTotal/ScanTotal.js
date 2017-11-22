import React from 'react';
import PropTypes from 'prop-types';
import css from './ScanTotal.css';

const ScanTotal = props =>
  (<div className={css.root}>Total items scanned: {props.total}</div>);

ScanTotal.propTypes = {
  total: PropTypes.number,
};

export default ScanTotal;
