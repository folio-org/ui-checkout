import React from 'react';
import PropTypes from 'prop-types';
import {
  find,
  isEmpty,
} from 'lodash';
import { Field } from 'react-final-form';

import stripesFinalForm from '@folio/stripes/final-form';

import {
  Button,
  Col,
  Row,
  TextField,
} from '@folio/stripes/components';

import { Pluggable } from '@folio/stripes/core';
import { FormattedMessage } from 'react-intl';

import css from './PatronForm.css';

class PatronForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    userIdentifiers: PropTypes.arrayOf(PropTypes.string),
    submitting: PropTypes.bool,
    submitFailed: PropTypes.bool,
    patron: PropTypes.object,
    forwardedRef: PropTypes.object,
    formRef: PropTypes.object,
    form: PropTypes.object.isRequired,
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
    const {
      formRef,
      form,
    } = this.props;

    formRef.current = form;
  }

  componentDidUpdate() {
    const {
      forwardedRef,
      patron,
      submitFailed,
    } = this.props;

    const input = forwardedRef;

    // Refocus on the patron barcode input if the submitted value fails
    if (document.activeElement !== input && !patron.id && submitFailed) {
      setTimeout(() => this.focusInput());
    }
  }

  focusInput() {
    const { forwardedRef } = this.props;
    if (forwardedRef.current) {
      forwardedRef.current.focus();
    }
  }

  selectUser(user) {
    const {
      userIdentifiers,
      handleSubmit,
      form,
    } = this.props;

    const ident = find(userIdentifiers, i => user[i]);

    if (ident) {
      form.change('patron.identifier', user[ident]);
      setTimeout(() => handleSubmit());
    } else {
      const { username } = user;
      const identifier = userIdentifiers[0];
      const missingIdErrorMessage = (
        <FormattedMessage
          id="ui-checkout.missingIdentifierError"
          values={{ username, identifier }}
        />
      );

      Object.assign(user, { error: missingIdErrorMessage });
    }
  }

  onSubmit = async (event) => {
    const {
      form,
      handleSubmit,
    } = this.props;

    const error = await handleSubmit(event);
    if (!isEmpty(error)) {
      return error;
    }
    return form.reset();
  };

  render() {
    const {
      userIdentifiers,
      submitting,
      forwardedRef,
      form,
    } = this.props;

    const validationEnabled = false;
    const disableRecordCreation = true;
    const identifier = (userIdentifiers.length > 1) ? 'id' : userIdentifiers[0];
    const formState = form.getState();

    return (
      <form
        id="patron-form"
        onSubmit={this.onSubmit}
      >
        <Row id="section-patron">
          <Col xs={9}>
            <FormattedMessage
              id="ui-checkout.scanOrEnterPatronId"
              values={{ identifier }}
            >
              {placeholder => (
                <FormattedMessage id="ui-checkout.patron.identifier">
                  {ariaLabel => (
                    <Field
                      name="patron.identifier"
                      placeholder={placeholder}
                      aria-label={ariaLabel}
                      fullWidth
                      id="input-patron-identifier"
                      data-test-check-out-patron-identifier
                      component={TextField}
                      inputRef={forwardedRef}
                      validationEnabled={validationEnabled}
                    />
                  )}
                </FormattedMessage>
              )}
            </FormattedMessage>
            { formState.hasSubmitErrors && (
              <span className={css.error}>
                {formState.submitErrors.patron.identifier}
              </span>
            )}
          </Col>
          <Col xs={3}>
            <Button
              id="clickable-find-patron"
              type="submit"
              buttonStyle="default"
              disabled={submitting}
            >
              <FormattedMessage id="ui-checkout.enter" />
            </Button>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Pluggable
              aria-haspopup="true"
              type="find-user"
              id="clickable-find-user"
              {...this.props}
              searchLabel={<FormattedMessage id="ui-checkout.patronLookup" />}
              marginTop0
              searchButtonStyle="link"
              dataKey="patrons"
              selectUser={this.selectUser}
              visibleColumns={['status', 'name', 'patronGroup', 'username', 'barcode']}
              columnMapping={this.columnMapping}
              disableRecordCreation={disableRecordCreation}
            />
          </Col>
        </Row>
      </form>
    );
  }
}

export default stripesFinalForm({
  navigationCheck: false,
})(PatronForm);
