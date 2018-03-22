import { find } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import TextField from '@folio/stripes-components/lib/TextField';
import Button from '@folio/stripes-components/lib/Button';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Pluggable from '@folio/stripes-components/lib/Pluggable';

import { patronIdentifierMap, patronLabelMap } from '../../constants';

class PatronForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    userIdentifiers: PropTypes.arrayOf(PropTypes.string),
    change: PropTypes.func,
    submitting: PropTypes.bool,
    patron: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
  };

  static contextTypes = {
    stripes: PropTypes.object,
    translate: PropTypes.func,
  };

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
    const { userIdentifiers, handleSubmit } = this.props;
    const ident = find(userIdentifiers, i => user[patronIdentifierMap[i]]);

    if (ident) {
      this.props.change('patron.identifier', user[patronIdentifierMap[ident]]);
      setTimeout(() => handleSubmit());
    } else {
      Object.assign(user, { error: `User ${user.username} does not have a ${patronIdentifierMap[userIdentifiers[0]]}` });
    }
  }

  render() {
    const { userIdentifiers, submitting, handleSubmit } = this.props;
    const validationEnabled = false;
    const disableRecordCreation = true;
    const identifier = (userIdentifiers.length > 1) ? 'id' : patronLabelMap[userIdentifiers[0]];

    return (
      <form id="patron-form" onSubmit={handleSubmit}>
        <Row id="section-patron">
          <Col xs={9}>
            <Field
              name="patron.identifier"
              placeholder={`Scan or enter patron ${identifier}`}
              aria-label="Patron Identifier"
              fullWidth
              id="input-patron-identifier"
              component={TextField}
              withRef
              ref={(barcodeEl) => { this.barcodeEl = barcodeEl; }}
              validationEnabled={validationEnabled}
            />
            <Pluggable
              aria-haspopup="true"
              type="find-user"
              {...this.props}
              searchLabel="Patron look-up"
              marginTop0
              searchButtonStyle="link"
              dataKey="patron"
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
              buttonStyle="primary"
              disabled={submitting}
            >Enter
            </Button>
          </Col>
        </Row>
      </form>
    );
  }
}

export default reduxForm({
  form: 'patronForm',
})(PatronForm);
