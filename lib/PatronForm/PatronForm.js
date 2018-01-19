import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import TextField from '@folio/stripes-components/lib/TextField';
import Button from '@folio/stripes-components/lib/Button';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Pluggable from '@folio/stripes-components/lib/Pluggable';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  userIdentifierPref: PropTypes.object,
  change: PropTypes.func,
  submitting: PropTypes.bool,
  patron: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
};

class PatronForm extends React.Component {

  constructor(props) {
    super(props);
    this.selectUser = this.selectUser.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.barcodeEl) return;

    const input = this.barcodeEl.getRenderedComponent().input;

    if (document.activeElement !== input && !nextProps.patron.id) {
      setTimeout(() => input.focus());
    }
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

    return (
      <form id="patron-form" onSubmit={handleSubmit}>
        <Row id="section-patron">
          <Col xs={9}>
            <Field
              name="patron.identifier"
              placeholder={`Scan or enter patron ${userIdentifierPref.label}`}
              aria-label="Patron Identifier"
              fullWidth
              id="input-patron-identifier"
              component={TextField}
              withRef
              ref={barcodeEl => (this.barcodeEl = barcodeEl)}
              validationEnabled={validationEnabled}
            />
            <Pluggable
              aria-haspopup="true"
              type="find-user"
              {...this.props}
              searchLabel="Patron look-up"
              marginTop0
              searchButtonStyle="link"
              selectUser={this.selectUser}
              onCloseModal={(modalProps) => {
                modalProps.parentMutator.query.update({
                  query: '',
                  filters: 'active.Active',
                  sort: 'Name',
                });
              }}
              visibleColumns={['Name', 'Patron Group', 'Username', 'Barcode']}
              disableRecordCreation={disableRecordCreation}
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
