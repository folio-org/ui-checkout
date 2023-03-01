import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalFooter,
  Button,
} from '@folio/stripes/components';

const NotificationModal = ({
  message,
  onClose,
  ...rest
}) => {
  const footer = (
    <ModalFooter>
      <Button
        data-testid="footerCloseButton"
        onClick={onClose}
      >
        <FormattedMessage id="ui-checkout.close" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      size="small"
      footer={footer}
      dismissible
      data-testid="notificationModal"
      onClose={onClose}
      {...rest}
    >
      <p>{message}</p>
    </Modal>
  );
};

NotificationModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  label: PropTypes.object,
  message: PropTypes.object,
  id: PropTypes.string,
};

export default NotificationModal;
