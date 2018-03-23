import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Button from '@folio/stripes-components/lib/Button';
import RadioButton from '@folio/stripes-components/lib/RadioButton';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import { getFullName, isProxyDisabled } from '../../util';
import css from './ProxyForm.css';

function renderDisabledRadio(sponsor, proxyMap, message) {
  return isProxyDisabled(sponsor, proxyMap) && (
    <div>
      <input id={`sponsor-${sponsor.id}`} type="radio" disabled className={css.disabled} />
      <label htmlFor={`sponsor-${sponsor.id}`} className={css.label}>{getFullName(sponsor)}</label>
      <div className={css.error}>{message}</div>
    </div>
  );
}

function renderEnabledRadio(sponsor) {
  return (
    <Field
      component={RadioButton}
      type="radio"
      id={`sponsor-${sponsor.id}`}
      key={`sponsor-${sponsor.id}`}
      name="sponsorId"
      label={getFullName(sponsor)}
      value={sponsor.id}
    />
  );
}

class ProxyForm extends React.Component {
  static contextTypes = {
    translate: PropTypes.func,
  };

  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    patron: PropTypes.object,
    proxies: PropTypes.arrayOf(PropTypes.object),
    proxiesFor: PropTypes.arrayOf(PropTypes.object),
    sponsorOf: PropTypes.arrayOf(PropTypes.object),
  };

  constructor(props) {
    super(props);
    const { proxiesFor, sponsorOf } = props;

    this.proxiesMap = proxiesFor.reduce((memo, p) => {
      memo[p.userId] = p;
      return memo;
    }, {});

    this.sponsorsMap = sponsorOf.reduce((memo, s) => {
      memo[s.proxyUserId] = s;
      return memo;
    }, {});
  }

  render() {
    const { handleSubmit, onCancel, patron, proxies } = this.props;
    const { translate } = this.context;

    const proxiesList = _.chunk(proxies, 3).map((group, i) => (
      <Row key={`row-${i}`}>
        {group.map(sponsor => (
          <Col xs={12} key={`col-${sponsor.id}`}>
            {
              renderDisabledRadio(sponsor, this.sponsorsMap, translate('sponsorExpired')) ||
              renderDisabledRadio(sponsor, this.proxiesMap, translate('proxyExpired')) ||
              renderEnabledRadio(sponsor)
            }
          </Col>
        ))}
      </Row>
    ));

    return (
      <form id="proxy-form" onSubmit={handleSubmit}>
        <Row>
          <Col xs={12}>
            <strong>{getFullName(patron)}</strong> {translate('isActingAs')}:
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
              label={translate('self')}
              value={patron.id}
            />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}><strong>{translate('orActingAsProxy')}:</strong></Col>
        </Row>
        {proxiesList}
        <br />
        <Row>
          <Col xs={3}>
            <Button onClick={onCancel} buttonStyle="secondary" fullWidth>{translate('cancel')}</Button>
          </Col>
          <Col xs={3}>
            <Button type="submit" fullWidth>{translate('continue')}</Button>
          </Col>
        </Row>
      </form>
    );
  }
}

export default reduxForm({
  form: 'proxyForm',
})(ProxyForm);
