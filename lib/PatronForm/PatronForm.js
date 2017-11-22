import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import TextField from '@folio/stripes-components/lib/TextField';
import Button from '@folio/stripes-components/lib/Button';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
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
      setTimeout(() => handleSubmit());
    } else {
      Object.assign(user, { error: `User ${user.username} does not have a ${userIdentifierPref.label}` });
    }
  }

  render() {
    const { userIdentifierPref, submitting, handleSubmit } = this.props;
    const validationEnabled = false;
    const disableRecordCreation = true;

    // disableRecordCreation is replacing disableUserCreation; send both for now, for safety
    const maybeUserSearch = (<MaybeUserSearch
      {...this.props}
      selectUser={this.selectUser}
      visibleColumns={['Name', 'Patron Group', 'Username', 'Barcode']}
      disableUserCreation={disableRecordCreation}
      disableRecordCreation={disableRecordCreation}
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
              disabled={submitting}
            >Enter</Button>
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
