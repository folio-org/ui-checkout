import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { CalloutContext } from '@folio/stripes/core';
import { Modal, ModalFooter, Button, TextArea } from '@folio/stripes/components';

function AddInfoDialog({ loan, infoType, addPatronOrStaffInfo, onClose }) {
  const [textEntered, setTextEntered] = useState(false);
  const callout = useContext(CalloutContext);

  const values = {
    title: loan.item?.title,
    materialType: loan.item?.materialType?.name,
    barcode: loan.item?.barcode,
  };

  const submitInfo = () => {
    const elem = document.getElementById('checkout-addInfo-text');
    addPatronOrStaffInfo(loan, infoType, elem.value)
      .then(() => {
        callout.sendCallout({
          message: (
            <FormattedMessage
              id={`ui-checkout.checkout.addInfo.${infoType}.completed`}
              values={{ ...values, text: elem.value }}
            />
          ),
        });
        onClose();
      });
  };

  const footer = (
    <ModalFooter>
      <div style={{ textAlign: 'right' }}>
        <Button onClick={onClose}>
          <FormattedMessage id="ui-checkout.cancel" />
        </Button>
        <Button
          buttonStyle="primary"
          disabled={!textEntered}
          onClick={submitInfo}
        >
          <FormattedMessage id="stripes-components.saveAndClose" />
        </Button>
      </div>
    </ModalFooter>
  );

  return (
    <Modal
      open
      dismissible
      closeOnBackgroundClick
      size="small"
      label={<FormattedMessage id={`ui-checkout.checkout.addInfo.${infoType}.header`} />}
      footer={footer}
      onClose={onClose}
    >
      <p>
        <FormattedMessage
          id={`ui-checkout.checkout.addInfo.${infoType}.body`}
          values={values}
        />
      </p>
      <TextArea
        data-testid="addInfoDialogField"
        id="checkout-addInfo-text"
        autoFocus
        onChange={e => setTextEntered(e.target.value !== '')}
      />
    </Modal>
  );
}

AddInfoDialog.propTypes = {
  loan: PropTypes.shape({
    item: PropTypes.shape({
      // mod-circulation/ramls/loan.json does not allow us to say .isRequired for item or any of its properties
      title: PropTypes.string,
      materialType: PropTypes.shape({
        name: PropTypes.string,
      }),
      barcode: PropTypes.string,
    }),
  }).isRequired,
  infoType: PropTypes.string.isRequired,
  addPatronOrStaffInfo: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddInfoDialog;
