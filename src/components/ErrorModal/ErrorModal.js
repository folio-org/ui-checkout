import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { noop } from 'lodash';

import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { stripesShape } from '@folio/stripes/core';
import {
  Button,
  Col,
  Modal,
  Row,
} from '@folio/stripes/components';

import {
  ITEM_NOT_LOANABLE,
  MAX_ITEM_BLOCK_LIMIT,
  OVERRIDABLE_ERROR_MESSAGES,
} from '../../constants';

function ErrorModal(props) {
  const {
    open,
    onClose,
    message,
    loanPolicy,
    openOverrideModal,
    stripes,
    item: {
      title,
      barcode,
      materialType: { name: materialType } = {},
    } = {},
  } = props;

  const handleOverrideClick = () => {
    onClose();
    openOverrideModal();
  };

  const canOverrideByBarcode = stripes.hasPerm('ui-checkout.overrideCheckOutByBarcode')
    && OVERRIDABLE_ERROR_MESSAGES.includes(message);

  // TODO: Replace with correct permission
  const canOverrideItemBlock = stripes.hasPerm('ui-checkout.overrideCheckOutByBarcode')
    && (message && message.includes(MAX_ITEM_BLOCK_LIMIT));
  const canBeOverridden = canOverrideByBarcode || canOverrideItemBlock;
  const isItemNotLoanable = message === ITEM_NOT_LOANABLE;

  return (
    <Modal
      onClose={onClose}
      data-test-error-modal
      open={open}
      size="small"
      label={<FormattedMessage id="ui-checkout.itemNotCheckedOut" />}
      dismissible
    >
      <p>
        {
          isItemNotLoanable
            ? (
              <SafeHTMLMessage
                id="ui-checkout.messages.itemIsNotLoanable"
                values={{ title, barcode, materialType, loanPolicy }}
              />
            )
            : message
        }
      </p>
      <Col xs={12}>
        <Row end="xs">
          {
          canBeOverridden &&
            <Button
              data-test-override-button
              onClick={handleOverrideClick}
            >
              <FormattedMessage id="ui-checkout.override" />
            </Button>
          }
          <Button
            data-test-close-button
            buttonStyle="primary"
            onClick={onClose}
          >
            <FormattedMessage id="ui-checkout.close" />
          </Button>
        </Row>
      </Col>
    </Modal>
  );
}

ErrorModal.propTypes = {
  item: PropTypes.object,
  open: PropTypes.bool.isRequired,
  stripes: stripesShape.isRequired,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  loanPolicy: PropTypes.string,
  openOverrideModal: PropTypes.func,
};

ErrorModal.defaultProps = {
  item: {},
  loanPolicy: '',
  openOverrideModal: noop,
};

export default ErrorModal;
