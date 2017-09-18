import React from 'react';
import PropTypes from 'prop-types';
import Modal from '@folio/stripes-components/lib/Modal';

import ProxyForm from '../ProxyForm';
import css from './ProxyModal';

class ProxyModal extends React.Component {
  render() {
    const { onClose, onSave, open } = this.props;

    return (
      <Modal onClose={onClose} open={open} label="Who are you acting as?" dismissible>
        <ProxyForm onSubmit={this.onSave} onCancel={onClose} {...this.props} />
      </Modal>
    );
  }
}

ProxyModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func
};

export default ProxyModal;
