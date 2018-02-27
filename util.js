import _ from 'lodash';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import { defaultPatronIdentifier, patronIdentifierMap } from './constants';

const loanProfileTypes = {
  FIXED: '1',
  ROLLING: '2',
  INDEFINITE: '3',
};

const intervalPeriods = {
  1: 'minutes',
  2: 'hours',
  3: 'days',
  4: 'weeks',
  5: 'months',
};

export function getFullName(user) {
  return `${_.get(user, ['personal', 'lastName'], '')},
    ${_.get(user, ['personal', 'firstName'], '')}
    ${_.get(user, ['personal', 'middleName'], '')}`;
}

export function getDueDate(loan) {
  const loanPolicy = loan.loanPolicy;
  const loanProfile = loanPolicy.loansPolicy || {};
  const renewalProfile = loanProfile.renewalsPolicy || {};
  const period = loanProfile.period || {};

  // rolling type
  if (loanProfile.profileId === loanProfileTypes.ROLLING && loanPolicy.loanable) {
    if (loanPolicy.renewable && !renewalProfile.differentPeriod) {
      return moment().add(period.duration, intervalPeriods[period.intervalId]);
    }

    return moment().add(period.duration, intervalPeriods[period.intervalId]);
  }

  return loan.dueDate;
}

export function getPatronIdentifiers(idents) {
  return (idents.length && idents[0].value) ?
    idents[0].value.split(',') :
    [defaultPatronIdentifier];
}

export function buildIdentifierQuery(patron, idents) {
  const query = idents.map(ident => `${patronIdentifierMap[ident]}="${patron.identifier}"`);
  return `(${query.join(' OR ')})`;
}

export function isProxyDisabled(user, proxyMap) {
  const proxy = proxyMap[user.id];

  return proxy && proxy.meta.expirationDate &&
    moment(proxy.meta.expirationDate).isSameOrBefore(new Date());
}
