import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalFooter,
} from '@folio/stripes/components';

const NotificationModal = (props) => {
  const footer = (
    <ModalFooter
      primaryButton={{
        'label': <FormattedMessage id="ui-checkout.close" />,
        'onClick': props.onClose,
      }}
    />
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
  label: PropTypes.string,
  message: PropTypes.string,
  id: PropTypes.string,
};

export default NotificationModal;
