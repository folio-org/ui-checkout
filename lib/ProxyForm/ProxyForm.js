import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Button from '@folio/stripes-components/lib/Button';
import RadioButton from '@folio/stripes-components/lib/RadioButton';
import { Row, Col } from 'react-bootstrap';

import { getFullName } from '../../util';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  patron: React.PropTypes.object,
  sponsors: PropTypes.arrayOf(PropTypes.object),
};

const ProxyForm = (props) => {
  const { handleSubmit, onCancel, patron, sponsors } = props;
  const sponsorsList = _.chunk(sponsors, 3).map((group, i) => (
    <Row key={`row-${i}`}>
      {group.map(sponsor => (
        <Col xs={4} key={`col-${sponsor.id}`}>
          <Field
            component={RadioButton}
            type="radio"
            id={`sponsor-${sponsor.id}`}
            key={`sponsor-${sponsor.id}`}
            name="sponsorId"
            label={getFullName(sponsor)}
            value={sponsor.id}
            inline
          />
        </Col>
      ))}
    </Row>
  ));

  return (
    <form id="proxy-form" onSubmit={handleSubmit}>
      <Row>
        <Col xs={12}>
          <strong>{getFullName(patron)}</strong> is acting as:
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <Field
            component={RadioButton}
            type="radio"
            id={`sponsor-${patron.id}`}
            key={`sponsor-${patron.id}`}
            name="sponsorId"
            label="Self"
            value={patron.id}
            inline
          />
        </Col>
      </Row>
      <br />
      <Row>
        <Col xs={12}><strong>Sponsor:</strong></Col>
      </Row>
      {sponsorsList}
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
};

ProxyForm.propTypes = propTypes;

export default reduxForm({
  form: 'proxyForm',
})(ProxyForm);
