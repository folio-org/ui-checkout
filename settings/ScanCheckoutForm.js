import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Button from '@folio/stripes-components/lib/Button';
import Checkbox from '@folio/stripes-components/lib/Checkbox';
import stripesForm from '@folio/stripes-form';
import Pane from '@folio/stripes-components/lib/Pane';
import { Field, FieldArray } from 'redux-form';

import { patronIdentifierTypes } from '../constants';
import css from './ScanCheckoutForm.css';

function validate(values) {
  const errors = {};
  const idents = values.idents;

  if (!idents) return errors;

  const isValid = idents.reduce((valid, v) => (valid || v), false);

  if (!isValid) {
    errors.idents = { _error: 'Please select to continue' };
  }

  return errors;
}

class ScanCheckoutForm extends React.Component {
  constructor() {
    super();
    this.onSave = this.onSave.bind(this);
    this.renderList = this.renderList.bind(this);
  }

  onSave(data) {
    const idents = data.idents;
    const values = idents.reduce((vals, ident, index) => {
      if (ident) vals.push(patronIdentifierTypes[index].key);
      return vals;
    }, []);

    this.props.onSubmit({ pref_patron_identifier: values.join(',') });
  }

  getLastMenu() {
    const { pristine, submitting } = this.props;
    return (<Button type="submit" disabled={(pristine || submitting)}>Save</Button>);
  }

   // eslint-disable-next-line class-methods-use-this
  renderList({ fields, meta }) {
    if (!fields.length) return (<div />);

    const items = patronIdentifierTypes.map((iden, index) => (
      <Row key={`row-${index}`}>
        <Col xs={12}>
          <Field
            component={Checkbox}
            id={iden.key}
            label={iden.label}
            key={`item-${index}`}
            name={`idents[${index}]`}
          />
        </Col>
      </Row>
    ));

    return (
      <div>
        <p className={css.label}>Patron ID(s) for checkout scanning *</p>
        {meta.error && <div className={css.error}>{meta.error}</div>}
        {items}
      </div>
    );
  }

  render() {
    const { handleSubmit, label } = this.props;

    return (
      <form id="checkout-form" onSubmit={handleSubmit(this.onSave)}>
        <Pane defaultWidth="fill" fluidContentWidth paneTitle={label} lastMenu={this.getLastMenu()}>
          <FieldArray name="idents" component={this.renderList} />
        </Pane>
      </form>
    );
  }
}

ScanCheckoutForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  label: PropTypes.string,
};

export default stripesForm({
  form: 'checkoutForm',
  validate,
  navigationCheck: true,
  enableReinitialize: true,
})(ScanCheckoutForm);
