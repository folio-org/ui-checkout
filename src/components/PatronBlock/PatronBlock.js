import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Icon,
  KeyValue,
  Row,
} from '@folio/stripes/components';

import css from './PatronBlock.css';

class PatronBlock extends React.Component {
  static propTypes = {
    patronBlocksCount: PropTypes.number,
    user: PropTypes.object,
  };

  render() {
    const {
      patronBlocksCount,
      user,
    } = this.props;

    const viewUserPath = `/users/view/${user.id}`;
    const patronMessage = <FormattedMessage id="ui-checkout.patronBlocksCount" values={{ count: patronBlocksCount }} />;
    const viewUserLink = (
      <div data-testid="patronBlockLink">
        <Link to={viewUserPath}>{patronBlocksCount}</Link>
        <span className={css.warnMessage}>{patronMessage}</span>
      </div>
    );

    const label = (
      <div data-testid="patronBlockLabel">
        <Row>
          <Col xs>
            <FormattedMessage id="ui-checkout.patronBlocks" />
            {(patronBlocksCount > 0) ?
              <span
                data-testid="warnIcon"
                className={css.warnIcon}
              >
                <Icon size="medium" icon="exclamation-circle" status="error" />
              </span>
              : ''
            }
          </Col>
        </Row>
      </div>
    );

    return (
      <div
        data-testid="patronBlock"
        className={css.section}
      >
        <Row>
          <Col xs>
            <KeyValue
              label={label}
              value={patronBlocksCount > 0 ? viewUserLink : ''}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default PatronBlock;
