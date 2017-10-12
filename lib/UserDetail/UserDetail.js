import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from 'react-bootstrap';

import { getFullName, formatDate } from '../../util';
import css from './UserDetail.css';

class UserDetail extends React.Component {
  static propTypes = {
    stripes: PropTypes.object,
    user: PropTypes.object,
    label: PropTypes.string,
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    history: PropTypes.object,
  };

  static manifest = Object.freeze({
    patronGroups: {
      type: 'okapi',
      path: 'groups?query=(id=!{user.patronGroup})',
      records: 'usergroups',
    },
  });

  getUserValue(user) {
    const path = `/users/view/${user.id}`;

    return (
      <span>
        <a className={css.marginRight} onClick={e => this.goToUser(e, user)} href={path}>
          <strong>{getFullName(user)}</strong>
        </a>
        <strong>Barcode: </strong>
        {user.barcode
          ? <a onClick={e => this.goToUser(e, user)} href={path}>{user.barcode}</a>
          : '-'
        }
      </span>
    );
  }

  goToUser(e, user) {
    this.props.history.push(`/users/view/${user.id}`);
    e.preventDefault();
  }

  render() {
    const { user, resources, stripes, label } = this.props;
    const patronGroups = (resources.patronGroups || {}).records || [];
    const patronGroup = patronGroups[0] || {};

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
}

export default UserDetail;
