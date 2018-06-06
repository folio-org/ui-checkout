import React from 'react';
import PropTypes from 'prop-types';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Headline from '@folio/stripes-components/lib/Headline';
import ProxyManager from '@folio/stripes-smart-components/lib/ProxyManager';
import UserDetail from '../UserDetail';
import css from './ViewPatron.css';

class ViewPatron extends React.Component {
  static propTypes = {
    stripes: PropTypes.object.isRequired,
    patron: PropTypes.object.isRequired,
    proxy: PropTypes.object.isRequired,
    onSelectPatron: PropTypes.func.isRequired,
    onClearPatron: PropTypes.func.isRequired,
  };

  static contextTypes = {
    translate: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.connectedProxyDetail = props.stripes.connect(UserDetail, { dataKey: 'proxy' });
    this.connectedPatronDetail = props.stripes.connect(UserDetail, { dataKey: 'patron' });
    this.connectedProxyManager = props.stripes.connect(ProxyManager);
  }

  render() {
    const { translate } = this.context;
    const { patron, proxy } = this.props;
    const patronDetail = (
      <div>
        <br />
        <this.connectedPatronDetail id="patron-detail" label={<Headline size="medium">{translate('borrower')}</Headline>} user={patron} renderLoans {...this.props} />
      </div>
    );

    const proxyDetail = (
      <div>
        <br />
        <this.connectedProxyDetail id="proxy-detail" label={translate('borrowerProxy')} user={proxy} {...this.props} />
        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue label={translate('proxyExpiration')} value="-" />
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
          onSelectPatron={this.props.onSelectPatron}
          onClose={this.props.onClearPatron}
        />
      </div>
    );
  }
}

export default ViewPatron;
