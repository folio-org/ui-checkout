import React from 'react';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import uuid from 'uuid';
import { SubmissionError, change, stopSubmit, setSubmitFailed } from 'redux-form';
import Icon from '@folio/stripes-components/lib/Icon';
import ReactAudioPlayer from 'react-audio-player';

import ItemForm from './lib/ItemForm';
import ViewItem from './lib/ViewItem';
import { calculateDueDate, isLoanProfileFixed, getFixedDueDateSchedule } from './loanUtil';
import { errorTypes } from './constants';

import checkoutSuccessSound from './sound/checkout_success.m4a';
import checkoutErrorSound from './sound/checkout_error.m4a';

class ScanItems extends React.Component {
  static contextTypes = {
    translate: PropTypes.func,
  };

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
      requests: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
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
    settings: PropTypes.object,
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
    requests: {
      type: 'okapi',
      records: 'requests',
      path: 'request-storage/requests',
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
    this.onFinishedPlaying = this.onFinishedPlaying.bind(this);
    this.state = { loading: false, checkoutStatus: null };
  }

  checkout(data) {
    const { translate } = this.context;

    if (!data.item) {
      throw new SubmissionError({
        item: {
          barcode: translate('missingDataError'),
        },
      });
    }

    if (!this.props.patron) {
      return this.dispatchError('patronForm', 'patron.identifier', {
        patron: {
          identifier: translate('missingDataError'),
        },
      });
    }

    this.setState({ loading: true });
    this.clearError('itemForm');

    return this.fetchItemByBarcode(data.item.barcode)
      .then(item => this.checkForLoan(item))
      .then(item => this.checkForRequest(item))
      .then(item => this.validateLoanPolicy(item))
      .then(item => this.postLoan(item))
      .then(loan => this.addScannedItem(loan))
      .then(() => this.clearField('itemForm', 'item.barcode'))
      .catch((error) => {
        this.setState({ checkoutStatus: 'error' });
        throw error;
      })
      .finally(() => this.setState({ loading: false }));
  }

  validateLoanPolicy(data) {
    return this.fetchLoanPolicyId(data)
      .then(item => this.fetchLoanPolicy(item))
      .then(item => this.fetchFixedDueDateSchedules(item))
      .then((item) => {
        this.validateLoan(item);
        return item;
      });
  }

  validateLoan(item) {
    const { loanPolicy } = item;
    const loanProfile = loanPolicy.loansPolicy || {};

    if (isLoanProfileFixed(loanProfile)) {
      this.validateFixedDueSchedule(item);
    }

    return item;
  }

  // eslint-disable-next-line class-methods-use-this
  validateFixedDueSchedule(item) {
    const { loanPolicy } = item;
    if (loanPolicy && loanPolicy.fixedDueDateSchedule) {
      const schedule = getFixedDueDateSchedule(loanPolicy.fixedDueDateSchedule.schedules);

      if (!schedule) {
        throw new SubmissionError({
          item: {
            barcode: this.context.translate('checkoutDateRangeError', { name: item.loanPolicy.name }),
            _error: errorTypes.INVALID_SCHEDULE,
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
        throw new SubmissionError({
          item: {
            barcode: this.context.translate('itemNotFoundError'),
            _error: errorTypes.INVALID_ITEM,
          },
        });
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
        throw new SubmissionError({
          item: {
            barcode: this.context.translate('itemNotAvailableError'),
            _error: errorTypes.ITEM_CHECKED_OUT,
          },
        });
      }
      return item;
    });
  }

  checkForRequest(item) {
    const itemId = item.id;
    const query = `(itemId="${itemId}")`;

    return this.props.mutator.requests.GET({ params: { query } }).then((requests) => {
      if (requests.length) {
        throw new SubmissionError({
          item: {
            barcode: this.context.translate('itemNotAvailableError'),
            _error: errorTypes.ITEM_CHECKED_OUT,
          },
        });
      }

      return item;
    });
  }

  fetchLoanPolicyId(item) {
    const { materialType, permanentLoanType, permanentLocation } = item;
    const { patron } = this.props;
    const params = {
      shelving_location_id: permanentLocation.id,
      item_type_id: materialType.id,
      loan_type_id: permanentLoanType.id,
      patron_type_id: patron.patronGroup,
    };

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
    const itemId = item.id;
    const userId = patron.id;

    const loanData = {
      id: uuid(),
      userId,
      itemId,
      loanDate: moment().utc().format(),
      dueDate: calculateDueDate(item).utc().format(),
      action: 'checkedout',
      status: {
        name: 'Open',
      },
    };

    if (proxy && proxy.id !== userId) {
      loanData.proxyUserId = proxy.id;
    }

    this.setState({ checkoutStatus: 'success' });

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

  onFinishedPlaying() {
    this.setState({ checkoutStatus: null });
  }

  render() {
    const { parentResources, onSessionEnd, patron, settings } = this.props;
    const { checkoutStatus } = this.state;
    const scannedItems = parentResources.scannedItems || [];
    const scannedTotal = scannedItems.length;
    const checkoutSound = (checkoutStatus === 'success') ? checkoutSuccessSound : checkoutErrorSound;

    return (
      <div>
        <ItemForm onSubmit={this.checkout} patron={patron} total={scannedTotal} onSessionEnd={onSessionEnd} />
        {this.state.loading && <Icon icon="spinner-ellipsis" width="10px" />}
        <ViewItem stripes={this.props.stripes} scannedItems={scannedItems} />
        {settings.audioAlertsEnabled && checkoutStatus &&
        <ReactAudioPlayer
          src={checkoutSound}
          autoPlay
          onEnded={this.onFinishedPlaying}
        />}
      </div>
    );
  }
}

export default ScanItems;
