import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import ReactAudioPlayer from 'react-audio-player';
import { FormattedMessage } from 'react-intl';
import { get, isEmpty } from 'lodash';

import { Icon } from '@folio/stripes/components';
import { escapeCqlValue } from '@folio/stripes/util';

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
    proxy: PropTypes.object,
    onSessionEnd: PropTypes.func.isRequired,
    settings: PropTypes.object,
    openBlockedModal: PropTypes.func,
    patronBlocks: PropTypes.arrayOf(PropTypes.object),
    formRef: PropTypes.object.isRequired,
    initialValues: PropTypes.object,
  };

  static defaultProps = {
    settings: {},
    initialValues: {},
  };

  constructor(props) {
    super(props);
    this.store = props.stripes.store;
    this.state = {
      loading: false,
      checkoutStatus: null,
      item: null,
      error: null,
    };
  }

  async fetchItem(barcode) {
    const { mutator } = this.props;
    const bcode = '"' + escapeCqlValue(barcode) + '"';
    const query = `barcode==${bcode}`;
    this.setState({ item: null });
    mutator.items.reset();
    const itemsResp = await mutator.items.GET({ params: { query } });

    return get(itemsResp, '[0]');
  }

  // https://github.com/final-form/react-final-form/blob/master/docs/faq.md#how-can-i-trigger-a-submit-from-outside-my-form
  triggerPatronFormSubmit = () => {
    const submitEvent = new Event('submit', { cancelable: true });
    const form = document.querySelector('#patron-form');
    form.dispatchEvent(submitEvent);
  };

  validate(barcode) {
    const {
      patron,
      patronBlocks,
      openBlockedModal
    } = this.props;

    if (!barcode) {
      return {
        item: {
          barcode: <FormattedMessage id="ui-checkout.missingDataError" />
        }
      };
    }

    if (!patron) {
      this.triggerPatronFormSubmit();
      return {
        patron: {
          identifier: <FormattedMessage id="ui-checkout.missingDataError" />
        }
      };
    }

    if (patronBlocks.length > 0) {
      openBlockedModal();
      return {
        patron: {
          blocked: <FormattedMessage id="ui-checkout.blockModal" />
        }
      };
    }

    return {};
  }

  tryCheckout = async (data) => {
    const barcode = get(data, 'item.barcode');
    const error = this.validate(barcode);

    if (!isEmpty(error)) {
      this.setState({ error });
      return;
    }

    const item = await this.fetchItem(barcode);

    if (!item) {
      this.checkout(barcode);
    } else {
      this.setState({ item });
    }
  }

  // Called from ViewItem when the 'show checkout notes' item
  // menu option is clicked. This is distinct from whether notes
  // should be shown as part of the checkout workflow (which is
  // determined in ModalManager.)
  showCheckoutNotes = (loan) => {
    const { item } = loan;
    this.setState({
      checkoutNotesMode: true,
      item
    });
  }

  successfulCheckout = () => {
    this.setState({ checkoutStatus: 'success', item: null });
  };

  getRequestData(barcode) {
    const { stripes, patron, proxy } = this.props;
    const servicePointId = get(stripes, 'user.user.curServicePoint.id', '');
    const data = {
      itemBarcode: barcode.trim(),
      userBarcode: patron.barcode,
      servicePointId,
    };
    if (proxy?.barcode) {
      data.proxyUserBarcode = proxy.barcode;
    }
    return data;
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
    this.setState({ loading: true, error: null });
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

    this.setState({ error: { item: itemError } });
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

  clearField(fieldName) {
    this.props.formRef.current.change(fieldName, '');
  }

  onFinishedPlaying = () => {
    this.setState({ checkoutStatus: null });
  }

  onClearCheckoutErrors = () => {
    this.setState({ error: null });
  }

  onCancel = () => {
    // if checkoutNotesMode == true, then this is a post-checkout,
    // user-triggered review of the notes modal. We shouldn't try
    // to clear the form or deal with errors in this case -- only
    // when the mode is false, meaning that notes were shown as
    // part of the item checkout workflow.
    if (!this.state.checkoutNotesMode) {
      this.clearField('item.barcode');
    }
    this.setState({ checkoutNotesMode: false });
  }

  onDone = async () => {
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
      formRef,
      initialValues,
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
          />}
        <ItemForm
          formRef={formRef}
          onSubmit={this.tryCheckout}
          onOverride={this.override}
          patron={patron}
          total={scannedTotal}
          onSessionEnd={onSessionEnd}
          item={item}
          shouldSubmitAutomatically={shouldSubmitAutomatically}
          checkoutError={this.state.error}
          onClearCheckoutErrors={this.onClearCheckoutErrors}
          initialValues={initialValues}
        />
        {loading &&
          <Icon
            icon="spinner-ellipsis"
            width="10px"
          />}
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
          />}
      </div>
    );
  }
}

export default ScanItems;
