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
  TitleManager,
  withModules,
  withStripes,
  stripesShape,
} from '@folio/stripes/core';

import ErrorModal from '../ErrorModal';
import OverrideModal from '../OverrideModal';
import SelectItemModal from '../SelectItemModal';

class ItemForm extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    shouldSubmitAutomatically: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    item: PropTypes.object,
    items: PropTypes.arrayOf(
      PropTypes.object
    ),
    patron: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    onOverride: PropTypes.func.isRequired,
    form: PropTypes.object.isRequired,
    formRef: PropTypes.object.isRequired,
    checkoutError: PropTypes.arrayOf(
      PropTypes.object
    ).isRequired,
    onClearCheckoutErrors: PropTypes.func,
    modules: PropTypes.shape({
      app: PropTypes.arrayOf(PropTypes.object),
    }),
    onItemSelection: PropTypes.func.isRequired,
    onCloseSelectItemModal: PropTypes.func.isRequired,
    patronBlockOverriddenInfo: PropTypes.object.isRequired,
    totalRecords: PropTypes.number.isRequired,
    onNeedMoreData: PropTypes.func.isRequired,
    barcode: PropTypes.oneOfType([
      PropTypes.oneOf([null, PropTypes.string])
    ]).isRequired,
    pagingOffset: PropTypes.number.isRequired,
  };

  static defaultProps = {
    patron: {},
    item: {},
    items: null,
  };

  static getDerivedStateFromProps(props, { errors }) {
    return { errors: props.checkoutError || errors || [] };
  }

  constructor(props) {
    super(props);

    this.barcodeEl = React.createRef();
    this.readyPrefix = props.modules?.app?.find(el => el.module === '@folio/checkout')?.readyPrefix;
    this.state = {
      overrideModalOpen: false,
      errors: [],
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

  setError = (errors) => {
    this.setState({ errors });
  };

  openOverrideModal = () => {
    const { errors } = this.state;
    this.setState({
      overrideError: errors[0],
      overrideModalOpen: true
    });
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

    this.setError([]);
    onClearCheckoutErrors();
    form.reset();
  };

  handleItemSelection = (_, item) => {
    this.props.onItemSelection(_, item);
    this.focusInput();
  };

  handleCloseSelectItemModal = () => {
    this.props.onCloseSelectItemModal();
    this.clearForm();
    this.focusInput();
  };

  onSubmit = async (event) => {
    const { handleSubmit } = this.props;
    const errors = await handleSubmit(event);

    if (!isEmpty(errors)) {
      return errors;
    }

    return this.clearForm();
  };

  render() {
    const {
      submitting,
      stripes,
      item,
      items,
      onOverride,
      patronBlockOverriddenInfo,
      totalRecords,
      onNeedMoreData,
      barcode,
      pagingOffset,
    } = this.props;

    const {
      errors,
      overrideError,
      overrideModalOpen,
    } = this.state;
    const validationEnabled = false;

    return (
      <>
        <form
          id="item-form"
          data-testid="itemForm"
          onSubmit={this.onSubmit}
        >
          <Row id="section-item">
            <Col xs={4}>
              <FormattedMessage id="ui-checkout.scanOrEnterItemBarcode">
                {placeholder => (
                  <FormattedMessage id="ui-checkout.itemId">
                    {ariaLabel => (
                      <TitleManager prefix={(this.readyPrefix && this.state.readyToScan) ? this.readyPrefix : undefined}>
                        <Field
                          data-testid="itemBarcodeField"
                          fullWidth
                          name="item.barcode"
                          component={TextField}
                          aria-label={ariaLabel}
                          id="input-item-barcode"
                          placeholder={placeholder}
                          inputRef={this.barcodeEl}
                          validationEnabled={validationEnabled}
                          onFocus={this.readyPrefix ? () => this.setState({ readyToScan: true }) : undefined}
                          onBlur={this.readyPrefix ? () => this.setState({ readyToScan: false }) : undefined}
                        />
                      </TitleManager>
                    )}
                  </FormattedMessage>
                )}
              </FormattedMessage>
            </Col>
            <Col xs={2}>
              <Button
                data-testid="addItemButton"
                id="clickable-add-item"
                type="submit"
                buttonStyle="default"
                disabled={submitting}
              >
                <FormattedMessage id="ui-checkout.enter" />
              </Button>
            </Col>
          </Row>
        </form>
        {!isEmpty(errors) &&
          <ErrorModal
            data-testid="errorModal"
            stripes={stripes}
            item={item || {}}
            errors={errors}
            open
            openOverrideModal={this.openOverrideModal}
            onClose={this.clearForm}
          />
        }
        {overrideModalOpen &&
          <OverrideModal
            data-testid="overrideModal"
            item={item}
            overrideError={overrideError}
            stripes={stripes}
            onOverride={onOverride}
            closeOverrideModal={this.closeOverrideModal}
            patronBlockOverriddenInfo={patronBlockOverriddenInfo}
          />
        }
        {items &&
          <SelectItemModal
            data-testid="selectItemModal"
            checkoutItems={items}
            totalRecords={totalRecords}
            onNeedMoreData={onNeedMoreData}
            barcode={barcode}
            pagingOffset={pagingOffset}
            onClose={this.handleCloseSelectItemModal}
            onSelectItem={this.handleItemSelection}
          />}
      </>
    );
  }
}

export default stripesFinalForm({
  navigationCheck: true,
})(withStripes(withModules(ItemForm)));
