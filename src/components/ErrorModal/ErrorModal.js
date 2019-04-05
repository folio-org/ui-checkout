import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import SafeHTMLMessage from '@folio/react-intl-safe-html';

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
    openOverrideModal,
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

  const canBeOverridden = OVERRIDABLE_ERROR_MESSAGES.includes(message);

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
          canBeOverridden
            ? (
              <SafeHTMLMessage
                id="ui-checkout.messages.itemIsNotLoanable"
                values={{ title, barcode, materialType }}
              />
            )
            : message
        }
      </p>
      <Col xs={12}>
        <Row end="xs">
          {
          canBeOverridden &&
            <div data-test-override-button>
              <Button
                onClick={handleOverrideClick}
              >
                <FormattedMessage id="ui-checkout.override" />
              </Button>
            </div>
          }
          <div data-test-close-button>
            <Button
              data-test-close-button
              buttonStyle="primary"
              onClick={onClose}
            >
              <FormattedMessage id="ui-checkout.close" />
            </Button>
          </div>
        </Row>
      </Col>
    </Modal>
  );
}

ErrorModal.propTypes = {
  item: PropTypes.object,
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  openOverrideModal: PropTypes.func,
};

ErrorModal.defaultProps = {
  item: {},
  openOverrideModal: () => {},
};

export default ErrorModal;
