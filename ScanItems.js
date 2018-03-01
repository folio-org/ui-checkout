import React from 'react';
import PropTypes from 'prop-types';
import dateFormat from 'dateformat';
import uuid from 'uuid';
import { SubmissionError, change, stopSubmit, setSubmitFailed } from 'redux-form';
import Icon from '@folio/stripes-components/lib/Icon';

import ItemForm from './lib/ItemForm';
import ViewItem from './lib/ViewItem';
import { toParams, getFixedDueDateSchedule } from './util';

class ScanItems extends React.Component {
  static propTypes = {
    stripes: PropTypes.object.isRequired,
    mutator: PropTypes.shape({
      items: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      loanPolicies: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      fixedDueDateSchedules: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      loanRules: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      loans: PropTypes.shape({
        GET: PropTypes.func,
        POST: PropTypes.func,
      }),
      scannedItems: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }),
    parentResources: PropTypes.shape({
      scannedItems: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
        }),
      ),
    }),
    parentMutator: PropTypes.shape({
      scannedItems: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }),
    patron: PropTypes.object,
    proxy: PropTypes.object,
    onSessionEnd: PropTypes.func.isRequired,
  };

  static manifest = Object.freeze({
    items: {
      type: 'okapi',
      records: 'items',
      path: 'inventory/items',
      accumulate: 'true',
      fetch: false,
    },
    loans: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans',
      accumulate: 'true',
      fetch: false,
    },
    loanPolicies: {
      type: 'okapi',
      records: 'loanPolicies',
      path: 'loan-policy-storage/loan-policies',
      accumulate: 'true',
      fetch: false,
    },
    fixedDueDateSchedules: {
      type: 'okapi',
      records: 'fixedDueDateSchedules',
      path: 'fixed-due-date-schedule-storage/fixed-due-date-schedules',
      accumulate: 'true',
      fetch: false,
    },
    loanRules: {
      type: 'okapi',
      path: 'circulation/loan-rules/apply',
      accumulate: 'true',
      fetch: false,
    },
  });

  constructor(props) {
    super(props);
    this.store = props.stripes.store;
    this.checkout = this.checkout.bind(this);
    this.state = { loading: false };
  }

  checkout(data) {
    if (!data.item) {
      throw new SubmissionError({ item: { barcode: 'Please fill this out to continue' } });
    }

    if (!this.props.patron) {
      return this.dispatchError('patronForm', 'patron.identifier', { patron: { identifier: 'Please fill this out to continue' } });
    }

    this.setState({ loading: true });
    this.clearError('itemForm');

    return this.fetchItemByBarcode(data.item.barcode)
      .then(item => this.checkForLoan(item))
      .then(item => this.validateLoanPolicy(item))
      .then(item => this.postLoan(item))
      .then(loan => this.addScannedItem(loan))
      .then(() => this.clearField('itemForm', 'item.barcode'))
      .finally(() => this.setState({ loading: false }));
  }

  validateLoanPolicy(data) {
    return this.fetchLoanPolicyId(data)
      .then(item => this.fetchLoanPolicy(item))
      .then(item => this.fetchFixedDueDateSchedules(item))
      .then((item) => {
        this.validateFixedDueSchedule(item);
        return item;
      });
  }

  // eslint-disable-next-line class-methods-use-this
  validateFixedDueSchedule(item) {
    const { loanPolicy } = item;
    if (loanPolicy && loanPolicy.fixedDueDateSchedule) {
      const schedule = getFixedDueDateSchedule(loanPolicy.fixedDueDateSchedule.schedules);

      if (!schedule) {
        throw new SubmissionError({
          item: {
            barcode: `Item can't be checked out as the loan date falls outside
             of the date ranges in the loan policy.
             Please review ${item.loanPolicy.name} before retrying checking out.`,
            _error: 'Invalid schedule',
          },
        });
      }

      loanPolicy.fixedDueDateSchedule.schedule = schedule;
    }
  }

  addScannedItem(loan) {
    const scannedItems = [loan].concat(this.props.parentResources.scannedItems);
    return this.props.parentMutator.scannedItems.replace(scannedItems);
  }

  fetchItemByBarcode(barcode) {
    const query = `(barcode="${barcode}")`;
    this.props.mutator.items.reset();
    return this.props.mutator.items.GET({ params: { query } }).then((items) => {
      if (!items.length) {
        throw new SubmissionError({ item: { barcode: 'Item with this barcode does not exist', _error: 'Scan failed' } });
      }
      return items[0];
    });
  }

  // Before trying to create a new loan, check to see if one exists for the
  // requested item. If so, this function will generate an error that results
  // in a validation error message appearing beneath the barcode input field.
  // If no loan is found, the items array is returned as a pass-through value.
  checkForLoan(item) {
    const itemId = item.id;
    const query = `(itemId="${itemId}" and status.name<>"Closed")`;

    return this.props.mutator.loans.GET({ params: { query } }).then((loans) => {
      if (loans.length) {
        throw new SubmissionError({ item: { barcode: 'Item is not available for checkout', _error: 'Item is checked out' } });
      }
      return item;
    });
  }

  fetchLoanPolicyId(item) {
    const { materialType, permanentLoanType, permanentLocation } = item;
    const { patron } = this.props;
    const params = toParams({
      shelving_location_id: permanentLocation.id,
      item_type_id: materialType.id,
      loan_type_id: permanentLoanType.id,
      patron_type_id: patron.patronGroup,
    });

    this.props.mutator.loanRules.reset();
    return this.props.mutator.loanRules.GET({ params }).then((rule) => {
      item.loanPolicyId = rule.loanPolicyId;
      return item;
    });
  }

  fetchLoanPolicy(item) {
    const query = `(id=="${item.loanPolicyId}")`;
    this.props.mutator.loanPolicies.reset();
    return this.props.mutator.loanPolicies.GET({ params: { query } }).then((policies) => {
      const loanPolicy = policies.find(p => p.id === item.loanPolicyId);
      item.loanPolicy = loanPolicy;
      return item;
    });
  }

  fetchFixedDueDateSchedules(item) {
    if (!item || !item.loanPolicy || !item.loanPolicy.loansPolicy.fixedDueDateSchedule) {
      return item;
    }

    const query = `(id=="${item.loanPolicy.loansPolicy.fixedDueDateSchedule}")`;
    this.props.mutator.fixedDueDateSchedules.reset();
    return this.props.mutator.fixedDueDateSchedules.GET({ params: { query } }).then((fixedDueDateSchedules) => {
      item.loanPolicy.fixedDueDateSchedule = fixedDueDateSchedules[0];
      return item;
    });
  }

  postLoan(item) {
    const { patron, proxy } = this.props;
    const loanDate = new Date();
    const dueDate = new Date();
    const itemId = item.id;
    const userId = patron.id;

    dueDate.setDate(loanDate.getDate() + 14);

    const loanData = {
      id: uuid(),
      userId,
      itemId,
      loanDate: dateFormat(loanDate, "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      dueDate: dateFormat(dueDate, "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      action: 'checkedout',
      status: {
        name: 'Open',
      },
    };

    if (proxy && proxy.id !== userId) {
      loanData.proxyUserId = proxy.id;
    }

    return this.props.mutator.loans.POST(loanData).then((loan) => {
      loan.loanPolicy = item.loanPolicy;
      return loan;
    });
  }

  clearField(formName, fieldName) {
    this.store.dispatch(change(formName, fieldName, ''));
  }

  clearError(formName) {
    this.store.dispatch(stopSubmit(formName, {}));
  }

  dispatchError(formName, fieldName, errors) {
    this.store.dispatch(stopSubmit(formName, errors));
    this.store.dispatch(setSubmitFailed(formName, [fieldName]));
  }

  render() {
    const { parentResources, onSessionEnd, patron } = this.props;
    const scannedItems = parentResources.scannedItems || [];
    const scannedTotal = scannedItems.length;

    return (
      <div>
        <ItemForm onSubmit={this.checkout} patron={patron} total={scannedTotal} onSessionEnd={onSessionEnd} />
        {this.state.loading && <Icon icon="spinner-ellipsis" width="10px" />}
        <ViewItem stripes={this.props.stripes} scannedItems={scannedItems} />
      </div>
    );
  }
}

export default ScanItems;
