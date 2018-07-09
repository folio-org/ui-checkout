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
    submitFailed: PropTypes.bool,
    patron: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
    translate: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.selectUser = this.selectUser.bind(this);
    this.barcodeEl = React.createRef();

    // map column-IDs to table-header-values
    this.columnMapping = props.translate({
      name: 'user.name',
      patronGroup: 'user.patronGroup',
      username: 'user.username',
      barcode: 'user.barcode',
    });
  }

  componentDidUpdate() {
    if (!this.barcodeEl.current) return;

    const input = this.barcodeEl.current.getRenderedComponent().getInput();

    // Refocus on the patron barcode input if the submitted value fails
    if (document.activeElement !== input && !this.props.patron.id && this.props.submitFailed) {
      setTimeout(() => this.focusInput());
    }
  }

  focusInput() {
    this.barcodeEl.current.getRenderedComponent().focusInput();
  }

  selectUser(user) {
    const { userIdentifiers, handleSubmit } = this.props;
    const ident = find(userIdentifiers, i => user[patronIdentifierMap[i]]);

    if (ident) {
      this.props.change('patron.identifier', user[patronIdentifierMap[ident]]);
      setTimeout(() => handleSubmit());
    } else {
      const { username } = user;
      const identifier = patronIdentifierMap[userIdentifiers[0]];
      Object.assign(user, { error: this.props.translate('missingIdentifierError', { username, identifier }) });
    }
  }

  render() {
    const { userIdentifiers, submitting, handleSubmit } = this.props;
    const validationEnabled = false;
    const disableRecordCreation = true;
    const identifier = (userIdentifiers.length > 1) ? 'id' : patronLabelMap[userIdentifiers[0]];
    const { translate } = this.props;

    return (
      <form id="patron-form" onSubmit={handleSubmit}>
        <Row id="section-patron">
          <Col xs={9}>
            <Field
              name="patron.identifier"
              placeholder={translate('scanOrEnterPatronId', { identifier })}
              aria-label={translate('patronIdentifier')}
              fullWidth
              id="input-patron-identifier"
              component={TextField}
              withRef
              ref={this.barcodeEl}
              validationEnabled={validationEnabled}
            />
            <Pluggable
              aria-haspopup="true"
              type="find-user"
              id="clickable-find-user"
              {...this.props}
              searchLabel={translate('patronLookup')}
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
              visibleColumns={['name', 'patronGroup', 'username', 'barcode']}
              columnMapping={this.columnMapping}
              disableRecordCreation={disableRecordCreation}
            />
          </Col>
          <Col xs={3}>
            <Button
              id="clickable-find-patron"
              type="submit"
              buttonStyle="primary"
              disabled={submitting}
            >{translate('enter')}
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
