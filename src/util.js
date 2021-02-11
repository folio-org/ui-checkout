import {
  get,
  includes,
} from 'lodash';

import {
  defaultPatronIdentifier,
  patronIdentifierMap,
  statuses,
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

export function getCheckoutSettings(checkoutSettings) {
  if (!checkoutSettings.length) return undefined;

  try {
    return JSON.parse(checkoutSettings[0].value);
  } catch (e) {
    return {};
  }
}

export function getPatronIdentifiers(checkoutSettings) {
  const settings = getCheckoutSettings(checkoutSettings);

  if (settings && settings.prefPatronIdentifier) {
    const idents = settings.prefPatronIdentifier;
    if (idents) return idents.split(',');
  }

  return [defaultPatronIdentifier];
}

export function buildIdentifierQuery(patron, idents) {
  const query = idents.map(ident => `${patronIdentifierMap[ident]}=="${patron.identifier}"`);
  return `(${query.join(' OR ')})`;
}

export function buildRequestQuery(requesterId, servicePointId) {
  return `(requesterId==${requesterId} and
    pickupServicePointId=${servicePointId} and
    status=="Open - Awaiting pickup")`;
}

export function to(promise) {
  return promise
    .then(data => [null, data])
    .catch(err => [err]);
}

export function shouldStatusModalBeShown(item) {
  return includes([
    statuses.IN_PROCESS_NON_REQUESTABLE,
    statuses.LONG_MISSING,
    statuses.LOST_AND_PAID,
    statuses.MISSING,
    statuses.RESTRICTED,
    statuses.UNAVAILABLE,
    statuses.UNKNOWN,
    statuses.WITHDRAWN,
  ], item?.status?.name);
}
