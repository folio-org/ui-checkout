import { get } from 'lodash';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import {
  defaultPatronIdentifier,
  patronIdentifierMap,
  loanProfileTypesMap,
} from './constants';

// serialized object into http params
export function toParams(obj) {
  return Object.entries(obj).map(([key, val]) => `${key}=${val}`).join('&');
}

export function getFullName(user) {
  return `${get(user, ['personal', 'lastName'], '')},
    ${get(user, ['personal', 'firstName'], '')}
    ${get(user, ['personal', 'middleName'], '')}`;
}

export function isRollingProfileType(loanProfile) {
  return (loanProfile.profileId === loanProfileTypesMap.ROLLING ||
    loanProfile.profileId === 'ROLLING');
}

export function isFixedProfileType(loanProfile) {
  return (loanProfile.profileId === loanProfileTypesMap.FIXED ||
    loanProfile.profileId === 'FIXED');
}

export function getDueDate(loan) {
  const loanPolicy = loan.loanPolicy;
  const loanProfile = loanPolicy.loansPolicy || {};

  // fixed type
  if (isFixedProfileType(loanProfile) && loanPolicy.loanable) {
    if (loanPolicy.fixedDueDateSchedule) {
      return loanPolicy.fixedDueDateSchedule.schedule.due;
    }
  }

  return loan.dueDate;
}

export function getFixedDueDateSchedule(schedules) {
  const today = moment(new Date());
  return schedules.find(s =>
    today.isBetween(moment(s.from).startOf('day'), moment(s.to).endOf('day')));
}

export function getPatronIdentifiers(checkoutSettings) {
  if (checkoutSettings.length && checkoutSettings[0].value) {
    try {
      const idents = JSON.parse(checkoutSettings[0].value).prefPatronIdentifier;
      if (idents) return idents.split(',');
    } catch (e) {
      return [defaultPatronIdentifier];
    }
  }

  return [defaultPatronIdentifier];
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
