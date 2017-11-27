import React from 'react';
import PropTypes from 'prop-types';
import Button from '@folio/stripes-components/lib/Button';

import css from './ScanTotal.css';

const ScanTotal = props => (
  <div className={css.root}>
    <div className={css.label}>
      Total items scanned: {props.total}
    </div>
    <div>
      <Button
        id={props.buttonId}
        buttonStyle="primary noRadius" onClick={props.onSessionEnd}
      >End Session</Button>
    </div>
  </div>
);

ScanTotal.propTypes = {
  buttonId: PropTypes.string,
  total: PropTypes.number,
  onSessionEnd: PropTypes.func,
};

export default ScanTotal;
