import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import {
  reduxForm,
  Form,
} from 'redux-form';

import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  Button,
  Col,
  Modal,
  Row,
  TextArea,
} from '@folio/stripes/components';
import {
  stripesShape,
  stripesConnect,
} from '@folio/stripes/core';
import { DueDatePicker } from '@folio/stripes/smart-components';

import {
  DATE_PICKER_DEFAULTS,
  INVALIDE_DATE_MESSAGE,
} from '../../constants';

function OverrideModal(props) {
  const {
    stripes,
    overrideModalOpen,
    closeOverrideModal,
    setError,
    addScannedItem,
    item: {
      title,
      barcode: itemBarcode,
      materialType: { name: materialType },
    },
  } = props;
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [datetime, setDatetime] = useState('');

  const handleDateTimeChanged = (newDateTime) => {
    setDatetime(newDateTime);
  };

  const canBeSubmitted = additionalInfo && datetime !== INVALIDE_DATE_MESSAGE;

  const onSubmit = async (event) => {
    event.preventDefault();
    const {
      stripes: {
        user: {
          user: {
            curServicePoint: {
              id: servicePointId
            }
          }
        }
      },
      mutator: {
        overrideCheckout: {
          POST,
        }
      },
      patron: {
        barcode: patronBarcode
      },
    } = props;

    closeOverrideModal();

    try {
      const item = {
        userBarcode: patronBarcode,
        comment: additionalInfo,
        dueDate: datetime,
        servicePointId,
        itemBarcode,
      };

      const loan = await POST(item);

      addScannedItem(loan);
    } catch (error) {
      setError({ barcode: error.statusText });
    }
  };

  return (
    <Modal
      size="small"
      dismissible
      enforceFocus={false}
      data-test-override-modal
      open={overrideModalOpen}
      label={<FormattedMessage id="ui-checkout.overrideLoanPolicy" />}
      onClose={closeOverrideModal}
    >
      <Form
        id="override-form"
        onSubmit={onSubmit}
      >
        <Col xs={12}>
          <p>
            <SafeHTMLMessage
              id="ui-checkout.multipieceModal.message"
              values={{ title, barcode: itemBarcode, materialType }}
            />
          </p>
        </Col>
        <Col
          xs={12}
          data-test-override-modal-due-date-picker
        >
          <DueDatePicker
            required
            initialValues={DATE_PICKER_DEFAULTS}
            stripes={stripes}
            dateProps={{ label: (
              <FormattedMessage id="ui-checkout.cddd.date">
                {message => `${message} *`}
              </FormattedMessage>
            ) }}
            timeProps={{ label:(
              <FormattedMessage id="ui-checkout.cddd.time">
                {message => `${message} *`}
              </FormattedMessage>
            ) }}
            onChange={handleDateTimeChanged}
          />
        </Col>
        <Col
          data-test-override-modal-comment
          xs={12}
        >
          <TextArea
            required
            label={<FormattedMessage id="ui-checkout.comment" />}
            onChange={(e) => { setAdditionalInfo(e.target.value); }}
          />
        </Col>
        <Col xs={12}>
          <Row end="xs">
            <Button
              onClick={closeOverrideModal}
              data-test-override-modal-cancel
            >
              <FormattedMessage id="ui-checkout.cancel" />
            </Button>
            <Button
              data-test-override-modal-save-and-close
              buttonStyle="primary"
              type="submit"
              disabled={!canBeSubmitted}
            >
              <FormattedMessage id="ui-checkout.saveAndClose" />
            </Button>
          </Row>
        </Col>
      </Form>
    </Modal>
  );
}

OverrideModal.propTypes = {
  stripes: stripesShape.isRequired,
  item: PropTypes.object.isRequired,
  patron: PropTypes.object.isRequired,
  overrideModalOpen: PropTypes.bool.isRequired,
  setError: PropTypes.func.isRequired,
  addScannedItem: PropTypes.func.isRequired,
  closeOverrideModal: PropTypes.func.isRequired,
  mutator: PropTypes.shape({
    overrideCheckout: PropTypes.shape({
      POST: PropTypes.func,
    }),
  }),
};

OverrideModal.manifest = Object.freeze({
  overrideCheckout: {
    type: 'okapi',
    path: 'circulation/override-check-out-by-barcode',
    fetch: false,
    throwErrors: false,
  }
});


export default reduxForm({
  form: 'overrideForm',
})(stripesConnect(OverrideModal));
