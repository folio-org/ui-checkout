import { isEmpty } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import {
  Field,
  reduxForm,
  reset,
  getFormSubmitErrors,
} from 'redux-form';

import {
  Col,
  Button,
  Row,
  TextField,
} from '@folio/stripes/components';

import { withStripes } from '@folio/stripes/core';
import { FormattedMessage } from 'react-intl';

import ScanTotal from '../ScanTotal';
import ErrorModal from '../ErrorModal';

class ItemForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool,
    patron: PropTypes.object,
    stripes: PropTypes.object,
    submitSucceeded: PropTypes.bool,
  };

  constructor() {
    super();

    this.clearForm = this.clearForm.bind(this);
    this.renderErrorModal = this.renderErrorModal.bind(this);
    this.barcodeEl = React.createRef();
  }

  componentDidMount() {
    if (this.props.patron) {
      this.focusInput();
    }
  }

  componentDidUpdate(prevProps) {
    const {
      submitSucceeded,
      patron,
    } = this.props;

    if (document.activeElement === this.barcodeEl.current ||
      !patron || !patron.id) {
      return;
    }

    // Focus on the item barcode input after the patron is entered
    if (submitSucceeded || !prevProps.patron ||
      prevProps.patron.id !== patron.id) {
      this.clearForm();
      this.focusInput();
    }
  }

  getFormErrors() {
    const { stripes: { store } } = this.props;
    return getFormSubmitErrors('itemForm')(store.getState());
  }

  clearForm() {
    const { stripes: { store } } = this.props;
    store.dispatch(reset('itemForm'));
  }

  focusInput() {
    this.barcodeEl.current.focus();
  }

  renderErrorModal() {
    const errors = this.getFormErrors();
    const error = errors.item || {};

    return (
      <ErrorModal
        open={!isEmpty(error)}
        onClose={this.clearForm}
        message={error.barcode}
      />
    );
  }

  render() {
    const {
      submitting,
      handleSubmit,
      patron,
    } = this.props;

    const validationEnabled = false;

    return (
      <form
        id="item-form"
        onSubmit={handleSubmit}
      >
        <Row id="section-item">
          <Col xs={4}>
            <FormattedMessage id="ui-checkout.scanOrEnterItemBarcode">
              {placeholder => (
                <FormattedMessage id="ui-checkout.itemId">
                  {ariaLabel => (
                    <Field
                      name="item.barcode"
                      placeholder={placeholder}
                      aria-label={ariaLabel}
                      fullWidth
                      id="input-item-barcode"
                      component={TextField}
                      inputRef={this.barcodeEl}
                      validationEnabled={validationEnabled}
                    />
                  )}
                </FormattedMessage>
              )}
            </FormattedMessage>
          </Col>
          <Col xs={2}>
            <Button
              id="clickable-add-item"
              type="submit"
              buttonStyle="primary"
              disabled={submitting}
            >
              <FormattedMessage id="ui-checkout.enter" />
            </Button>
          </Col>
          {
            !isEmpty(patron) &&
            <Col xs={6}>
              <Row end="xs">
                <ScanTotal
                  buttonId="clickable-done"
                  {...this.props}
                />
              </Row>
            </Col>
          }
        </Row>
        {this.renderErrorModal()}
      </form>
    );
  }
}

export default reduxForm({
  form: 'itemForm',
})(withStripes(ItemForm));
