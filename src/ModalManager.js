import { get, upperFirst } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  FormattedMessage,
  FormattedDate,
  FormattedTime,
  injectIntl,
} from 'react-intl';

import CheckoutNoteModal from './components/CheckoutNoteModal';
import MultipieceModal from './components/MultipieceModal';
import { statuses } from './constants';

class ModalManager extends React.Component {
  static propTypes = {
    checkedoutItem: PropTypes.object.isRequired,
    checkoutNotesMode: PropTypes.bool,
    onDone: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    const { checkedoutItem, checkoutNotesMode } = props;
    this.state = { checkedoutItem, checkoutNotesMode };
    this.steps = [
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

  confirmMultipieceModal = () => {
    this.setState({ showMultipieceModal: false }, () => this.props.onDone());
  }

  confirmCheckoutNoteModal = () => {
    this.setState({ showCheckoutNoteModal: false }, () => this.execSteps(1));
  }

  onCancel = () => {
    this.setState({
      showCheckoutNoteModal: false,
      checkoutNotesMode: false,
      showMultipieceModal: false,
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

  render() {
    const {
      showCheckoutNoteModal,
      showMultipieceModal,
    } = this.state;

    return (
      <React.Fragment>
        {showCheckoutNoteModal && this.renderCheckoutNoteModal()}
        {showMultipieceModal && this.renderMultipieceModal()}
      </React.Fragment>
    );
  }
}

export default injectIntl(ModalManager);
