import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';

import stripesFinalForm from '@folio/stripes/final-form';

import {
  Col,
  Button,
  Row,
  TextField,
} from '@folio/stripes/components';

import {
  withStripes,
  stripesShape,
} from '@folio/stripes/core';

import ScanTotal from '../ScanTotal';
import ErrorModal from '../ErrorModal';
import OverrideModal from '../OverrideModal';

class ItemForm extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    shouldSubmitAutomatically: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    item: PropTypes.object,
    patron: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    onOverride: PropTypes.func.isRequired,
    form: PropTypes.object.isRequired,
    formRef: PropTypes.object.isRequired,
    checkoutError: PropTypes.object,
    onClearCheckoutErrors: PropTypes.func,
  };

  static defaultProps = {
    patron: {},
    item: {},
    checkoutError: {},
  };

  static getDerivedStateFromProps(props, { error }) {
    return { error: props.checkoutError?.item || error || {} };
  }

  constructor(props) {
    super(props);

    this.barcodeEl = React.createRef();
    this.state = {
      overrideModalOpen: false,
      error: {},
    };
  }

  componentDidMount() {
    if (this.props.patron) {
      this.focusInput();
    }
    this.props.formRef.current = this.props.form;
  }

  componentDidUpdate(prevProps) {
    const {
      shouldSubmitAutomatically,
      patron,
      form: { getState }
    } = this.props;

    const { submitSucceeded } = getState();

    if (document.activeElement === this.barcodeEl.current || !patron || !patron.id) {
      return;
    }

    // Focus on the item barcode input after the patron is entered
    if (!shouldSubmitAutomatically && (submitSucceeded || !prevProps.patron || // ?
      prevProps.patron.id !== patron.id)) {
      this.clearForm();
      this.focusInput();
    }
  }

  setError = (error) => {
    this.setState({ error });
  };

  openOverrideModal = () => {
    this.setState({ overrideModalOpen: true });
  };

  closeOverrideModal = () => {
    this.setState({ overrideModalOpen: false });
  };

  focusInput() {
    this.barcodeEl.current.focus();
  }

  clearForm = () => {
    const {
      form,
      onClearCheckoutErrors,
    } = this.props;

    this.setError({});
    onClearCheckoutErrors();
    form.reset();
  };

  onSubmit = async (event) => {
    const { handleSubmit } = this.props;
    const error = await handleSubmit(event);

    if (error?.item) {
      return error;
    }

    return this.clearForm();
  };

  render() {
    const {
      submitting,
      patron,
      stripes,
      item,
      onOverride,
    } = this.props;

    const { error, overrideModalOpen } = this.state;
    const validationEnabled = false;

    return (
      <>
        <form
          id="item-form"
          onSubmit={this.onSubmit}
        >
          <Row id="section-item">
            <Col xs={4}>
              <FormattedMessage id="ui-checkout.scanOrEnterItemBarcode">
                {placeholder => (
                  <FormattedMessage id="ui-checkout.itemId">
                    {ariaLabel => (
                      <Field
                        fullWidth
                        name="item.barcode"
                        component={TextField}
                        aria-label={ariaLabel}
                        id="input-item-barcode"
                        placeholder={placeholder}
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
        </form>
        {
          !isEmpty(error) &&
          <ErrorModal
            stripes={stripes}
            item={item || {}}
            message={error.barcode}
            loanPolicy={error.loanPolicy}
            open={!isEmpty(error)}
            openOverrideModal={this.openOverrideModal}
            onClose={this.clearForm}
          />
        }
        {
          overrideModalOpen &&
          <OverrideModal
            item={item}
            stripes={stripes}
            onOverride={onOverride}
            overrideModalOpen={overrideModalOpen}
            closeOverrideModal={this.closeOverrideModal}
          />
        }
      </>
    );
  }
}

export default stripesFinalForm({
  navigationCheck: true,
})(withStripes(ItemForm));
