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
import {
  getAllErrorMessages,
  extractErrorDetails,
} from '../../util';

function ErrorModal(props) {
  const {
    open,
    onClose,
    errors,
    openOverrideModal,
    stripes,
    item: {
      title,
      barcode,
      materialType: { name: materialType } = {},
    } = {},
  } = props;
  const allErrors = getAllErrorMessages(errors);
  const messages = split(allErrors, ';');

  const handleOverrideClick = () => {
    onClose();
    openOverrideModal();
  };

  const containsOverrideErrorMessage = messages.some((message) => {
    return OVERRIDABLE_ERROR_MESSAGES.includes(message);
  });

  const canBeOverridden = stripes.hasPerm('ui-checkout.overrideCheckOutByBarcode')
    && containsOverrideErrorMessage;

  const renderMessages = () => {
    return map(messages, (message, index) => {
      const key = `error-${index}`;
      if (message === ITEM_NOT_LOANABLE) {
        const errorDetails = extractErrorDetails(errors, ITEM_NOT_LOANABLE);

        return (
          <p data-test-error-item key={key}>
            <SafeHTMLMessage
              id="ui-checkout.messages.itemIsNotLoanable"
              values={{ title, barcode, materialType, loanPolicy: errorDetails?.parameters[0]?.value }}
            />
          </p>
        );
      } else {
        return (<p data-test-error-item key={key}>{message}</p>);
      }
    });
  };

  return (
    <Modal
      onClose={onClose}
      data-test-error-modal
      open={open}
      size="small"
      label={<FormattedMessage id="ui-checkout.itemNotCheckedOut" />}
      dismissible
    >
      {renderMessages()}
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
  errors: PropTypes.arrayOf(
    PropTypes.object
  ).isRequired,
  openOverrideModal: PropTypes.func,
};

ErrorModal.defaultProps = {
  item: {},
  openOverrideModal: noop,
};

export default ErrorModal;
