import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { omit } from 'lodash';

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
} from '@folio/stripes/core';
import { DueDatePicker } from '@folio/stripes/smart-components';

import {
  DATE_PICKER_DEFAULTS,
  INVALID_DATE_MESSAGE,
  ITEM_NOT_LOANABLE,
  MAX_ITEM_BLOCK_LIMIT,
} from '../../constants';

function OverrideModal(props) {
  const {
    stripes,
    closeOverrideModal,
    onOverride,
    message,
    item: {
      title,
      barcode,
      materialType: { name: materialType },
    },

  } = props;
  const [comment, setAdditionalInfo] = useState('');
  const [dueDate, setDatetime] = useState('');

  const itemIsNotLoanable = message.includes(ITEM_NOT_LOANABLE);
  const blockLimitIsReached = message.includes(MAX_ITEM_BLOCK_LIMIT);

  const handleDateTimeChanged = (newDateTime) => {
    setDatetime(newDateTime);
  };

  const canBeSubmitted = itemIsNotLoanable
    ? comment && dueDate !== INVALID_DATE_MESSAGE
    : comment;

  const getModalLabel = () => {
    if (itemIsNotLoanable) {
      return <FormattedMessage id="ui-checkout.overrideLoanPolicy" />;
    }

    if (blockLimitIsReached) {
      return <FormattedMessage id="ui-checkout.overrideItemBlock" />;
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    closeOverrideModal();
    const overrideItem = {
      comment,
      dueDate,
      barcode,
    };

    itemIsNotLoanable
      ? onOverride(overrideItem)
      : onOverride(omit(overrideItem, 'dueDate'));
  };

  return (
    <Modal
      size="small"
      dismissible
      enforceFocus={false}
      data-test-override-modal
      open
      label={getModalLabel()}
      onClose={closeOverrideModal}
    >
      <form
        id="override-form"
        onSubmit={onSubmit}
      >
        <Col xs={12}>
          <p>
            <SafeHTMLMessage
              id="ui-checkout.messages.itemWillBeCheckedOut"
              values={{ title, barcode, materialType }}
            />
          </p>
        </Col>
       {itemIsNotLoanable &&
         <Col
            xs={12}
            data-test-override-modal-due-date-picker
          >
            <DueDatePicker
              required
              initialValues={DATE_PICKER_DEFAULTS}
              stripes={stripes}
              dateProps={{
                label: (
                  <FormattedMessage id="ui-checkout.cddd.date">
                    {message => `${message} *`}
                  </FormattedMessage>
                )
              }}
              timeProps={{
                label: (
                  <FormattedMessage id="ui-checkout.cddd.time">
                    {message => `${message} *`}
                  </FormattedMessage>
                )
              }}
              onChange={handleDateTimeChanged}
            />
          </Col>
        }
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
      </form>
      {itemIsNotLoanable &&
        <>
          <br />
          <br />
          <br />
          <br />
        </>
      }
    </Modal>
  );
}

OverrideModal.propTypes = {
  stripes: stripesShape.isRequired,
  item: PropTypes.object.isRequired,
  onOverride: PropTypes.func.isRequired,
  closeOverrideModal: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
};

export default OverrideModal;
