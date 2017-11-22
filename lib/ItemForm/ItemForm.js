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
    scanTotal: PropTypes.number,
  };

  static defaultProps = {
    scanTotal: 0
  };

  constructor() {
    super();
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.patron.id) return;

    if (!this.props.patron || this.props.patron.id !== nextProps.patron.id) {
      const input = this.barcodeEl.getRenderedComponent().input;
      setTimeout(() => input.focus());
    }
  }

  render() {
    const { submitting, handleSubmit, scanTotal } = this.props;
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
              ref={barcodeEl => (this.barcodeEl = barcodeEl)}
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
            >Enter</Button>
          </Col>
          <Col xs={6}>
            <Row end="xs">
              <Col xs={8}>
                <ScanTotal total={0} />
              </Col>
              <Col xs={4}>
                <Button
                  id="clickable-end-session"
                  buttonStyle="primary noRadius"
                >End Session</Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </form>
    );
  }
}

export default reduxForm({
  form: 'itemForm',
})(ItemForm);
