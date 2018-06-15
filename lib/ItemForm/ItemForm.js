import { isEmpty } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, reset, getFormSubmitErrors } from 'redux-form';
import Button from '@folio/stripes-components/lib/Button';
import TextField from '@folio/stripes-components/lib/TextField';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

import ScanTotal from '../ScanTotal';
import { errorTypes } from '../../constants';
import ErrorModal from '../ErrorModal';

class ItemForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool,
    patron: PropTypes.object,
  };

  static contextTypes = {
    stripes: PropTypes.object,
    translate: PropTypes.func,
  };

  constructor() {
    super();

    this.clearForm = this.clearForm.bind(this);
    this.barcodeEl = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (!this.props.patron || !this.props.patron.id) return;
    // Focus on the item barcode input after the patron is entered
    if (!prevProps.patron || prevProps.patron.id !== this.props.patron.id) {
      setTimeout(() => this.focusInput());
    }
  }

  getFormErrors() {
    const { stripes: { store } } = this.context;
    return getFormSubmitErrors('itemForm')(store.getState());
  }

  clearForm() {
    const { stripes: { store } } = this.context;
    store.dispatch(reset('itemForm'));
  }

  focusInput() {
    this.barcodeEl.current.getRenderedComponent().focusInput();
  }

  renderErrorModal() {
    const errors = this.getFormErrors();
    const error = errors.item || {};

    return (
      <ErrorModal open={!isEmpty(error)} onClose={this.clearForm} message={error.barcode} />
    );
  }

  render() {
    const { submitting, handleSubmit } = this.props;
    const { translate } = this.context;
    const validationEnabled = false;

    return (
      <form id="item-form" onSubmit={handleSubmit}>
        <Row id="section-item">
          <Col xs={4}>
            <Field
              name="item.barcode"
              placeholder={translate('scanOrEnterItemBarcode')}
              aria-label={translate('itemId')}
              fullWidth
              id="input-item-barcode"
              component={TextField}
              ref={this.barcodeEl}
              withRef
              validationEnabled={validationEnabled}
            />
          </Col>
          <Col xs={2}>
            <Button
              id="clickable-add-item"
              type="submit"
              buttonStyle="primary"
              disabled={submitting}
            >{translate('enter')}
            </Button>
          </Col>
          {
            !isEmpty(this.props.patron) &&
            <Col xs={6}>
              <Row end="xs">
                <ScanTotal buttonId="clickable-done" {...this.props} />
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
})(ItemForm);
