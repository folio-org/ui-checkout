import { take, orderBy } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Col,
  Modal,
  Row
} from '@folio/stripes/components';

const PatronBlockModal = ({
  open,
  onClose,
  patronBlocks,
  viewUserPath,
  openOverrideModal,
  stripes,
}) => {
  const blocks = take(orderBy(patronBlocks, ['metadata.updatedDate'], ['desc']), 3);
  const renderBlocks = blocks.map(block => {
    return (
      <Row key={block.id || block.patronBlockConditionId}>
        <Col xs>
          <b data-test-block-message>{block.desc || block.message || ''}</b>
        </Col>
      </Row>
    );
  });

  const canBeOverridden = stripes.hasPerm('ui-users.overridePatronBlock');

  return (
    <Modal
      data-test-block-modal
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
      {renderBlocks}
      <br />
      <Row>
        <Col xs={6}>{(patronBlocks.length > 3) && <FormattedMessage id="ui-checkout.additionalReasons" />}</Col>
        <Col xs={6}>
          <Row end="xs">
            <Col>
              {canBeOverridden &&
                <Button
                  data-test-override-patron-block-button
                  onClick={openOverrideModal}
                >
                  <FormattedMessage id="ui-checkout.override" />
                </Button>
              }
              <Button
                data-test-close-patron-block-modal
                onClick={onClose}
              >
                <FormattedMessage id="ui-checkout.close" />
              </Button>
              <Button buttonStyle="primary" onClick={viewUserPath}><FormattedMessage id="ui-checkout.detailsButton" /></Button>
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
  openOverrideModal: PropTypes.func,
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func.isRequired,
  }),
};

export default PatronBlockModal;
