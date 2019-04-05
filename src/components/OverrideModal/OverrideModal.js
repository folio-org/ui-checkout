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

import { INVALIDE_DATE_MESSAGE } from '../../constants';

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

  const datePickerDefaults = {
    date: '',
    time: '11:59:00.000Z',
  };

  const handleDateTimeChanged = (newDateTime) => {
    setDatetime(newDateTime);
  };

  const canBeSubmitted = additionalInfo && datetime !== INVALIDE_DATE_MESSAGE;

  const onSubmit = async () => {
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
      const loan = await POST(
        {
          userBarcode: patronBarcode,
          comment: additionalInfo,
          dueDate: datetime,
          servicePointId,
          itemBarcode,
        }
      );
      addScannedItem(loan);
    } catch (error) {
      setError({ barcode: error.statusText });
    }
  };

  return (
    <Modal
      onClose={closeOverrideModal}
      open={overrideModalOpen}
      enforceFocus={false}
      size="small"
      label={<FormattedMessage id="ui-checkout.overrideLoanPolicy" />}
      dismissible
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
        <Col xs={12}>
          <DueDatePicker
            initialValues={datePickerDefaults}
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
            required
          />
        </Col>
        <Col xs={12}>
          <TextArea
            label={<FormattedMessage id="ui-checkout.comment" />}
            required
            onChange={(e) => { setAdditionalInfo(e.target.value); }}
          />
        </Col>
        <Col xs={12}>
          <Row end="xs">
            <Button
              onClick={closeOverrideModal}
            >
              <FormattedMessage id="ui-checkout.cancel" />
            </Button>
            <Button
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
