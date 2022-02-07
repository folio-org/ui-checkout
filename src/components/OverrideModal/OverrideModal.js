import React, {
  useState,
} from 'react';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import moment from 'moment-timezone';

import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  Button,
  Col,
  Modal,
  ModalFooter,
  Row,
  TextArea,
} from '@folio/stripes/components';
import {
  stripesShape,
} from '@folio/stripes/core';
import { DueDatePicker } from '@folio/stripes/smart-components';

import { renderOrderedPatronBlocks } from '../../util';

import {
  INVALID_DATE_MESSAGE,
  ITEM_NOT_LOANABLE,
  MAX_ITEM_BLOCK_LIMIT,
} from '../../constants';

import css from './OverrideModal.css';

const getInitialValues = (timeZone) => {
  const startOfTheDay = {
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  };
  const date = moment()
    .tz(timeZone)
    .set(startOfTheDay)
    .tz('UTC', true)
    .format();

  return {
    date,
    time: '23:59:00.000Z',
  };
};

function OverrideModal(props) {
  const {
    stripes,
    closeOverrideModal,
    onOverride,
    message,
    overridePatronBlock,
    patronBlockOverriddenInfo: {
      comment: patronBlockOverriddenComment = '',
    },
    patronBlocks,
    item,
    item: {
      title,
      barcode,
    },
  } = props;
  const { timeZone } = useIntl();
  const [comment, setAdditionalInfo] = useState(patronBlockOverriddenComment);
  const [dueDate, setDatetime] = useState('');

  const itemIsNotLoanable = message.includes(ITEM_NOT_LOANABLE);
  const blockLimitIsReached = message.includes(MAX_ITEM_BLOCK_LIMIT);

  const handleDateTimeChanged = (newDateTime) => {
    setDatetime(newDateTime);
  };

  const canBeSubmitted = itemIsNotLoanable ? comment && (dueDate !== INVALID_DATE_MESSAGE) : comment;

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

  const renderPatronBlocks = renderOrderedPatronBlocks(patronBlocks);
  const renderItemInfo = () => (
    <p>
      <SafeHTMLMessage
        id="ui-checkout.messages.itemWillBeCheckedOut"
        values={{ title, barcode, name: item?.materialType?.name }}
      />
    </p>
  );

  const footer = (
    <ModalFooter>
      <Button
        data-test-override-modal-save-and-close
        marginBottom0
        buttonStyle="primary"
        disabled={!canBeSubmitted}
        onClick={onSubmit}
      >
        <FormattedMessage id="ui-checkout.saveAndClose" />
      </Button>
      <Button
        marginBottom0
        onClick={closeOverrideModal}
        data-test-override-modal-cancel
      >
        <FormattedMessage id="ui-checkout.cancel" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      size="small"
      dismissible
      enforceFocus={false}
      data-test-override-modal
      open
      label={getModalLabel()}
      footer={footer}
      onClose={closeOverrideModal}
    >
      <form
        id="override-form"
        className={itemIsNotLoanable ? css.content : null}
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
                <Row>
                  <Col xs>{(patronBlocks.length > 3) && <FormattedMessage id="ui-checkout.additionalReasons" />}</Col>
                </Row>
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
            initialValues={getInitialValues(timeZone)}
            stripes={stripes}
            dateProps={{
              label: (
                <FormattedMessage id="ui-checkout.cddd.date">
                  {label => `${label} *`}
                </FormattedMessage>
              ),
            }}
            timeProps={{
              label: (
                <FormattedMessage id="ui-checkout.cddd.time">
                  {label => `${label} *`}
                </FormattedMessage>
              ),
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
      </form>
    </Modal>
  );
}

OverrideModal.propTypes = {
  stripes: stripesShape.isRequired,
  item: PropTypes.object,
  onOverride: PropTypes.func.isRequired,
  closeOverrideModal: PropTypes.func.isRequired,
  overridePatronBlock: PropTypes.bool,
  message: PropTypes.string,
  patronBlocks: PropTypes.arrayOf(PropTypes.object),
  patronBlockOverriddenInfo: PropTypes.object,
};

OverrideModal.defaultProps = {
  item: {},
  overridePatronBlock: false,
  patronBlocks: [],
  patronBlockOverriddenInfo: {},
  message: '',
};
export default OverrideModal;
