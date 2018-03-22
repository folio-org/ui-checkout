import { get, isString, isArray, isObject, forOwn } from 'lodash';
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

export function translateMessage(message, values, options = {}, stripes) {
  const { namespace } = options;
  const id = namespace ? `${namespace}.${message}` : message;
  return stripes.intl.formatMessage({ id }, values);
}

export function translateObject(message, values, options = {}, stripes) {
  const messageStr = message[options.key];
  const translated = translateMessage(messageStr, values, options, stripes);
  return Object.assign(message, { [options.key]: translated });
}

// Util function to handle some common translation use cases.
//
// string: message1 - translate(message1, values)
// map: { key1: message1, key2: message2 } - translate(map)
// array of objects: [ { id: 1, value: message1 }, { id: 2, value: message2 } ] - translate(array, {}, { key: 'value' });
//
// Available options:
//
// namespace - prefix each message
// key - used with array of objects to indicate which object's prop should be translated
export function translate(message, ...args) {
  if (isString(message)) {
    return translateMessage(message, ...args);
  }

  if (isArray(message)) {
    return message.map(key => (isObject(key) ?
      translateObject(key, ...args) :
      translateMessage(key, ...args)));
  }

  if (isObject(message)) {
    const messages = {};
    forOwn(message, (value, key) => {
      messages[key] = translateMessage(value, ...args);
    });

    return messages;
  }

  return message;
}
