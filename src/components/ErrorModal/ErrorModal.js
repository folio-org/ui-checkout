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

import { OVERRIDABLE_ERROR_MESSAGES } from '../../constants';


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

  const canBeOverridden = stripes.hasPerm('ui-checkout.overrideCheckOutByBarcode')
    && OVERRIDABLE_ERROR_MESSAGES.includes(message);

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
        <SafeHTMLMessage
          id="ui-checkout.messages.itemIsNotLoanable"
          values={{ title, barcode, materialType, loanPolicy }}
        />
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
  loanPolicy: PropTypes.string.isRequired,
  openOverrideModal: PropTypes.func,
};

ErrorModal.defaultProps = {
  item: {},
  openOverrideModal: noop,
};

export default ErrorModal;
