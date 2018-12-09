import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Headline,
  KeyValue,
  Row,
} from '@folio/stripes/components';

import { ProxyManager } from '@folio/stripes/smart-components';
import UserDetail from '../UserDetail';
import PatronBlock from '../PatronBlock';
import css from './ViewPatron.css';

class ViewPatron extends React.Component {
  static propTypes = {
    stripes: PropTypes.object.isRequired,
    patron: PropTypes.object.isRequired,
    proxy: PropTypes.object.isRequired,
    onSelectPatron: PropTypes.func.isRequired,
    onClearPatron: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.connectedProxyDetail = props.stripes.connect(UserDetail, { dataKey: 'proxy' });
    this.connectedPatronDetail = props.stripes.connect(UserDetail, { dataKey: 'patron' });
    this.connectedProxyManager = props.stripes.connect(ProxyManager);
  }

  render() {
    const {
      patron,
      proxy,
      onSelectPatron,
      onClearPatron,
    } = this.props;

    const patronDetail = (
      <div>
        <br />
        <this.connectedPatronDetail
          id="patron-detail"
          label={
            <Headline size="medium">
              <FormattedMessage id="ui-checkout.borrower" />
            </Headline>
          }
          user={patron}
          renderLoans
          {...this.props}
        />
      </div>
    );

    const proxyDetail = (
      <div>
        <br />
        <this.connectedProxyDetail
          id="proxy-detail"
          label={<FormattedMessage id="ui-checkout.borrowerProxy" />}
          user={proxy}
          {...this.props}
        />
        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue
                label={<FormattedMessage id="ui-checkout.proxyExpiration" />}
                value="-"
              />
            </Col>
          </Row>
        </div>
      </div>
    );

    return (
      <div>
        {patronDetail}
        {proxy.id && proxy.id !== patron.id && proxyDetail}
        <this.connectedProxyManager
          patron={patron}
          proxy={proxy}
          onSelectPatron={onSelectPatron}
          onClose={onClearPatron}
        />
        <PatronBlock
          patronBlocksCount={this.props.patronBlocks.length || 0}
          openBlockedModal={this.props.openBlockedModal}
          user={patron}
        />
      </div>
    );
  }
}

export default ViewPatron;
