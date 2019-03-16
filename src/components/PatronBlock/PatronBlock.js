import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import {
  Col,
  Icon,
  KeyValue,
  Row
} from '@folio/stripes/components';
import css from './PatronBlock.css';

class PatronBlock extends React.Component {
  static propTypes = {
    patronBlocksCount: PropTypes.number,
    patronBlocks:  PropTypes.arrayOf(PropTypes.object),
    openBlockedModal: PropTypes.func,
    user: PropTypes.object,
  };

  componentDidUpdate(prevProps) {
    const { openBlockedModal, patronBlocks } = this.props;
    if (!_.isEqual(prevProps.patronBlocks, patronBlocks) && patronBlocks.length > 0) {
      openBlockedModal();
    }
  }

  render() {
    const {
      patronBlocksCount,
      user
    } = this.props;

    const viewUserPath = `/users/view/${user.id}`;
    const patronMessage = <FormattedMessage id="ui-checkout.patronBlocksCount" values={{ count: patronBlocksCount }} />;
    const viewUserLink = (
      <div>
        <Link to={viewUserPath}>{patronBlocksCount}</Link>
        <span style={{ color: '#900' }}>{patronMessage}</span>
      </div>
    );

    const label = (
      <div>
        <Row>
          <Col xs>
            <FormattedMessage id="ui-checkout.patronBlocks" />
            {(patronBlocksCount > 0) ? <span style={{ 'marginLeft': '7px' }}><Icon size="medium" icon="exclamation-circle" status="error" /></span> : ''}
          </Col>
        </Row>
      </div>
    );

    return (
      <div className={css.section}>
        <Row>
          <Col xs>
            <KeyValue
              label={label}
              value={patronBlocksCount > 0 ? viewUserLink : '-'}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default PatronBlock;
