import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Button from '@folio/stripes-components/lib/Button';
import RadioButtonGroup from '@folio/stripes-components/lib/RadioButtonGroup';
import RadioButton from   '@folio/stripes-components/lib/RadioButton';
import { Row, Col } from 'react-bootstrap';

import { getFullName} from '../../util';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  patron: React.PropTypes.object,
};

class ProxyForm extends React.Component {

  render() {
    const { handleSubmit, patron, onCancel } = this.props;

    return (
      <form id="proxy-form" onSubmit={handleSubmit}>
        <Row>
          <Col xs={12}>
            <strong>{getFullName(patron)}</strong> is acting as:
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <RadioButton label="Self" name="sponsor" id="proxySelf" value={patron} inline />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}>
            <Field label="Sponsor:" name="sponsor" component={RadioButtonGroup}>
              <RadioButton label="Active" id="useractiveYesRB" value="true" inline />
              <RadioButton label="Inactive" id="useractiveNoRB" value="false" inline />
            </Field>
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={3}>
            <Button type="submit" fullWidth>Continue</Button>
          </Col>
          <Col xs={3}>
            <Button onClick={onCancel} buttonStyle="secondary" fullWidth>Cancel</Button>
          </Col>
        </Row>
      </form>
    );
  }
}

ProxyForm.propTypes = propTypes;

export default reduxForm({
  form: 'proxyForm',
})(ProxyForm);
