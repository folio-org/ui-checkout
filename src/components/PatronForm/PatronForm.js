import { find } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Button, Col, Row, TextField } from '@folio/stripes/components';
import { Pluggable } from '@folio/stripes/core';
import { FormattedMessage, intlShape } from 'react-intl';

import { patronIdentifierMap, patronLabelMap } from '../../constants';

class PatronForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    userIdentifiers: PropTypes.arrayOf(PropTypes.string),
    change: PropTypes.func,
    submitting: PropTypes.bool,
    submitFailed: PropTypes.bool,
    patron: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
    intl: intlShape.isRequired,
    forwardedRef: PropTypes.instanceOf(Element)
  };

  constructor(props) {
    super(props);
    this.selectUser = this.selectUser.bind(this);
    // map column-IDs to table-header-values
    this.columnMapping = {
      name: <FormattedMessage id="ui-checkout.user.name" />,
      patronGroup: <FormattedMessage id="ui-checkout.user.patronGroup" />,
      username: <FormattedMessage id="ui-checkout.user.username" />,
      barcode: <FormattedMessage id="ui-checkout.user.barcode" />
    };
  }

  componentDidMount() {
    this.focusInput();
  }

  componentDidUpdate() {
    const { forwardedRef } = this.props;
    const input = forwardedRef.current.getRenderedComponent().getInput();

    // Refocus on the patron barcode input if the submitted value fails
    if (document.activeElement !== input && !this.props.patron.id && this.props.submitFailed) {
      setTimeout(() => this.focusInput());
    }
  }

  focusInput() {
    const { forwardedRef } = this.props;
    forwardedRef.current.getRenderedComponent().focusInput();
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
      Object.assign(user, { error: <FormattedMessage id="ui-checkout.missingIdentifierError" values={{ username, identifier }} /> });
    }
  }

  render() {
    const { userIdentifiers, submitting, handleSubmit } = this.props;
    const validationEnabled = false;
    const disableRecordCreation = true;
    const identifier = (userIdentifiers.length > 1) ? 'id' : patronLabelMap[userIdentifiers[0]];
    const { forwardedRef } = this.props;

    return (
      <form id="patron-form" onSubmit={handleSubmit}>
        <Row id="section-patron">
          <Col xs={9}>
            <FormattedMessage id="ui-checkout.scanOrEnterPatronId" values={{ identifier }}>
              {placeholder => (
                <FormattedMessage id="ui-checkout.patronIdentifier">
                  {ariaLabel => (
                    <Field
                      name="patron.identifier"
                      placeholder={placeholder}
                      aria-label={ariaLabel}
                      fullWidth
                      id="input-patron-identifier"
                      component={TextField}
                      withRef
                      ref={forwardedRef}
                      validationEnabled={validationEnabled}
                    />
                  )}
                </FormattedMessage>
              )}
            </FormattedMessage>
            <Pluggable
              aria-haspopup="true"
              type="find-user"
              id="clickable-find-user"
              {...this.props}
              searchLabel={<FormattedMessage id="ui-checkout.patronLookup" />}
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
              visibleColumns={['active', 'name', 'patronGroup', 'username', 'barcode']}
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
            >
              <FormattedMessage id="ui-checkout.enter" />
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
