import { get } from 'lodash';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  FormattedMessage,
  FormattedNumber,
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

    // "ui-requests.view" doesn’t make ui-checkout dependent on ui-requests,
    // but if ui-requests happens to be installed and the correct perms happen to be granted,
    // then the requests link is present.
    if (stripes.hasPerm('ui-checkout.viewRequests,ui-requests.view')) {
      return (
        <Link
          data-test-open-requests-count
          to={openRequestsPath}
        >
          <FormattedNumber value={openRequestsCount} />
        </Link>
      );
    }

    return <FormattedNumber value={openRequestsCount} />;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources.openRequests, user.barcode]);

  const openLoansCount = <FormattedNumber value={get(resources.openLoansCount, ['records', '0', 'totalRecords'], 0)} />;
  const openLoansPath = `/users/${user.id}/loans/open`;
  const patronGroups = get(resources, ['patronGroups', 'records', 0, 'group'], '');
  const openAccounts = get(resources, ['openAccounts', 'records'], []);
  const openAccountsPath = `/users/view/${user.id}?layer=open-accounts&filters=pg.${patronGroups}`;
  const owedAmount = openAccounts.reduce((owed, { remaining }) => {
    return owed + parseFloat(remaining);
  }, 0);
  let openAccountsCount = <FormattedNumber value={parseFloat(owedAmount).toFixed(2)} />;

  // "ui-users.accounts" doesn’t make ui-checkout dependent on ui-users,
  // but if ui-users happens to be installed and the correct perms happen to be granted,
  // then the accounts link is present.
  if (owedAmount && stripes.hasPerm('ui-checkout.viewFeeFines,ui-users.accounts')) {
    openAccountsCount = <Link to={openAccountsPath}>{openAccountsCount}</Link>;
  }

  // "ui-users.loans.view" doesn’t make ui-checkout dependent on ui-users,
  // but if ui-users happens to be installed and the correct perms happen to be granted,
  // then the loan link is present.
  const openLoansLink = stripes.hasPerm('ui-checkout.viewLoans,ui-users.loans.view') ?
    <Link to={openLoansPath}><FormattedNumber value={openLoansCount} /></Link> : openLoansCount;

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
