import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalFooter,
  Button,
} from '@folio/stripes/components';

const NotificationModal = (props) => {
  const footer = (
    <ModalFooter>
      <Button onClick={props.onClose}>
        <FormattedMessage id="ui-checkout.close" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      size="small"
      footer={footer}
      dismissible
      {...props}
    >
      <p>{props.message}</p>
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
