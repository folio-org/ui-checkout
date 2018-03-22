import { get, isString, isArray, isObject, map } from 'lodash';
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

export function translate(message, ...args) {
  if (isString(message)) {
    return translateMessage(message, ...args);
  }

  if (isArray(message)) {
    return map(message, key =>
      (isObject(message) && options.key) ?
        translateMessage(message, ...args) :
        translateObject(message, ...args)
    );
  }

  if (isObject(message)) {
    const messages = {};
    for (const key in message) {
      messages[key] = translateMessage(message[key], ...args);
    }
    return messages;
  }

  return message;
}

export function translateObject(message, values, options = {}, stripes) {
  const messageStr = message[options.key];
  const translated = translateMessage(messageStr, values, options, stripes);
  return Object.assign(message, { [options.key]: translated });
}

export function translateMessage(message, values, options = {}, stripes) {
  const { namespace } = options;
  const id = options.namespace ? `${namespace}.${message}` : message;
  return stripes.intl.formatMessage({ id }, values);
}
