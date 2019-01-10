import { get } from 'lodash';
import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  Modal,
  ModalFooter,
  Button,
  Row,
  Col,
  KeyValue,
} from '@folio/stripes/components';

const MultipieceModal = (props) => {
  const { item, onClose, onConfirm } = props;
  const { title, barcode, materialType } = item;

  const footer = (
    <ModalFooter>
      <Button buttonStyle="primary" onClick={() => onConfirm(item)}>
        <FormattedMessage id="ui-checkout.multipieceModal.confirm" />
      </Button>
      <Button onClick={onClose}>
        <FormattedMessage id="ui-checkout.multipieceModal.back" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      id="multipiece-modal"
      size="small"
      footer={footer}
      dismissible
      label={
        <FormattedMessage id="ui-checkout.multipieceModal.label" />
      }
      {...props}
    >
      <p>
        <SafeHTMLMessage
          id="ui-checkout.multipieceModal.message"
          values={{ title, barcode, materialType: materialType.name }}
        />
      </p>
      <Row>
        <Col xs={6}>
          <KeyValue
            label={<FormattedMessage id="ui-checkout.multipieceModal.item.numberOfPieces" />}
            value={get(item, 'numberOfPieces', '-')}
          />
        </Col>
        <Col xs={6}>
          <KeyValue
            label={<FormattedMessage id="ui-checkout.multipieceModal.item.descriptionOfPieces" />}
            value={get(item, 'descriptionOfPieces', '-')}
          />
        </Col>
        {
          (item.numberOfMissingPieces || item.descriptionOfmissingPieces) &&
          <Fragment>
            <Col xs={6}>
              <KeyValue
                label={<FormattedMessage id="ui-checkout.multipieceModal.item.numberOfMissingPieces" />}
                value={get(item, 'numberOfMissingPieces', '-')}
              />
            </Col>
            <Col xs={6}>
              <KeyValue
                label={<FormattedMessage id="ui-checkout.multipieceModal.item.descriptionOfmissingPieces" />}
                value={get(item, 'descriptionOfmissingPieces', '-')}
              />
            </Col>
          </Fragment>
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
