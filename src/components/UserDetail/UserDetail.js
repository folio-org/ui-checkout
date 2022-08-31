import { get } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  FormattedMessage,
} from 'react-intl';

import {
  withStripes,
  stripesShape,
} from '@folio/stripes/core';

import {
  Col,
  KeyValue,
  Row,
  FormattedDate,
  NoValue,
} from '@folio/stripes/components';

import { getFullName } from '../../util';
import userPlaceholder from '../../../icons/user-placeholder.png';
import Loans from './Loans';

import css from './UserDetail.css';

class UserDetail extends React.Component {
  static manifest = Object.freeze({
    patronGroups: {
      type: 'okapi',
      path: 'groups?query=(id==!{user.patronGroup})',
      records: 'usergroups',
    },
    openLoansCount: {
      type: 'okapi',
      path: 'circulation/loans?query=(userId==!{user.id} and status.name<>Closed)&limit=1',
    },
    openAccounts: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts?query=(userId==!{user.id} and status.name<>Closed)&limit=100',
    },
    openRequests: {
      type: 'okapi',
      throwErrors: false,
      path: 'circulation/requests?query=(requesterId==!{user.id} and status=="Open*")&limit=100',
    },
  });

  static propTypes = {
    user: PropTypes.object,
    id: PropTypes.string.isRequired,
    label: PropTypes.node,
    settings: PropTypes.arrayOf(PropTypes.object).isRequired,
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      openLoansCount: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      openAccounts: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      openRequests: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    renderLoans: PropTypes.bool,
    stripes: stripesShape.isRequired,
  };

  getUserValue = (user) => {
    const path = `/users/view/${user.id}`;

    return (
      <span>
        <Link
          className={css.marginRight}
          to={path}
        >
          <strong data-test-check-out-patron-full-name>
            {getFullName(user)}
          </strong>
        </Link>
        <FormattedMessage
          id="ui-checkout.user.detail.barcode"
          tagName="strong"
        />
        {' '}
        {user.barcode ? (<Link to={path}>{user.barcode}</Link>) : <NoValue />}
      </span>
    );
  };

  render() {
    const {
      id,
      user,
      resources,
      label,
      settings,
      renderLoans,
      stripes,
    } = this.props;

    const patronGroups = (resources.patronGroups || {}).records || [];
    const patronGroup = patronGroups[0] || {};
    const hasProfilePicture = !!(settings.length && settings[0].value === 'true');
    const statusVal = (get(user, ['active'], '') ? 'ui-checkout.active' : 'ui-checkout.inactive');

    return (
      <div id={id}>
        <div>
          <Row>
            <Col xs={hasProfilePicture ? 10 : 12}>
              <div className={`${css.section} ${css.active}`}>
                <KeyValue
                  label={label}
                  value={this.getUserValue(user)}
                />
              </div>
            </Col>
            {hasProfilePicture &&
              <Col xs={2}>
                <img className={`floatEnd ${css.userPlaceholder}`} src={userPlaceholder} alt="presentation" />
              </Col> }
          </Row>
        </div>

        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue
                label={<FormattedMessage id="ui-checkout.user.patronGroup" />}
              >
                {patronGroup.group}
              </KeyValue>
            </Col>
            <Col xs={4}>
              <KeyValue
                label={<FormattedMessage id="ui-checkout.status" />}
              >
                <FormattedMessage id={statusVal} />
              </KeyValue>
            </Col>
            <Col xs={4}>
              <KeyValue
                label={<FormattedMessage id="ui-checkout.user.expiration" />}
                value={user.expirationDate ? <FormattedDate value={user.expirationDate} /> : ''}
              />
            </Col>
          </Row>
        </div>

        {renderLoans && (
          <Loans
            resources={resources}
            stripes={stripes}
            user={user}
          />
        )}
      </div>
    );
  }
}

export default withStripes(UserDetail);
