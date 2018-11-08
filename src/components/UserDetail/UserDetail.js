import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Col, KeyValue, Row } from '@folio/stripes/components';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { getFullName } from '../../util';
import css from './UserDetail.css';

class UserDetail extends React.Component {
  static manifest = Object.freeze({
    patronGroups: {
      type: 'okapi',
      path: 'groups?query=(id=!{user.patronGroup})',
      records: 'usergroups',
    },
    openLoansCount: {
      type: 'okapi',
      path: 'circulation/loans?query=(userId=!{user.id} and status.name<>Closed)&limit=1',
    },
  });

  static propTypes = {
    user: PropTypes.object,
    label: PropTypes.node,
    settings: PropTypes.arrayOf(PropTypes.object),
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      openLoansCount: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    renderLoans: PropTypes.bool,
  };

  getUserValue = (user) => {
    const path = `/users/view/${user.id}`;

    return (
      <span>
        <Link className={css.marginRight} to={path}>
          <strong>{getFullName(user)}</strong>
        </Link>
        <strong>
          <FormattedMessage id="ui-checkout.user.detail.barcode" />
        </strong>
        {' '}
        {user.barcode ? (<Link to={path}>{user.barcode}</Link>) : '-'}
      </span>
    );
  }

  renderLoans() {
    if (!this.props.renderLoans) return null;
    const openLoansCount = _.get(this.props.resources.openLoansCount, ['records', '0', 'totalRecords'], 0);
    const openLoansPath = `/users/view/${this.props.user.id}?layer=open-loans&query=`;
    const openLoansLink = <Link to={openLoansPath}>{openLoansCount}</Link>;

    return (
      <div className={css.section}>
        <Row>
          <Col xs={4}>
            <KeyValue
              label={<FormattedMessage id="ui-checkout.openLoans" />}
              value={openLoansLink}
            />
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const { user, resources, label, settings } = this.props;
    const patronGroups = (resources.patronGroups || {}).records || [];
    const patronGroup = patronGroups[0] || {};
    const hasProfilePicture = !!(settings.length && settings[0].value === 'true');
    const statusVal = (_.get(user, ['active'], '') ? 'ui-checkout.active' : 'ui-checkout.inactive');

    return (
      <div>
        <div>
          <Row>
            <Col xs={hasProfilePicture ? 10 : 12}>
              <div className={`${css.section} ${css.active}`}>
                <KeyValue label={label} value={this.getUserValue(user)} />
              </div>
            </Col>
            { hasProfilePicture &&
              <Col xs={2}>
                <img src="http://placehold.it/60x60" alt="presentation" />
              </Col>
            }
          </Row>
        </div>

        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue
                label={<FormattedMessage id="ui-checkout.patronGroup" />}
              >
                {patronGroup.group}
              </KeyValue>
            </Col>
            <Col xs={4}>
              <KeyValue
                label={<FormattedMessage id="ui-checkout.status" />}
              >
                <FormattedMessage id={statusVal} />
              </KeyValue>
            </Col>
            <Col xs={4}>
              <KeyValue
                label={<FormattedMessage id="ui-checkout.userExpiration" />}
                value={user.expirationDate ? <FormattedDate value={user.expirationDate} /> : '-'}
              />
            </Col>
          </Row>
        </div>

        { this.renderLoans() }
      </div>
    );
  }
}

export default UserDetail;
