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
      sponsors: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: React.PropTypes.shape({
      sponorQuery: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }),
    history: PropTypes.object,
  };

  static manifest = Object.freeze({
    sponorQuery: {
      initialValue: {},
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups?query=(id=!{patron.patronGroup})',
      records: 'usergroups',
    },
    sponsors: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(%{sponorQuery.ids})',
    },
  });

  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.onContinue = this.onContinue.bind(this);
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

    const ids = patron.proxyFor.map(id => `id=${id}`).join(' or ');

    if (sponorQuery.patronId !== patron.id || sponorQuery.ids !== ids) {
      mutator.sponorQuery.replace({ ids, patronId: patron.id });
    }
  }

  toggleModal(patron) {
    const showModal = !!(patron.proxyFor.length);
    this.setState({ showModal });
  }

  closeModal() {
    this.setState({ showModal: false });
  }

  onContinue(data) {
    const { patron, resources }= this.props;
    const sponsors = (resources.sponsors || {}).records || [];
    const proxy = (patron.id == data.sponsorId) ? patron
      : _.find(sponsors, s => s.id == data.sponsorId);
    this.closeModal();
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

  getUserValue(user) {
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

  getUserSection(user, label) {
    const patronGroup = this.getPatronGroup();
    const stripes = this.props.stripes;

    return (
      <div>
        <div className={`${css.section} ${css.active}`}>
          <Row>
            <Col xs={12}>
              <KeyValue label={label} value={this.getUserValue(user)} />
            </Col>
          </Row>
        </div>

        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue label="Patron Group" value={patronGroup.group} />
            </Col>
            <Col xs={4}>
              <KeyValue label="Status" value={(_.get(user, ['active'], '') ? 'Active' : 'Inactive')} />
            </Col>
            <Col xs={4}>
              <KeyValue label="User Expiration" value={(user.expirationDate ? formatDate(user.expirationDate, stripes.locale) : '-')} />
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  render() {
    const { patron, stripes, resources } = this.props;
    const sponsors = (resources.sponsors || {}).records || [];

    return (
      <div>
        <br />
        {this.getUserSection(patron, 'Patron')}

        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue label="Open Loans" value={0} />
            </Col>
          </Row>
        </div>

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
