import { get } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  FormattedDate,
  FormattedMessage,
} from 'react-intl';

import {
  Col,
  KeyValue,
  Row,
} from '@folio/stripes/components';

import { getFullName } from '../../util';

import css from './UserDetail.css';

class UserDetail extends React.Component {
  static manifest = Object.freeze({
    patronGroups: {
      type: 'okapi',
      path: 'groups?query=(id=!{user.patronGroup})',
      records: 'usergroups',
    },
    openLoansCount: {
      type: 'okapi',
      path: 'circulation/loans?query=(userId=!{user.id} and status.name<>Closed)&limit=1',
    },
    openAccounts: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts?query=(userId=!{user.id} and status.name<>Closed)&limit=100',
    },
    openRequests: {
      type: 'okapi',
      throwErrors: false,
      path: 'circulation/requests?query=(requesterId=!{user.id} and status=Open)&limit=100',
    },
  });

  static propTypes = {
    user: PropTypes.object,
    label: PropTypes.node,
    settings: PropTypes.arrayOf(PropTypes.object),
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
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
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
        {user.barcode ? (<Link to={path}>{user.barcode}</Link>) : '-'}
      </span>
    );
  };

  renderLoans() {
    const {
      renderLoans,
      resources,
      user,
    } = this.props;

    if (!renderLoans) return null;

    const openLoansCount = get(resources.openLoansCount, ['records', '0', 'totalRecords'], 0);
    const openLoansPath = `/users/view/${user.id}?layer=open-loans&query=`;
    const openLoansLink = <Link to={openLoansPath}>{openLoansCount}</Link>;
    const patronGroups = get(resources, ['patronGroups', 'records', 0, 'group'], '');
    const openAccounts = get(resources, ['openAccounts', 'records'], []);
    const openAccountsPath = `/users/view/${user.id}?layer=open-accounts&filters=pg.${patronGroups}`;
    const owedAmount = openAccounts.reduce((owed, { remaining }) => {
      return owed + parseFloat(remaining);
    }, 0);
    let openAccountsLink = parseFloat(owedAmount).toFixed(2);
    if (owedAmount) {
      openAccountsLink = <Link to={openAccountsPath}>{openAccountsLink}</Link>;
    }

    return (
      <div className={css.section}>
        <Row>
          <Col xs={4}>
            <KeyValue
              label={<FormattedMessage id="ui-checkout.openLoans" />}
              value={openLoansLink}
            />
          </Col>
          <Col xs={4}>
            <KeyValue
              label={<FormattedMessage id="ui-checkout.openAccounts" />}
              value={openAccountsLink}
            />
          </Col>
          <Col xs={4}>
            <KeyValue
              label={<FormattedMessage id="ui-checkout.openRequests" />}
              value={this.renderOpenRequests()}
            />
          </Col>
        </Row>
      </div>
    );
  }

  renderOpenRequests() {
    const {
      resources,
      stripes,
      user,
    } = this.props;

    if (!stripes.hasPerm('ui-users.requests.all,ui-requests.all')) return '-';

    const openRequestsCount = get(resources.openRequests, ['records', '0', 'totalRecords'], 0);

    const openRequestStatuses = [
      'Open - Not yet filled',
      'Open - Awaiting pickup',
      'Open - In transit',
      'Open - Awaiting delivery',
    ]
      .map(status => `requestStatus.${status}`)
      .join(',');

    const openRequestsPath = `/requests?query=${user.barcode}&filters=${openRequestStatuses}&sort=Request date`;

    return (
      <Link
        data-test-open-requests-count
        to={openRequestsPath}
      >
        {openRequestsCount}
      </Link>
    );
  }

  render() {
    const {
      user,
      resources,
      label,
      settings,
    } = this.props;

    const patronGroups = (resources.patronGroups || {}).records || [];
    const patronGroup = patronGroups[0] || {};
    const hasProfilePicture = !!(settings.length && settings[0].value === 'true');
    const statusVal = (get(user, ['active'], '') ? 'ui-checkout.active' : 'ui-checkout.inactive');

    return (
      <div>
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
                <img
                  src="http://placehold.it/60x60"
                  alt={<FormattedMessage id="ui-checkout.presentation" />}
                />
              </Col>
            }
          </Row>
        </div>

        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue
                label={<FormattedMessage id="ui-checkout.patronGroup" />}
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
                label={<FormattedMessage id="ui-checkout.userExpiration" />}
                value={user.expirationDate ? <FormattedDate value={user.expirationDate} /> : '-'}
              />
            </Col>
          </Row>
        </div>

        {this.renderLoans()}
      </div>
    );
  }
}

export default UserDetail;
