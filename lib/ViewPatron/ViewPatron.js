import { find, get, isEmpty } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Headline from '@folio/stripes-components/lib/Headline';
import ProxyModal from '../ProxyModal';
import UserDetail from '../UserDetail';
import css from './ViewPatron.css';

class ViewPatron extends React.Component {
  static propTypes = {
    stripes: PropTypes.object.isRequired,
    patron: PropTypes.object.isRequired,
    proxiesFor: PropTypes.arrayOf(PropTypes.object).isRequired,
    sponsorOf: PropTypes.arrayOf(PropTypes.object).isRequired,
    proxy: PropTypes.object.isRequired,
    onSelectPatron: PropTypes.func.isRequired,
    onClearPatron: PropTypes.func.isRequired,
    resources: PropTypes.shape({
      proxies: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      sponorQuery: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    sponorQuery: {
      initialValue: {},
    },
    proxies: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(%{sponorQuery.ids})',
    },
    openLoansCount: {
      type: 'okapi',
      path: 'circulation/loans?query=(userId=!{patron.id} and status.name<>Closed)&limit=1',
    },
  });

  constructor(props) {
    super(props);

    this.toggleModal = this.toggleModal.bind(this);
    this.onContinue = this.onContinue.bind(this);
    this.onClose = this.onClose.bind(this);

    this.connectedProxyDetail = props.stripes.connect(UserDetail, { dataKey: 'proxy' });
    this.connectedPatronDetail = props.stripes.connect(UserDetail, { dataKey: 'patron' });

    this.state = { showModal: false };
  }

  componentDidMount() {
    const { patron, onSelectPatron, proxiesFor, proxy } = this.props;
    const hasProxy = !!(proxiesFor.length);

    if (hasProxy && isEmpty(proxy)) {
      this.toggleModal(true);
    } else {
      onSelectPatron(patron);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { patron, proxiesFor, resources: { sponorQuery }, mutator } = nextProps;
    const hasProxy = !!(proxiesFor.length);

    if (!hasProxy) return;

    const ids = proxiesFor.map(p => `id=${p.userId}`).join(' or ');

    if (sponorQuery.patronId !== patron.id || sponorQuery.ids !== ids) {
      mutator.sponorQuery.replace({ ids, patronId: patron.id });
    }
  }

  onContinue(data) {
    const { resources, onSelectPatron, patron } = this.props;
    const proxies = (resources.proxies || {}).records || [];
    const selPatron = (patron.id === data.sponsorId)
      ? patron
      : find(proxies, s => s.id === data.sponsorId);

    onSelectPatron(selPatron);
    setTimeout(() => this.toggleModal(false));
  }

  onClose() {
    this.toggleModal(false);
    this.props.onClearPatron();
  }

  toggleModal(showModal) {
    this.setState({ showModal });
  }

  render() {
    const { patron, proxy, resources, sponsorOf, proxiesFor } = this.props;
    const proxies = (resources.proxies || {}).records || [];
    const openLoansCount = get(resources.openLoansCount, ['records', '0', 'totalRecords'], 0);
    const showModal = this.state.showModal;
    const patronDetail = (
      <div>
        <br />
        <this.connectedPatronDetail id="patron-detail" label={<Headline size="medium">Borrower</Headline>} user={patron} {...this.props} />
        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue label="Open Loans" value={openLoansCount} />
            </Col>
          </Row>
        </div>
      </div>
    );

    const proxyDetail = (
      <div>
        <br />
        <this.connectedProxyDetail id="proxy-detail" label="Borrrower's proxy" user={proxy} {...this.props} />
        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue label="Proxy Expiration" value="-" />
            </Col>
          </Row>
        </div>
      </div>
    );

    return (
      <div>
        {!showModal && patronDetail}
        {!showModal && proxy.id && proxy.id !== patron.id && proxyDetail}
        <ProxyModal
          patron={patron}
          proxies={proxies}
          proxiesFor={proxiesFor}
          sponsorOf={sponsorOf}
          open={showModal}
          onContinue={this.onContinue}
          onClose={this.onClose}
        />
      </div>
    );
  }
}

export default ViewPatron;
