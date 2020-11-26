import { get } from 'lodash';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  FormattedMessage,
} from 'react-intl';

import {
  stripesShape,
} from '@folio/stripes/core';

import {
  Col,
  KeyValue,
  Row,
} from '@folio/stripes/components';

import css from './UserDetail.css';

function Loans({
  resources,
  stripes,
  user,
}) {
  const renderOpenRequests = useMemo(() => {
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
    if (stripes.hasPerm('ui-checkout.viewRequests')) {
      return (
        <Link
          data-test-open-requests-count
          to={openRequestsPath}
        >
          {openRequestsCount}
        </Link>
      );
    }
    return openRequestsCount;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources.openRequests, user.barcode]);

  const openLoansCount = get(resources.openLoansCount, ['records', '0', 'totalRecords'], 0);
  const openLoansPath = `/users/${user.id}/loans/open`;
  const patronGroups = get(resources, ['patronGroups', 'records', 0, 'group'], '');
  const openAccounts = get(resources, ['openAccounts', 'records'], []);
  const openAccountsPath = `/users/view/${user.id}?layer=open-accounts&filters=pg.${patronGroups}`;
  const owedAmount = openAccounts.reduce((owed, { remaining }) => {
    return owed + parseFloat(remaining);
  }, 0);
  let openAccountsCount = parseFloat(owedAmount).toFixed(2);
  if (owedAmount && stripes.hasPerm('ui-checkout.viewFeeFines')) {
    openAccountsCount = <Link to={openAccountsPath}>{openAccountsCount}</Link>;
  }
  const openLoansLink = stripes.hasPerm('ui-checkout.viewLoans') ?
    <Link to={openLoansPath}>{openLoansCount}</Link> : openLoansCount;

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
            value={openAccountsCount}
          />
        </Col>
        <Col xs={4}>
          <KeyValue
            label={<FormattedMessage id="ui-checkout.openRequests" />}
            value={renderOpenRequests}
          />
        </Col>
      </Row>
    </div>
  );
}

Loans.propTypes = {
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
  stripes: stripesShape.isRequired,
  user: PropTypes.object,
};

export default Loans;

