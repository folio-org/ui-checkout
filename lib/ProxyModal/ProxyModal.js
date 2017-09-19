import React from 'react';
import PropTypes from 'prop-types';
import Modal from '@folio/stripes-components/lib/Modal';

import ProxyForm from '../ProxyForm';

const ProxyModal = props => (
  <Modal onClose={props.onClose} open={props.open} size="small" label="Who are you acting as?" dismissible>
    <ProxyForm onSubmit={props.onContinue} onCancel={props.onClose} {...props} />
  </Modal>
);

ProxyModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onContinue: PropTypes.func,
};

export default ProxyModal;
