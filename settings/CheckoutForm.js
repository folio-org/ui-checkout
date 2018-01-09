import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Button from '@folio/stripes-components/lib/Button';
import Select from '@folio/stripes-components/lib/Select';
import Pane from '@folio/stripes-components/lib/Pane';
import stripesForm from '@folio/stripes-form';
import { Field } from 'redux-form';

import { patronIdentifierTypes } from '../constants';

const identifierTypeOptions = patronIdentifierTypes.map(i => (
  {
    id: i.key,
    label: i.label,
    value: i.key,
  }
));

class CheckoutForm extends React.Component {

  getLastMenu() {
    const { pristine, submitting } = this.props;
    return (<Button type="submit" disabled={(pristine || submitting)}>Save</Button>);
  }

  render() {
    const { handleSubmit, label } = this.props;

    return (
      <form id="checkout-form" onSubmit={handleSubmit}>
        <Pane defaultWidth="fill" fluidContentWidth paneTitle={label} lastMenu={this.getLastMenu()}>
          <Row>
            <Col xs={12}>
              <Field
                component={Select}
                id="patronScanId"
                label="Scan ID for patron check out"
                placeholder="---"
                name="identifier"
                dataOptions={identifierTypeOptions}
              />
            </Col>
          </Row>
        </Pane>
      </form>
    );
  }
}

CheckoutForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  label: PropTypes.string,
};

export default stripesForm({
  form: 'checkoutForm',
  navigationCheck: true,
  enableReinitialize: true,
})(CheckoutForm);
