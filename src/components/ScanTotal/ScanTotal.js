import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@folio/stripes/components';

import css from './ScanTotal.css';

class ScanTotal extends React.Component {
  static propTypes = {
    buttonId: PropTypes.string,
    total: PropTypes.number,
    onSessionEnd: PropTypes.func,
    translate: PropTypes.func,
  };

  render() {
    const { total, buttonId, onSessionEnd, translate } = this.props;

    return (
      <div className={css.root}>
        {total > 0 &&
          <div className={css.label}>
            {translate('totalItemsScanned', { total })}
          </div>
        }
        <div>
          <Button
            id={buttonId}
            buttonStyle="primary"
            onClick={onSessionEnd}
          >
            {translate('endSession')}
          </Button>
        </div>
      </div>
    );
  }
}

export default ScanTotal;
