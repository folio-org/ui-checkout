import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';

import css from './ScanTotal.css';

class ScanTotal extends React.Component {
  static propTypes = {
    buttonId: PropTypes.string,
    total: PropTypes.number,
    onSessionEnd: PropTypes.func,
  };

  render() {
    const {
      total,
      buttonId,
      onSessionEnd,
    } = this.props;

    return (
      <div className={css.root}>
        {total > 0 &&
          <div className={css.label}>
            <FormattedMessage
              id="ui-checkout.totalItemsScanned"
              values={{ total }}
            />
          </div>}
        <div>
          <Button
            id={buttonId}
            buttonStyle="primary mega"
            onClick={onSessionEnd}
          >
            <FormattedMessage id="ui-checkout.end.session" />
          </Button>
        </div>
      </div>
    );
  }
}

export default ScanTotal;
