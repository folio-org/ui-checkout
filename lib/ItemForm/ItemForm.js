import { isEmpty } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Button from '@folio/stripes-components/lib/Button';
import TextField from '@folio/stripes-components/lib/TextField';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

import ScanTotal from '../ScanTotal';

class ItemForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool,
    patron: PropTypes.object,
  };

  componentWillReceiveProps(nextProps) {
    if (!nextProps.patron.id) return;

    if (!this.props.patron || this.props.patron.id !== nextProps.patron.id) {
      const input = this.barcodeEl.getRenderedComponent().input;
      setTimeout(() => input.focus());
    }
  }

  render() {
    const { submitting, handleSubmit } = this.props;
    const validationEnabled = false;
    return (
      <form id="item-form" onSubmit={handleSubmit}>
        <Row id="section-item">
          <Col xs={4}>
            <Field
              name="item.barcode"
              placeholder="Scan or enter item barcode"
              aria-label="Item ID"
              fullWidth
              id="input-item-barcode"
              component={TextField}
              ref={(barcodeEl) => { this.barcodeEl = barcodeEl; }}
              withRef
              validationEnabled={validationEnabled}
            />
          </Col>
          <Col xs={2}>
            <Button
              id="clickable-add-item"
              type="submit"
              buttonStyle="primary noRadius"
              disabled={submitting}
            >Enter
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
      </form>
    );
  }
}

export default reduxForm({
  form: 'itemForm',
})(ItemForm);
