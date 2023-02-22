import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Col,
  Modal,
  Row
} from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes/core';

import { renderOrderedPatronBlocks } from '../../util';

const PatronBlockModal = ({
  open,
  onClose,
  patronBlocks,
  viewUserPath,
  openOverrideModal,
}) => {
  const renderPatronBlocks = renderOrderedPatronBlocks(patronBlocks);

  return (
    <Modal
      data-test-block-modal
      data-testid="patronBlockModal"
      open={open}
      onClose={onClose}
      label={<b><FormattedMessage id="ui-checkout.blockModal" /></b>}
      dismissible
    >
      <Row>
        <Col xs>
          <FormattedMessage id="ui-checkout.blockedLabel" />
          :
        </Col>
      </Row>
      {renderPatronBlocks}
      <br />
      <Row>
        <Col xs={6}>{(patronBlocks.length > 3) && <FormattedMessage id="ui-checkout.additionalReasons" />}</Col>
        <Col xs={6}>
          <Row end="xs">
            <Col>
              <IfPermission perm="ui-users.overridePatronBlock">
                <Button
                  data-test-override-patron-block-button
                  data-testid="overrideButton"
                  onClick={openOverrideModal}
                >
                  <FormattedMessage id="ui-checkout.override" />
                </Button>
              </IfPermission>
              <Button
                data-test-close-patron-block-modal
                data-testid="closeButton"
                onClick={onClose}
              >
                <FormattedMessage id="ui-checkout.close" />
              </Button>
              <Button
                data-testid="detailsButton"
                buttonStyle="primary"
                onClick={viewUserPath}
              >
                <FormattedMessage id="ui-checkout.detailsButton" />
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Modal>
  );
};

PatronBlockModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  patronBlocks: PropTypes.arrayOf(PropTypes.object),
  viewUserPath: PropTypes.func,
  openOverrideModal: PropTypes.func.isRequired,
};

export default PatronBlockModal;
