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
    message = '',
    overridePatronBlock,
    patronBlockOverridenInfo,
    patronBlocks,
    item,
    item: {
      title,
      barcode,
    },
  } = props;
  console.log('patronBlockOverridenInfo ', patronBlockOverridenInfo);
  const [comment, setAdditionalInfo] = useState(patronBlockOverridenInfo?.comment ?? '');
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
    let label = '';

    if (itemIsNotLoanable) {
      label = <FormattedMessage id="ui-checkout.overrideLoanPolicy" />;
    }

    if (blockLimitIsReached) {
      label = <FormattedMessage id="ui-checkout.overrideItemBlock" />;
    }

    if (overridePatronBlock) {
      label = <FormattedMessage id="ui-checkout.overridePatronBlock" />;
    }

    return label;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    closeOverrideModal();
    const overrideItem = {
      comment,
      dueDate,
      barcode,
    };

    return itemIsNotLoanable
      ? onOverride(overrideItem)
      : onOverride(omit(overrideItem, 'dueDate'));
  };

  const renderPatronBlocks = patronBlocks.map(block => {
    return (
      <Row key={block.id || block.patronBlockConditionId}>
        <Col xs>
          <b data-test-block-message>{block.desc || block.message || ''}</b>
        </Col>
      </Row>
    );
  });

  const renderItemInfo = () => (
    <p>
      <SafeHTMLMessage
        id="ui-checkout.messages.itemWillBeCheckedOut"
        values={{ title, barcode, name: item?.materialType?.name }}
      />
    </p>
  );

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
          {overridePatronBlock
            ? (
              <>
                <Row>
                  <Col xs>
                    <FormattedMessage id="ui-checkout.blockedLabel" /> :
                  </Col>
                </Row>
                {renderPatronBlocks}
                <br />
              </>)
            : renderItemInfo
          }
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
                  {(label) => `${label} *`}
                </FormattedMessage>
              )
            }}
            timeProps={{
              label: (
                <FormattedMessage id="ui-checkout.cddd.time">
                  {label => `${label} *`}
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
            value={comment}
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
  item: PropTypes.object,
  onOverride: PropTypes.func.isRequired,
  closeOverrideModal: PropTypes.func.isRequired,
  overridePatronBlock: PropTypes.bool,
  message: PropTypes.string.isRequired,
  patronBlocks: PropTypes.arrayOf(PropTypes.object),
  patronBlockOverridenInfo: PropTypes.object,
};

OverrideModal.defaultProps = {
  item: {},
  overridePatronBlock: false,
  patronBlocks: [],
  patronBlockOverridenInfo: {},
};
export default OverrideModal;
