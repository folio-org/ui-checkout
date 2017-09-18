import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import Button from '@folio/stripes-components/lib/Button';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from 'react-bootstrap';

import ProxyModal from '../ProxyModal';
import { getAnchoredRowFormatter, getFullName, formatDate } from '../../util';
import css from './PatronView.css';

class PatronView extends React.Component {

  static propTypes = {
    patron: React.PropTypes.object,
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      proxies: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: React.PropTypes.shape({
    }),
    history: PropTypes.object,
  };

  static manifest = Object.freeze({
    patronGroups: {
      type: 'okapi',
      path: 'groups?query=(id=!{patron.patronGroup})',
      records: 'usergroups',
    },
    proxies: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(proxyFor=!{patron.id})',
    },
  });

  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.state = { showModal: false };
  }

  componentWillMount() {
    console.log('component will mount...');

    this.state = {
      showModal: !!(this.props.patron.proxyFor.length)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.patron.id && nextProps.patron.id !== this.props.patron.id) {
      this.setState({
        showModal: !!(nextProps.patron.proxyFor.length)
      });
    }
  }

  closeModal() {
    this.setState({ showModal: false });
  }

  goToUser(e, user) {
    this.props.history.push(`/users/view/${user.id}`);
    e.preventDefault();
  }

  getPatronGroup() {
    const resources = this.props.resources;
    const patronGroups = (resources.patronGroups || {}).records || [];
    return patronGroups[0] || {};
  }

  getPatronStatus() {
    return (_.get(this.props.patron, ['active'], '') ? 'Active' : 'Inactive');
  }

  getExpirationDate() {
    const { patron, stripes }  = this.props;
    return (patron.expirationDate ? formatDate(patron.expirationDate, stripes.locale) : '-');
  }

  getUserView(user) {
    const path = `/users/view/${user.id}`;
    return (
      <span>
        <a className={css.marginRight} onClick={e => this.goToUser(e, user)} href={path}>
          <strong>{getFullName(user)}</strong>
        </a>
        <strong>Barcode: </strong>
        <a onClick={e => this.goToUser(e, user)} href={path}>{user.barcode}</a>
      </span>
    );
  }

  render() {
    const { patron, stripes } = this.props;
    const patronGroup = this.getPatronGroup();
    const patronStatus = this.getPatronStatus();
    const expirationDate = this.getExpirationDate();

    return (
      <div>
        <br />
        <div className={`${css.section} ${css.active}`}>
          <Row>
            <Col xs={12}>
              <KeyValue label="Borrower" value={this.getUserView(patron)} />
            </Col>
          </Row>
        </div>

        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue label="Patron Group" value={patronGroup.group} />
            </Col>
            <Col xs={4}>
              <KeyValue label="Status" value={patronStatus} />
            </Col>
            <Col xs={4}>
              <KeyValue label="User Expiration" value={expirationDate} />
            </Col>
          </Row>
        </div>

        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue label="Open Loans" value={0} />
            </Col>
          </Row>
        </div>

        <ProxyModal open={this.state.showModal} onSave={(e) => {}} onClose={this.closeModal}></ProxyModal>
      </div>
    );
  }
}

export default PatronView;
