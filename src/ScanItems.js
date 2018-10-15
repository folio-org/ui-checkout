import React from 'react';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { SubmissionError, change, stopSubmit, setSubmitFailed } from 'redux-form';
import { Icon } from '@folio/stripes/components';
import ReactAudioPlayer from 'react-audio-player';

import ItemForm from './components/ItemForm';
import ViewItem from './components/ViewItem';

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
  });

  static propTypes = {
    stripes: PropTypes.object.isRequired,
    translate: PropTypes.func.isRequired,
    mutator: PropTypes.shape({
      loanPolicies: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      checkout: PropTypes.shape({
        POST: PropTypes.func,
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
  };

  static defaultProps = {
    settings: {},
  };

  constructor(props) {
    super(props);
    this.store = props.stripes.store;
    this.checkout = this.checkout.bind(this);
    this.onFinishedPlaying = this.onFinishedPlaying.bind(this);
    this.state = { loading: false, checkoutStatus: null };
    this.itemInput = React.createRef();
  }

  checkout(data) {
    const { translate } = this.props;

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

    const loanData = {
      itemBarcode: data.item.barcode,
      userBarcode: this.props.patron.barcode,
      loanDate: moment().utc().format(),
    };

    return this.props.mutator.checkout.POST(loanData)
      .then(loan => this.fetchLoanPolicy(loan))
      .then(loan => this.addScannedItem(loan))
      .then(() => {
        this.setState({ checkoutStatus: 'success' });
        this.clearField('itemForm', 'item.barcode');
      })
      .catch(resp => {
        this.setState({ checkoutStatus: 'error' });
        const contentType = resp.headers.get('Content-Type');
        if (contentType && contentType.startsWith('application/json')) {
          return resp.json().then(error => {
            this.handleErrors(error);
          });
        } else {
          return resp.text().then(error => {
            alert(error); // eslint-disable-line no-alert
          });
        }
      })
      .finally(() => this.setState({ loading: false }));
  }

  handleErrors(error) {
    const { parameters, message } = ((error.errors || [])[0] || {});
    const itemError = (!parameters || !parameters.length) ?
      { barcode: this.translate('unknownError'), _error: 'unknownError' } :
      { barcode: message, _error: parameters[0].key };

    throw new SubmissionError({ item: itemError });
  }

  addScannedItem(loan) {
    const scannedItems = [loan].concat(this.props.parentResources.scannedItems);
    return this.props.parentMutator.scannedItems.replace(scannedItems);
  }

  fetchLoanPolicy(loan) {
    const query = `(id=="${loan.loanPolicyId}")`;
    this.props.mutator.loanPolicies.reset();
    return this.props.mutator.loanPolicies.GET({ params: { query } }).then((policies) => {
      const loanPolicy = policies.find(p => p.id === loan.loanPolicyId);
      loan.loanPolicy = loanPolicy;
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
    const { parentResources, onSessionEnd, patron, settings, translate } = this.props;
    const { checkoutStatus } = this.state;
    const scannedItems = parentResources.scannedItems || [];
    const scannedTotal = scannedItems.length;
    const checkoutSound = (checkoutStatus === 'success') ? checkoutSuccessSound : checkoutErrorSound;

    return (
      <div>
        <ItemForm
          ref={this.itemInput}
          onSubmit={this.checkout}
          patron={patron}
          total={scannedTotal}
          onSessionEnd={onSessionEnd}
          translate={translate}
        />
        {this.state.loading && <Icon icon="spinner-ellipsis" width="10px" />}
        <ViewItem stripes={this.props.stripes} scannedItems={scannedItems} patron={patron} translate={translate} {...this.props} />
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
