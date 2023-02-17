import { uniqueId } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Modal,
  Button,
  MultiColumnList,
  ModalFooter,
} from '@folio/stripes/components';

import css from './CheckoutNoteModal.css';

const propTypes = {
  cancelLabel: PropTypes.node,
  confirmLabel: PropTypes.node,
  columnMapping: PropTypes.object,
  columnWidths: PropTypes.object,
  formatter: PropTypes.object,
  heading: PropTypes.node.isRequired,
  hideCancel: PropTypes.bool,
  hideConfirm: PropTypes.bool,
  id: PropTypes.string,
  message: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  notes: PropTypes.arrayOf(PropTypes.object),
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  visibleColumns: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  hideConfirm: false,
  hideCancel: false,
};

const CheckoutNoteModal = ({
  notes,
  formatter,
  columnMapping,
  visibleColumns,
  columnWidths,
  hideConfirm,
  hideCancel,
  cancelLabel,
  confirmLabel,
  id,
  onConfirm,
  onCancel,
  open,
  heading,
  message,
}) => {
  const cancelButtonLabel = cancelLabel || <FormattedMessage id="ui-checkout.multipieceModal.cancel" />;
  const confirmButtonLabel = confirmLabel || <FormattedMessage id="ui-checkout.multipieceModal.confirm" />;
  const testId = id || uniqueId('confirmation-');
  const footer = (
    <ModalFooter>
      {
        !hideConfirm &&
        <Button
          data-test-checkoutnotemodal-confirm-button
          data-testid="confirmButton"
          buttonStyle="primary"
          id={`clickable-${testId}-confirm`}
          onClick={onConfirm}
        >
          {confirmButtonLabel}
        </Button>
      }
      {
        !hideCancel &&
        <Button
          data-test-checkoutnotemodal-cancel-button
          data-testid="cancelButton"
          buttonStyle="default"
          id={`clickable-${testId}-cancel`}
          onClick={onCancel}
        >
          {cancelButtonLabel}
        </Button>
      }

    </ModalFooter>
  );

  return (
    <Modal
      data-testid="checkoutNoteModal"
      open={open}
      id={testId}
      dismissible
      label={heading}
      size="small"
      footer={footer}
      onClose={onCancel}
    >
      <p>{message}</p>
      <div className={css.root}>
        <MultiColumnList
          visibleColumns={visibleColumns}
          contentData={notes}
          fullWidth
          formatter={formatter}
          columnMapping={columnMapping}
          columnWidths={columnWidths}
        />
      </div>
    </Modal>
  );
};

CheckoutNoteModal.propTypes = propTypes;
CheckoutNoteModal.defaultProps = defaultProps;

export default CheckoutNoteModal;
