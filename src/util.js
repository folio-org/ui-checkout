import React from 'react';
import {
  get,
  includes,
  concat,
  take,
  orderBy,
} from 'lodash';
import moment from 'moment';

import {
  Col,
  Row,
} from '@folio/stripes/components';

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

export function getPatronBlocks(manualBlocks, automatedBlocks) {
  let manualPatronBlocks = manualBlocks.filter(p => p.borrowing === true) || [];
  manualPatronBlocks = manualPatronBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrAfter(moment().format()));
  const automatedPatronBlocks = automatedBlocks.filter(p => p.blockBorrowing === true) || [];

  return concat(automatedPatronBlocks, manualPatronBlocks);
}

export function getAllErrorMessages(errors = []) {
  const errorMessages = [];
  errors.forEach(({ message }) => errorMessages.push(message));

  return errorMessages.join(';');
}

export function extractErrorDetails(errors, errorMessage) {
  const singleError = errors.find(({ message }) => message === errorMessage);

  return singleError || {};
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

export function renderOrderedPatronBlocks(patronBlocks) {
  const blocks = take(orderBy(patronBlocks, ['metadata.updatedDate'], ['desc']), 3);
  return blocks.map(block => {
    return (
      <Row key={block.id || block.patronBlockConditionId}>
        <Col xs>
          <b data-test-block-message>{block.desc || block.message || ''}</b>
        </Col>
      </Row>
    );
  });
}
