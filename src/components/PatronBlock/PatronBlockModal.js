import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Col,
  Modal,
  Row
} from '@folio/stripes/components';

const PatronBlockModal = ({ open, onClose, patronBlocks, viewUserPath }) => (
  <Modal
    open={open}
    onClose={onClose}
    label={<b><FormattedMessage id="ui-checkout.blockModal" /></b>}
    dismissible
  >
    <Row>
      <Col xs><FormattedMessage id="ui-checkout.blockedLabel" /></Col>
    </Row>
    <Row>
      <Col xs><b>{patronBlocks.desc || ''}</b></Col>
    </Row>
    <br />
    <Row end="xs">
      <Col xs>
        <Button onClick={onClose}><FormattedMessage id="ui-checkout.close" /></Button>
        <Button style={{ 'marginLeft': '15px' }} buttonStyle="primary" to={viewUserPath}><FormattedMessage id="ui-checkout.detailsButton" /></Button>
      </Col>
    </Row>
  </Modal>
);

PatronBlockModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  patronBlocks: PropTypes.object,
  viewUserPath: PropTypes.string,
};

export default PatronBlockModal;
