import { get, upperFirst } from 'lodash';
import React from 'react';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { SubmissionError, change, stopSubmit, setSubmitFailed } from 'redux-form';
import { Icon } from '@folio/stripes/components';
import ReactAudioPlayer from 'react-audio-player';
import { FormattedMessage } from 'react-intl';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import ItemForm from './components/ItemForm';
import ViewItem from './components/ViewItem';
import MultipieceModal from './components/MultipieceModal';
import CheckoutNoteModal from './components/CheckoutNoteModal';

import { to } from './util';

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
    this.checkout = this.checkout.bind(this);
    this.tryCheckout = this.tryCheckout.bind(this);
    this.cancelCheckout = this.cancelCheckout.bind(this);
    this.confirmCheckoutNoteModal = this.confirmCheckoutNoteModal.bind(this);
    this.showCheckoutNotes = this.showCheckoutNotes.bind(this);
    this.hideCheckoutNoteModal = this.hideCheckoutNoteModal.bind(this);
    this.onFinishedPlaying = this.onFinishedPlaying.bind(this);
    this.state = {
      loading: false,
      checkoutStatus: null,
      item: {},
    };
    this.itemInput = React.createRef();
  }

  async modalsToDisplay(barcode) {
    const { mutator } = this.props;
    const query = `barcode==${barcode}`;
    this.setState({ item: null });
    mutator.items.reset();
    const [error, items] = await to(mutator.items.GET({ params: { query } }));

    if (error || !items || !items.length) return null;

    const item = items[0];
    const {
      numberOfPieces,
      descriptionOfPieces,
      numberOfMissingPieces,
      missingPieces,
    } = item;

    const multipieceItem = item;
    const isCheckOutNote = element => element.noteType === 'Check out';
    const showCheckoutNoteModal = get(item, ['circulationNotes'], []).some(isCheckOutNote);

    if ((!numberOfPieces || numberOfPieces <= 1) && !descriptionOfPieces && !numberOfMissingPieces && !missingPieces) {
      if (showCheckoutNoteModal) {
        return { item, showCheckoutNoteModal };
      } else {
        return { item };
      }
    }

    return { item, multipieceItem, showCheckoutNoteModal };
  }

  closeMultipieceModal() {
    this.setState({ multipieceItem: null });
  }

  async tryCheckout(data) {
    const {
      patron,
      patronBlocks,
      openBlockedModal
    } = this.props;

    if (!data.item) {
      throw new SubmissionError({
        item: {
          barcode: <FormattedMessage id="ui-checkout.missingDataError" />,
        },
      });
    }

    if (!patron) {
      return this.dispatchError('patronForm', 'patron.identifier', {
        patron: {
          identifier: <FormattedMessage id="ui-checkout.missingDataError" />,
        },
      });
    }

    if (patronBlocks.length > 0) {
      openBlockedModal();
      throw new SubmissionError({});
    }

    const modalsToDisplay = await this.modalsToDisplay(data.item.barcode);

    const { item, multipieceItem, showCheckoutNoteModal } = modalsToDisplay || {};

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      if (!multipieceItem) {
        if (!showCheckoutNoteModal) {
          this.checkout(data.item.barcode);
        }

        this.setState({ item, showCheckoutNoteModal });
      } else {
        this.setState({ item, multipieceItem, showCheckoutNoteModal });
      }
    });
  }

  cancelCheckout() {
    this.closeMultipieceModal();
    this.hideCheckoutNoteModal();
    this.clearField('itemForm', 'item.barcode');
    this.reject(new SubmissionError({}));
  }

  confirmCheckout(item) {
    this.closeMultipieceModal();
    this.hideCheckoutNoteModal();
    this.checkout(item.barcode);
  }

  confirmCheckoutNoteModal() {
    const { item } = this.state;
    this.setState({ showCheckoutNoteModal: false }, () => this.checkout(item.barcode));
  }

  hideCheckoutNoteModal() {
    this.setState({ showCheckoutNoteModal: false, showCheckoutNote: false }, () => this.reject(new SubmissionError({})));
  }

  showCheckoutNotes(loan) {
    const { item } = loan;
    this.setState({ showCheckoutNote: true, itemWithNotes: item });
  }

  checkout(barcode) {
    const {
      stripes,
      mutator,
      patron,
    } = this.props;

    this.setState({ loading: true });
    this.clearError('itemForm');

    const servicePointId = get(stripes, ['user', 'user', 'curServicePoint', 'id'], '');
    const loanData = {
      itemBarcode: barcode.trim(),
      userBarcode: patron.barcode,
      loanDate: moment().utc().format(),
      servicePointId,
    };

    mutator.checkout.POST(loanData)
      .then(loan => this.fetchLoanPolicy(loan))
      .then(loan => this.addScannedItem(loan))
      .then(() => {
        this.setState({ checkoutStatus: 'success' });
        this.clearField('itemForm', 'item.barcode');
        this.resolve();
      })
      .catch(resp => {
        this.setState({ checkoutStatus: 'error' });
        const contentType = resp.headers.get('Content-Type');
        if (contentType && contentType.startsWith('application/json')) {
          return resp.json().then(error => {
            this.handleErrors(error);
          });
        } else {
          this.reject();
          return resp.text().then(error => {
            alert(error); // eslint-disable-line no-alert
          });
        }
      })
      .finally(() => this.setState({ loading: false }));
  }

  handleErrors({
    errors: [
      {
        parameters,
        message,
      } = {},
    ] = [],
  }) {
    const itemError = (!parameters || !parameters.length)
      ? {
        barcode: <FormattedMessage id="ui-checkout.unknownError" />,
        _error: 'unknownError',
      }
      : {
        barcode: message,
        _error: parameters[0].key,
      };

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

  onFinishedPlaying() {
    this.setState({ checkoutStatus: null });
  }

  renderCheckoutNoteModal() {
    const { item, showCheckoutNoteModal, itemWithNotes, showCheckoutNote } = this.state;
    const notesItem = itemWithNotes || item;
    const { title, barcode } = notesItem;

    const checkoutNotesArray = get(notesItem, ['circulationNotes'], [])
      .filter(noteObject => noteObject.noteType === 'Check out');

    const notes = checkoutNotesArray.map(checkoutNoteObject => {
      const { note } = checkoutNoteObject;
      return { note };
    });
    const formatter = { note: itemObj => `${itemObj.note}` };
    const columnMapping = { note: <FormattedMessage id="ui-checkout.note" /> };
    const visibleColumns = ['note'];
    const columnWidths = { note : '100%' };


    const id = showCheckoutNote ? 'ui-checkout.checkoutNotes.message' : 'ui-checkout.checkoutNoteModal.message';
    const heading = showCheckoutNote ?
      <FormattedMessage id="ui-checkout.checkoutNotes.heading" /> :
      <FormattedMessage id="ui-checkout.checkoutNoteModal.heading" />;
    const cancelLabel = showCheckoutNote ?
      <FormattedMessage id="ui-checkout.close" /> :
      <FormattedMessage id="ui-checkout.multipieceModal.cancel" />;

    const message = (
      <SafeHTMLMessage
        id={id}
        values={{
          title,
          barcode,
          materialType: upperFirst(get(notesItem, ['materialType', 'name'], '')),
          count: notes.length
        }}
      />
    );

    return (
      <CheckoutNoteModal
        data-test-checkoutNote-modal
        open={showCheckoutNote || showCheckoutNoteModal}
        heading={heading}
        onConfirm={this.confirmCheckoutNoteModal}
        onCancel={this.hideCheckoutNoteModal}
        hideConfirm={showCheckoutNote}
        cancelLabel={cancelLabel}
        confirmLabel={<FormattedMessage id="ui-checkout.confirm" />}
        notes={notes}
        formatter={formatter}
        message={message}
        columnMapping={columnMapping}
        visibleColumns={visibleColumns}
        columnWidths={columnWidths}
      />
    );
  }

  onConfirm = item => this.confirmCheckout(item);

  render() {
    const {
      parentResources,
      onSessionEnd,
      patron,
      settings: { audioAlertsEnabled },
    } = this.props;

    const {
      checkoutStatus,
      loading,
      multipieceItem,
      showCheckoutNoteModal,
      item,
      showCheckoutNote
    } = this.state;

    const scannedItems = parentResources.scannedItems || [];
    const scannedTotal = scannedItems.length;
    const checkoutSound = (checkoutStatus === 'success')
      ? checkoutSuccessSound
      : checkoutErrorSound;

    return (
      <div>
        <ItemForm
          ref={this.itemInput}
          onSubmit={this.tryCheckout}
          patron={patron}
          total={scannedTotal}
          onSessionEnd={onSessionEnd}
          item={item}
          addScannedItem={this.addScannedItem}
        />
        {loading &&
          <Icon
            icon="spinner-ellipsis"
            width="10px"
          />
        }
        <ViewItem
          scannedItems={scannedItems}
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
        {(showCheckoutNote || showCheckoutNoteModal) && this.renderCheckoutNoteModal()}
        {multipieceItem &&
          <MultipieceModal
            open={!!multipieceItem}
            item={multipieceItem}
            onClose={this.cancelCheckout}
            onConfirm={this.onConfirm}
          />
        }
      </div>
    );
  }
}

export default ScanItems;
