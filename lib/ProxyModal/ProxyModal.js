import React from 'react';
import PropTypes from 'prop-types';
import Modal from '@folio/stripes-components/lib/Modal';
import Button from '@folio/stripes-components/lib/Button';
import { Row, Col } from 'react-bootstrap';

import css from './ProxyModal';

class ProxyModal extends React.Component {
  render() {
    const { onClose, onSave, open } = this.props;

    return (
      <Modal onClose={onClose} open={open} label="Who are you acting us?" dismissible>
        <Row>
          <Col xs={3}>
            <Button onClick={onSave} fullWidth>Continue</Button>
          </Col>
          <Col xs={3}>
            <Button onClick={onClose} buttonStyle="secondary" fullWidth>Cancel</Button>
          </Col>
        </Row>
      </Modal>
    );
  }
}

ProxyModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
};

export default ProxyModal;
