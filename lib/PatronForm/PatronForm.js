import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import TextField from '@folio/stripes-components/lib/TextField';
import Button from '@folio/stripes-components/lib/Button';
import { Row, Col } from 'react-bootstrap';

import MaybeUserSearch from '../../MaybeUserSearch';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  userIdentifierPref: PropTypes.object,
  change: PropTypes.func,
  submitting: PropTypes.bool,
};

class PatronForm extends React.Component {

  constructor(props) {
    super(props);
    this.selectUser = this.selectUser.bind(this);
  }

  selectUser(user) {
    const { userIdentifierPref, handleSubmit } = this.props;
    if (user[userIdentifierPref.queryKey]) {
      this.props.change('patron.identifier', user[userIdentifierPref.queryKey]);
      handleSubmit();
    } else {
      Object.assign(user, { error: `User ${user.username} does not have a ${userIdentifierPref.label}` });
    }
  }

  render() {
    const { userIdentifierPref, submitting, handleSubmit } = this.props;
    const validationEnabled = false;
    const disableUserCreation = true;
    const maybeUserSearch = (<MaybeUserSearch
      {...this.props}
      selectUser={this.selectUser}
      visibleColumns={['Name', 'Patron Group', 'Username', 'Barcode']}
      disableUserCreation={disableUserCreation}
    />);

    return (
      <form id="patron-form" onSubmit={handleSubmit}>
        <Row id="section-patron">
          <Col xs={9}>
            <Field
              name="patron.identifier"
              placeholder={`Enter Patron's ${userIdentifierPref.label}`}
              aria-label="Patron Identifier"
              fullWidth
              id="input-patron-identifier"
              component={TextField}
              validationEnabled={validationEnabled}
              startControl={maybeUserSearch}
            />
          </Col>
          <Col xs={3}>
            <Button
              id="clickable-find-patron"
              type="submit"
              buttonStyle="primary noRadius"
              fullWidth
              disabled={submitting}
            >Find Patron</Button>
          </Col>
        </Row>
      </form>
    );
  }
}

PatronForm.propTypes = propTypes;

export default reduxForm({
  form: 'patronForm',
})(PatronForm);
