import React from 'react';
import PropTypes from 'prop-types';
import Button from '@folio/stripes-components/lib/Button';

import css from './ScanTotal.css';

class ScanTotal extends React.Component {
  static contextTypes = {
    translate: PropTypes.func,
  };

  static propTypes = {
    buttonId: PropTypes.string,
    total: PropTypes.number,
    onSessionEnd: PropTypes.func,
  };

  render() {
    const { total, buttonId, onSessionEnd } = this.props;

    return (
      <div className={css.root}>
        {total > 0 &&
          <div className={css.label}>
            {this.context.translate('totalItemsScanned', { total })}
          </div>
        }
        <div>
          <Button
            id={buttonId}
            buttonStyle="primary"
            onClick={onSessionEnd}
          >{this.context.translate('endSession')}
          </Button>
        </div>
      </div>
    );
  }
}

export default ScanTotal;
