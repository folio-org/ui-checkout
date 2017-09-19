import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from 'react-bootstrap';

import ProxyModal from '../ProxyModal';
import UserInfo from '../UserInfo';
import css from './PatronView.css';

class PatronView extends React.Component {

  static propTypes = {
    stripes: PropTypes.object,
    patron: React.PropTypes.object,
    proxy: React.PropTypes.object,
    onSelectProxy: PropTypes.func,
    resources: PropTypes.shape({
      sponsors: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: React.PropTypes.shape({
      sponorQuery: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }),
  };

  static manifest = Object.freeze({
    sponorQuery: {
      initialValue: {},
    },
    sponsors: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(%{sponorQuery.ids})',
    },
    openLoansCount: {
      type: 'okapi',
      GET: {
        path: 'circulation/loans?query=(userId=!{patron.id} and status.name<>Closed)&limit=1',
      },
    },
  });

  constructor(props) {
    super(props);

    this.closeModal = this.closeModal.bind(this);
    this.onContinue = this.onContinue.bind(this);
    this.connectedUserInfo = props.stripes.connect(UserInfo);
    this.state = { showModal: false };
  }

  componentWillMount() {
    this.toggleModal(this.props.patron);
  }

  componentWillReceiveProps(nextProps) {
    const { patron, resources: { sponorQuery }, mutator } = nextProps;

    if (patron.id !== this.props.patron.id) {
      this.toggleModal(patron);
    }

    if (!patron.proxyFor.length) return;

    const ids = patron.proxyFor.map(id => `id=${id}`).join(' or ');
    if (sponorQuery.patronId !== patron.id || sponorQuery.ids !== ids) {
      mutator.sponorQuery.replace({ ids, patronId: patron.id });
    }
  }

  onContinue(data) {
    const { resources, onSelectProxy } = this.props;
    const sponsors = (resources.sponsors || {}).records || [];
    const proxy = _.find(sponsors, s => s.id === data.sponsorId);

    if (proxy) {
      onSelectProxy(proxy);
    }

    this.closeModal();
  }

  toggleModal(patron) {
    const showModal = !!(patron.proxyFor.length);
    this.setState({ showModal });
  }

  closeModal() {
    this.setState({ showModal: false });
  }

  render() {
    const { patron, proxy, resources, stripes } = this.props;
    const sponsors = (resources.sponsors || {}).records || [];
    const openLoansCount = _.get(resources.openLoansCount, ['records', '0', 'totalRecords'], 0);

    const patronInfo = (
      <div>
        <br />
        <this.connectedUserInfo label="Patron" user={patron} stripes={stripes} />
        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue label="Open Loans" value={openLoansCount} />
            </Col>
          </Row>
        </div>
      </div>
    );

    const proxyInfo = (
      <div>
        <br />
        <this.connectedUserInfo label="Proxy" user={proxy} stripes={stripes} />
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
        {!this.state.showModal && patronInfo}
        {!this.state.showModal && proxy.id && proxyInfo}
        <ProxyModal
          patron={patron}
          sponsors={sponsors}
          open={this.state.showModal}
          onContinue={this.onContinue}
          onClose={this.closeModal}
        />
      </div>
    );
  }
}

export default PatronView;
