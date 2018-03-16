import { get } from 'lodash';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react';
import { FormattedTime } from 'react-intl';

import { defaultPatronIdentifier, patronIdentifierMap } from './constants';

// serialized object into http params
export function toParams(obj) {
  return Object.entries(obj).map(([key, val]) => `${key}=${val}`).join('&');
}

export function getFullName(user) {
  return `${get(user, ['personal', 'lastName'], '')},
    ${get(user, ['personal', 'firstName'], '')}
    ${get(user, ['personal', 'middleName'], '')}`;
}

export function formatTime(dateStr) {
  if (!dateStr) return dateStr;
  const localDateStr = moment(dateStr).local().format();
  return (<FormattedTime value={localDateStr} />);
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
