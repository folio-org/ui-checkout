import React from 'react';
import PropTypes from 'prop-types';
import Modal from '@folio/stripes-components/lib/Modal';
import Button from '@folio/stripes-components/lib/Button';
import { Row, Col } from '@folio/stripes-components/lib//LayoutGrid';

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
            <Button buttonStyle="primary" onClick={onClose}>{translate('okay')}</Button>
          </Row>
        </Col>
      </Modal>
    );
  }
}

export default ErrorModal;
