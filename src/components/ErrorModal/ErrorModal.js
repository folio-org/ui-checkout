import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  noop,
  map,
  split,
} from 'lodash';

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
  OVERRIDABLE_ERROR_MESSAGES,
} from '../../constants';
import { getAllErrorMessages } from '../../util';

function ErrorModal(props) {
  const {
    open,
    onClose,
    errors,
    loanPolicy,
    openOverrideModal,
    stripes,
    item: {
      title,
      barcode,
      materialType: { name: materialType } = {},
    } = {},
  } = props;
// TODO: Remove all staff related to item
  console.log('errors in ErrorModal ', errors);
  const allErrors = getAllErrorMessages(errors);
  const messages = split(allErrors, ';');
  const handleOverrideClick = () => {
    onClose();
    openOverrideModal();
  };

  const canBeOverridden = stripes.hasPerm('ui-checkout.overrideCheckOutByBarcode')
    && OVERRIDABLE_ERROR_MESSAGES.includes(messages);
  const isItemNotLoanable = messages.includes(ITEM_NOT_LOANABLE);

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
            : map(messages, (message) => <div>{message}</div>)
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
  errors: PropTypes.array.isRequired,
  loanPolicy: PropTypes.string,
  openOverrideModal: PropTypes.func,
};

ErrorModal.defaultProps = {
  item: {},
  loanPolicy: '',
  openOverrideModal: noop,
};

export default ErrorModal;
