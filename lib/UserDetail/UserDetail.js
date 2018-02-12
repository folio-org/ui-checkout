import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate } from 'react-intl';
import { Link } from 'react-router-dom';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import { getFullName } from '../../util';
import css from './UserDetail.css';

class UserDetail extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    label: PropTypes.string,
    settings: PropTypes.arrayOf(PropTypes.object),
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
  };

  static manifest = Object.freeze({
    patronGroups: {
      type: 'okapi',
      path: 'groups?query=(id=!{user.patronGroup})',
      records: 'usergroups',
    },
  });

  getUserValue = (user) => {
    const path = `/users/view/${user.id}`;

    return (
      <span>
        <Link className={css.marginRight} to={path}>
          <strong>{getFullName(user)}</strong>
        </Link>
        <strong>Barcode: </strong>
        {user.barcode ? (<Link to={path}>{user.barcode}</Link>) : '-'}
      </span>
    );
  }

  render() {
    const { user, resources, label, settings } = this.props;
    const patronGroups = (resources.patronGroups || {}).records || [];
    const patronGroup = patronGroups[0] || {};
    const hasProfilePicture = !!(settings.length && settings[0].value === 'true');

    return (
      <div>
        <div>
          <Row>
            <Col xs={hasProfilePicture ? 10 : 12}>
              <div className={`${css.section} ${css.active}`}>
                <KeyValue label={label} value={this.getUserValue(user)} />
              </div>
            </Col>
            { hasProfilePicture &&
              <Col xs={2}>
                <img src="http://placehold.it/60x60" alt="presentation" />
              </Col>
            }
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
              <KeyValue label="User Expiration" value={user.expirationDate ? (<FormattedDate value={user.expirationDate} />) : '-'} />
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default UserDetail;
