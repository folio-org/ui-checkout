import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';

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
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }).isRequired,
    patronBlocks: PropTypes.arrayOf(PropTypes.object),
    settings: PropTypes.arrayOf(PropTypes.object),
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
      patronBlocks,
      settings,
      intl: {
        formatMessage,
      },
    } = this.props;

    const patronDetail = (
      <div className={css.detail}>
        <this.connectedPatronDetail
          id="patron-detail"
          label={
            <Headline size="medium">
              <FormattedMessage id="ui-checkout.borrower" />
            </Headline>
          }
          user={patron}
          renderLoans
          settings={settings}
          {...this.props}
        />
      </div>
    );

    const proxyDetail = (
      <div className={css.detail}>
        <this.connectedProxyDetail
          id="proxy-detail"
          label={<FormattedMessage id="ui-checkout.borrowerProxy" />}
          user={proxy}
          settings={settings}
          ariaLabel={formatMessage({ id: 'ui-checkout.proxy.ariaLabel' })}
        />
        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue
                label={<FormattedMessage id="ui-checkout.proxy.expiration" />}
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
        <PatronBlock
          patronBlocksCount={patronBlocks.length || 0}
          user={patron}
          formatMessage={formatMessage}
        />
        {proxy.id && proxy.id !== patron.id && proxyDetail}
        <this.connectedProxyManager
          patron={patron}
          proxy={proxy}
          onSelectPatron={onSelectPatron}
          onClose={onClearPatron}
          ariaLabel={formatMessage({ id: 'ui-checkout.borrower.ariaLabel' })}
        />
      </div>
    );
  }
}

export default injectIntl(ViewPatron);
