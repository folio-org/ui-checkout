import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Button from '@folio/stripes-components/lib/Button';
import TextField from '@folio/stripes-components/lib/TextField';
import { Row, Col } from 'react-bootstrap';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
};

const ItemForm = (props) => {
  const { submitting, handleSubmit } = props;
  const validationEnabled = false;
  return (
    <form id="item-form" onSubmit={handleSubmit}>
      <Row id="section-item">
        <Col xs={9}>
          <Field
            name="item.barcode"
            placeholder="Enter Barcode"
            aria-label="Item ID"
            fullWidth
            id="input-item-barcode"
            component={TextField}
            validationEnabled={validationEnabled}
          />
        </Col>
        <Col xs={3}>
          <Button
            id="clickable-add-item"
            type="submit"
            buttonStyle="primary noRadius"
            fullWidth
            disabled={submitting}
          >+ Add item</Button>
        </Col>
      </Row>
    </form>
  );
}

ItemForm.propTypes = propTypes;

export default reduxForm({
  form: 'itemForm',
})(ItemForm);
