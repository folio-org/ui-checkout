import { get } from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalFooter,
  Button,
  Row,
  Col,
  KeyValue,
} from '@folio/stripes/components';

const MultipieceModal = (props) => {
  const {
    item,
    open,
    onClose,
    onConfirm,
  } = props;
  const {
    title,
    barcode,
    materialType,
  } = item;
  const handleConfirmClick = () => onConfirm(item);
  const footer = (
    <ModalFooter>
      <Button
        data-test-multipiece-modal-confirm-btn
        data-testid="confirmButton"
        buttonStyle="primary"
        onClick={handleConfirmClick}
      >
        <FormattedMessage id="ui-checkout.multipieceModal.confirm" />
      </Button>
      <Button
        data-test-multipiece-modal-cancel-btn
        data-testid="cancelButton"
        onClick={onClose}
      >
        <FormattedMessage id="ui-checkout.multipieceModal.cancel" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      data-testid="multipieceModal"
      id="multipiece-modal"
      size="small"
      footer={footer}
      dismissible
      label={
        <FormattedMessage id="ui-checkout.multipieceModal.label" />
      }
      onClose={onClose}
      open={open}
    >
      <p>
        <FormattedMessage
          id="ui-checkout.multipieceModal.message"
          values={{
            title,
            barcode,
            materialType: materialType.name,
          }}
        />
      </p>
      <Row>
        <Col xs={6}>
          <KeyValue
            label={<FormattedMessage id="ui-checkout.multipieceModal.item.numberOfPieces" />}
            value={get(item, 'numberOfPieces', '')}
          />
        </Col>
        <Col xs={6}>
          <KeyValue
            label={<FormattedMessage id="ui-checkout.multipieceModal.item.descriptionOfPieces" />}
            value={get(item, 'descriptionOfPieces', '')}
          />
        </Col>
        {
          (item.numberOfMissingPieces || item.descriptionOfmissingPieces) &&
          <>
            <Col xs={6}>
              <KeyValue
                label={<FormattedMessage id="ui-checkout.multipieceModal.item.numberOfMissingPieces" />}
                value={get(item, 'numberOfMissingPieces', '')}
              />
            </Col>
            <Col xs={6}>
              <KeyValue
                label={<FormattedMessage id="ui-checkout.multipieceModal.item.descriptionOfmissingPieces" />}
                value={get(item, 'missingPieces', '')}
              />
            </Col>
          </>
        }
      </Row>
    </Modal>
  );
};

MultipieceModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  item: PropTypes.object,
};

export default MultipieceModal;
