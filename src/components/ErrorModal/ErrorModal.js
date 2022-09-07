import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { noop } from 'lodash';

import { stripesShape } from '@folio/stripes/core';
import {
  Button,
  Col,
  Modal,
  Row,
} from '@folio/stripes/components';

import {
  BACKEND_ERROR_CODES,
  OVERRIDABLE_BACKEND_ERROR_CODES,
  ERROR_MESSAGE_TRANSLATION_ID_BY_BACKEND_ERROR_CODE,
  BACKEND_ERRORS_CODES_TO_HIDE,
} from '../../constants';

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
  const handleOverrideClick = () => {
    onClose();
    openOverrideModal();
  };

  const errorsToDisplay = [];
  const ITEM_LIMIT_KEY = 'itemLimit';
  let containsOverrideErrorMessage = false;

  errors.forEach((error, index) => {
    const {
      code,
      message,
      parameters,
    } = error;
    let messageToDisplay;

    if (code) {
      if (!containsOverrideErrorMessage && OVERRIDABLE_BACKEND_ERROR_CODES.includes(code)) {
        containsOverrideErrorMessage = true;
      }

      if (!BACKEND_ERRORS_CODES_TO_HIDE.includes(code)) {
        const translationId = ERROR_MESSAGE_TRANSLATION_ID_BY_BACKEND_ERROR_CODE[code];

        if (translationId) {
          let values = {};

          switch (code) {
            case BACKEND_ERROR_CODES.itemNotLoanable:
              values = {
                title,
                barcode,
                materialType,
                loanPolicy: error?.parameters[0]?.value,
              };
              break;
            case BACKEND_ERROR_CODES.userHasNoBarcode:
              values = {
                br: () => <br />,
              };
              break;
            default: {
              values.itemLimit = parameters.find(item => item.key === ITEM_LIMIT_KEY)?.value || 0;
              break;
            }
          }

          messageToDisplay = (
            <FormattedMessage
              id={translationId}
              values={values}
            />
          );
        } else {
          messageToDisplay = message;
        }
      }
    } else {
      messageToDisplay = message;
    }

    if (messageToDisplay) {
      errorsToDisplay.push(
        <p data-test-error-item key={`error-${index}`}>
          {messageToDisplay}
        </p>
      );
    }
  });

  const canBeOverridden = stripes.hasPerm('ui-users.overrideItemBlock')
    && containsOverrideErrorMessage;

  return (
    <Modal
      onClose={onClose}
      data-test-error-modal
      open={open}
      size="small"
      label={<FormattedMessage id="ui-checkout.itemNotCheckedOut" />}
      dismissible
    >
      {errorsToDisplay}
      <Col xs={12}>
        <Row end="xs">
          {canBeOverridden &&
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
