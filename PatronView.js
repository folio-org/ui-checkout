import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import Button from '@folio/stripes-components/lib/Button';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from 'react-bootstrap';

import { getAnchoredRowFormatter, getFullName, formatDate } from './util';

class PatronView extends React.Component {

  static propTypes = {
    patron: React.PropTypes.object,
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
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
      path: 'groups',
      records: 'usergroups',
      GET: {
        path: 'groups?query=(id=!{patron.patronGroup})',
      },
    },
  });

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
      <span className="">
        <a onClick={e => this.goToUser(e, user)} href={path}>
          <strong>{getFullName(user)}</strong>
        </a>
        <strong>Barcode:</strong>
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
        <Row>
          <Col xs={12}>
            <KeyValue label="BORROWER" value={this.getUserView(patron)} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={4}>
            <KeyValue label="PATRON GROUP" value={patronGroup.group} />
          </Col>
          <Col xs={4}>
            <KeyValue label="STATUS" value={patronStatus} />
          </Col>
          <Col xs={4}>
            <KeyValue label="USER EXPIRATION" value={expirationDate} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={4}>
            <KeyValue label="OPEN LOANS" value={0} />
          </Col>
        </Row>
      </div>);
  }
}

export default PatronView;
