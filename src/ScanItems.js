import { get } from 'lodash';
import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { SubmissionError, change, stopSubmit, setSubmitFailed } from 'redux-form';
import ReactAudioPlayer from 'react-audio-player';
import { FormattedMessage } from 'react-intl';

import { Icon } from '@folio/stripes/components';

import ItemForm from './components/ItemForm';
import ViewItem from './components/ViewItem';
import ModalManager from './ModalManager';

import checkoutSuccessSound from '../sound/checkout_success.m4a';
import checkoutErrorSound from '../sound/checkout_error.m4a';

class ScanItems extends React.Component {
  static manifest = Object.freeze({
    loanPolicies: {
      type: 'okapi',
      records: 'loanPolicies',
      path: 'loan-policy-storage/loan-policies',
      accumulate: 'true',
      fetch: false,
    },
    checkout: {
      type: 'okapi',
      path: 'circulation/check-out-by-barcode',
      fetch: false,
      throwErrors: false,
    },
    overrideCheckout: {
      type: 'okapi',
      path: 'circulation/override-check-out-by-barcode',
      fetch: false,
      throwErrors: false,
    },
    items: {
      type: 'okapi',
      path: 'inventory/items',
      records: 'items',
      accumulate: 'true',
      fetch: false,
    },
  });

  static propTypes = {
    stripes: PropTypes.object.isRequired,
    shouldSubmitAutomatically: PropTypes.bool.isRequired,
    resources: PropTypes.shape({
      items: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      loanPolicies: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      checkout: PropTypes.shape({
        POST: PropTypes.func,
      }),
      overrideCheckout: PropTypes.shape({
        POST: PropTypes.func,
      }),
      items: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
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
    onSessionEnd: PropTypes.func.isRequired,
    settings: PropTypes.object,
    openBlockedModal: PropTypes.func,
    patronBlocks: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    settings: {},
  };

  constructor(props) {
    super(props);
    this.store = props.stripes.store;
    this.state = {
      loading: false,
      checkoutStatus: null,
      item: null,
    };

    this.itemInput = React.createRef();
  }

  async fetchItem(barcode) {
    const { mutator } = this.props;
    const query = `barcode==${barcode}`;
    this.setState({ item: null });
    mutator.items.reset();
    const itemsResp = await mutator.items.GET({ params: { query } });

    return get(itemsResp, '[0]');
  }

  validate(barcode) {
    const {
      patron,
      patronBlocks,
      openBlockedModal
    } = this.props;

    if (!barcode) {
      throw new SubmissionError({
        item: {
          barcode: <FormattedMessage id="ui-checkout.missingDataError" />,
        },
      });
    }

    if (!patron) {
      this.dispatchError('patronForm', 'patron.identifier', {
        patron: {
          identifier: <FormattedMessage id="ui-checkout.missingDataError" />,
        },
      });

      throw new SubmissionError({});
    }

    if (patronBlocks.length > 0) {
      openBlockedModal();
      throw new SubmissionError({});
    }
  }

  tryCheckout = async (data) => {
    const barcode = get(data, 'item.barcode');
    this.validate(barcode);
    const item = await this.fetchItem(barcode);

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      if (!item) {
        this.checkout(barcode);
      } else {
        this.setState({ item });
      }
    });
  }

  showCheckoutNotes = (loan) => {
    const { item } = loan;
    this.setState({
      checkoutNotesMode: true,
      item
    });
  }

  successfulCheckout = () => {
    this.setState({ checkoutStatus: 'success', item: null });
    this.clearField('itemForm', 'item.barcode');
    this.resolve();
  };

  getRequestData(barcode) {
    const { stripes, patron } = this.props;
    const servicePointId = get(stripes, 'user.user.curServicePoint.id', '');

    return {
      itemBarcode: barcode.trim(),
      userBarcode: patron.barcode,
      servicePointId,
    };
  }

  checkout = (barcode) => {
    const { mutator: { checkout } } = this.props;
    const checkoutData = {
      ...this.getRequestData(barcode),
      loanDate: moment().utc().format(),
    };

    return this.performAction(checkout, checkoutData);
  }

  override = (data) => {
    const { mutator: { overrideCheckout } } = this.props;
    const { barcode, comment, dueDate } = data;
    const overrideData = {
      ...this.getRequestData(barcode),
      comment,
      dueDate,
    };

    return this.performAction(overrideCheckout, overrideData);
  }

  performAction(action, data) {
    this.setState({ loading: true });
    this.clearError('itemForm');

    return action.POST(data)
      .then(this.fetchLoanPolicy)
      .then(this.addScannedItem)
      .then(this.successfulCheckout)
      .catch(this.catchErrors)
      .finally(() => this.setState({ loading: false }));
  }

  catchErrors = (resp) => {
    this.setState({ checkoutStatus: 'error' });
    const contentType = resp.headers.get('Content-Type');
    if (contentType && contentType.startsWith('application/json')) {
      return resp.json().then(this.handleErrors);
    } else {
      this.reject();
      return resp.text().then(alert); // eslint-disable-line no-alert
    }
  }

  handleErrors = ({
    errors: [
      {
        parameters,
        message,
      } = {},
    ] = [],
  }) => {
    // TODO make error message internationalized
    // (https://github.com/folio-org/ui-checkout/pull/408#pullrequestreview-317759489)
    let itemError;

    if (!parameters) {
      itemError = {
        barcode: <FormattedMessage id="ui-checkout.unknownError" />,
        _error: 'unknownError',
      };
    } else if (parameters.length === 0) {
      itemError = {
        barcode: message,
        loanPolicy: ''
      };
    } else {
      itemError = {
        barcode: message,
        _error: parameters[0].key,
        loanPolicy: parameters[0].value,
      };
    }

    this.reject(new SubmissionError({ item: itemError }));
  }

  addScannedItem = (loan) => {
    const {
      parentResources,
      parentMutator,
    } = this.props;

    const { item } = this.state;
    loan.item.circulationNotes = (item || {}).circulationNotes || [];
    const scannedItems = [loan].concat(parentResources.scannedItems);

    return parentMutator.scannedItems.replace(scannedItems);
  };

  fetchLoanPolicy = async (loan) => {
    const {
      mutator: { loanPolicies },
    } = this.props;

    const query = `(id=="${loan.loanPolicyId}")`;

    loanPolicies.reset();

    const policies = await loanPolicies.GET({ params: { query } });
    loan.loanPolicy = policies.find(p => p.id === loan.loanPolicyId);

    return loan;
  };

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

  onFinishedPlaying = () => {
    this.setState({ checkoutStatus: null });
  }

  onCancel = () => {
    this.clearField('itemForm', 'item.barcode');
    this.reject(new SubmissionError({}));
  }

  onDone = () => {
    const barcode = get(this.state, 'item.barcode', '');
    this.checkout(barcode);
  }

  render() {
    const {
      parentResources,
      onSessionEnd,
      patron,
      settings: { audioAlertsEnabled },
      shouldSubmitAutomatically,
    } = this.props;

    const {
      checkoutStatus,
      loading,
      item,
      checkoutNotesMode
    } = this.state;

    const scannedItems = parentResources.scannedItems || [];
    const scannedTotal = scannedItems.length;
    const checkoutSound = (checkoutStatus === 'success')
      ? checkoutSuccessSound
      : checkoutErrorSound;

    return (
      <div data-test-scan-items>
        { /* manages pre checkout modals */}
        {item &&
          <ModalManager
            checkedoutItem={item}
            checkoutNotesMode={checkoutNotesMode}
            onDone={this.onDone}
            onCancel={this.onCancel}
          />
        }
        <ItemForm
          ref={this.itemInput}
          onSubmit={this.tryCheckout}
          onOverride={this.override}
          patron={patron}
          total={scannedTotal}
          onSessionEnd={onSessionEnd}
          item={item}
          shouldSubmitAutomatically={shouldSubmitAutomatically}
        />
        {loading &&
          <Icon
            icon="spinner-ellipsis"
            width="10px"
          />
        }
        <ViewItem
          scannedItems={scannedItems}
          loading={loading}
          showCheckoutNotes={this.showCheckoutNotes}
          {...this.props}
        />
        {audioAlertsEnabled && checkoutStatus &&
          <ReactAudioPlayer
            src={checkoutSound}
            autoPlay
            onEnded={this.onFinishedPlaying}
          />
        }
      </div>
    );
  }
}

export default ScanItems;
