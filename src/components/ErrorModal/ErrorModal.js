import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Modal, Row } from '@folio/stripes/components';

class ErrorModal extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    message: PropTypes.string,
    translate: PropTypes.func,
  };

  render() {
    const { open, message, onClose, translate } = this.props;

    return (
      <Modal onClose={onClose} open={open} size="small" label={translate('itemNotCheckedOut')} dismissible>
        <p>{message}</p>
        <Col xs={12}>
          <Row end="xs">
            <Button buttonStyle="primary" onClick={onClose}>{translate('close')}</Button>
          </Row>
        </Col>
      </Modal>
    );
  }
}

export default ErrorModal;
