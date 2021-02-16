import React from 'react';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import {
  get,
  lowerFirst,
  upperFirst,
} from 'lodash';

import {
  ConfirmationModal,
  FormattedDate,
  FormattedTime,
} from '@folio/stripes/components';

import CheckoutNoteModal from './components/CheckoutNoteModal';
import MultipieceModal from './components/MultipieceModal';
import {
  statuses,
  statusMessages,
} from './constants';
import { shouldStatusModalBeShown } from './util';

class ModalManager extends React.Component {
  static propTypes = {
    intl: PropTypes.object,
    checkedoutItem: PropTypes.object.isRequired,
    checkoutNotesMode: PropTypes.bool,
    onDone: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    // Props: checkoutNotesMode is set in ScanItems (showCheckoutNotes())
    // as a result of the 'Show checkout notes' item menu option being selected
    // in ViewItem
    const { checkedoutItem, checkoutNotesMode } = props;
    // State vars: checkoutNotesMode simply reflects the prop of the same name.
    // showCheckoutNotesModal determines whether the checkout notes modal is shown --
    // which happens either when an item is first checked out
    // (see shouldCheckoutNoteModalBeShown) or if checkoutNotesMode is true
    // when component mounts.
    this.state = { checkedoutItem, checkoutNotesMode };
    this.steps = [
      {
        validate: () => shouldStatusModalBeShown(this.state.checkedoutItem),
        exec: () => this.setState({ showStatusModal: true }),
      },
      {
        validate: this.shouldCheckoutNoteModalBeShown,
        exec: () => this.setState({ showCheckoutNoteModal: true }),
      },
      {
        validate: this.shouldMultipieceModalBeShown,
        exec: () => this.setState({ showMultipieceModal: true }),
      }
    ];
  }

  componentDidMount() {
    if (this.state.checkoutNotesMode) {
      this.setState({ showCheckoutNoteModal: true });
    } else {
      this.execSteps(0);
    }
  }

  componentDidUpdate(prevProps) {
    // Handle post-checkout viewing of item checkout notes;
    // without this, notes can only be viewed once (when component mounts)
    if (this.props.checkoutNotesMode && prevProps.checkoutNotesMode !== this.props.checkoutNotesMode) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ checkoutNotesMode: true, showCheckoutNoteModal: true });
    }
  }

  execSteps(start) {
    for (let i = start; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (step.validate()) {
        return step.exec();
      }
    }

    return this.props.onDone();
  }

  shouldCheckoutNoteModalBeShown = () => {
    const { checkedoutItem } = this.state;
    return get(checkedoutItem, 'circulationNotes', [])
      .some(note => note.noteType === statuses.CHECK_OUT);
  }

  shouldMultipieceModalBeShown = () => {
    const { checkedoutItem } = this.state;
    const {
      numberOfPieces,
      numberOfMissingPieces,
      descriptionOfPieces,
      missingPieces,
    } = checkedoutItem;

    return (
      numberOfPieces > 1 ||
      descriptionOfPieces ||
      numberOfMissingPieces ||
      missingPieces
    );
  }

  confirmStatusModal = () => {
    this.setState({ showStatusModal: false }, () => this.execSteps(1));
  }

  confirmCheckoutNoteModal = () => {
    this.setState({ showCheckoutNoteModal: false }, () => this.execSteps(2));
  }

  confirmMultipieceModal = () => {
    this.setState({ showMultipieceModal: false }, () => this.props.onDone());
  }

  onCancel = () => {
    this.setState({
      showCheckoutNoteModal: false,
      checkoutNotesMode: false,
      showMultipieceModal: false,
      showStatusModal: false,
    });

    this.props.onCancel();
  }

  renderMultipieceModal() {
    const { checkedoutItem, showMultipieceModal } = this.state;

    return (
      <MultipieceModal
        open={showMultipieceModal}
        item={checkedoutItem}
        onConfirm={this.confirmMultipieceModal}
        onClose={this.onCancel}
      />
    );
  }

  renderCheckoutNoteModal() {
    const {
      checkedoutItem,
      showCheckoutNoteModal,
      checkoutNotesMode,
    } = this.state;
    const { title, barcode } = checkedoutItem;
    const checkoutNotesArray = get(checkedoutItem, 'circulationNotes', [])
      .filter(noteObject => noteObject.noteType === 'Check out')
      .sort((prev, next) => new Date(next.date) - new Date(prev.date));

    const notes = checkoutNotesArray.map(checkoutNoteObject => {
      const {
        note,
        date,
        source: {
          personal: {
            firstName,
            lastName,
          },
        },
      } = checkoutNoteObject;

      return {
        note,
        date,
        source: `${lastName}, ${firstName}`,
      };
    });

    const formatter = {
      date: checkoutItem => (
        <div data-test-check-out-date>
          <FormattedDate value={checkoutItem.date} />
          <br />
          <FormattedTime value={checkoutItem.date} />
        </div>
      ),
      note: checkoutItem => <div data-test-check-out-note-message>{checkoutItem.note}</div>,
      source: checkoutItem => <div data-test-check-in-note-source>{checkoutItem.source}</div>,
    };
    const columnMapping = {
      date: <FormattedMessage id="ui-checkout.date" />,
      note: <FormattedMessage id="ui-checkout.note" />,
      source: <FormattedMessage id="ui-checkout.source" />,
    };
    const visibleColumns = ['date', 'note', 'source'];
    const columnWidths = {
      date: '30%',
      note : '40%',
      source: '30%',
    };
    const id = checkoutNotesMode ?
      'ui-checkout.checkoutNotes.message' :
      'ui-checkout.checkoutNoteModal.message';
    const heading = checkoutNotesMode ?
      <FormattedMessage id="ui-checkout.checkoutNotes.heading" /> :
      <FormattedMessage id="ui-checkout.checkoutNoteModal.heading" />;
    const cancelLabel = checkoutNotesMode ?
      <FormattedMessage id="ui-checkout.close" /> :
      <FormattedMessage id="ui-checkout.multipieceModal.cancel" />;

    const message = (
      <SafeHTMLMessage
        id={id}
        values={{
          title,
          barcode,
          materialType: upperFirst(get(checkedoutItem, 'materialType.name', '')),
          count: notes.length
        }}
      />
    );

    return (
      <CheckoutNoteModal
        data-test-checkout-note-modal
        open={showCheckoutNoteModal}
        heading={heading}
        onConfirm={this.confirmCheckoutNoteModal}
        onCancel={this.onCancel}
        hideConfirm={checkoutNotesMode}
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

  // This modal handles confirmation (check out? Don't check out?)
  // for various special item statuses, e.g. Missing, Withdrawn.
  renderConfirmStatusModal() {
    const { intl: { formatMessage } } = this.props;
    const {
      checkedoutItem,
      showStatusModal,
    } = this.state;

    const {
      barcode,
      title,
      materialType,
      status: { name },
    } = checkedoutItem;

    const status = formatMessage({ id: statusMessages[name] });

    const values = {
      title,
      barcode,
      materialType: upperFirst(materialType?.name ?? ''),
      status,
    };
    const messageId = checkedoutItem.discoverySuppress ?
      'ui-checkout.confirmStatusModal.suppressedMessage' :
      'ui-checkout.confirmStatusModal.notSuppressedMessage';

    const heading = (
      <FormattedMessage
        id="ui-checkout.confirmStatusModal.heading"
        values={{ status: lowerFirst(status) }}
      />);

    return (
      <ConfirmationModal
        id="test-confirm-status-modal"
        open={showStatusModal}
        item={checkedoutItem}
        heading={heading}
        message={<SafeHTMLMessage
          id={messageId}
          values={values}
        />}
        onConfirm={this.confirmStatusModal}
        onCancel={this.onCancel}
        confirmLabel={<FormattedMessage id="ui-checkout.confirm" />}
      />
    );
  }

  render() {
    const {
      showCheckoutNoteModal,
      showMultipieceModal,
      showStatusModal,
    } = this.state;

    return (
      <>
        {showStatusModal && this.renderConfirmStatusModal()}
        {showCheckoutNoteModal && this.renderCheckoutNoteModal()}
        {showMultipieceModal && this.renderMultipieceModal()}
      </>
    );
  }
}

export default injectIntl(ModalManager);
