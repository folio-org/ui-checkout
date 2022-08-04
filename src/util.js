import React from 'react';
import moment from 'moment';
import { take, orderBy } from 'lodash';

import { Col, Row } from '@folio/stripes/components';

import { defaultPatronIdentifier, statuses } from './constants';

export function getFullName(user) {
  return `${user?.personal?.lastName || ''}, ${user?.personal?.preferredFirstName || user?.personal?.firstName || ''} ${user?.personal?.middleName || ''}`;
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
  const query = idents.map(ident => `${ident}=="${patron.identifier}"`);
  return `(${query.join(' OR ')})`;
}

export function buildRequestQuery(requesterId, servicePointId) {
  const servicePointClause = servicePointId ? `pickupServicePointId=${servicePointId} and` : '';
  return `(requesterId==${requesterId} and
    ${servicePointClause}
    status=="Open - Awaiting pickup")`;
}

export function getPatronBlocks(manualBlocks, automatedBlocks) {
  let manualPatronBlocks = manualBlocks.filter(p => p.borrowing === true) || [];
  manualPatronBlocks = manualPatronBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrAfter(moment().format()));
  const automatedPatronBlocks = automatedBlocks.filter(p => p.blockBorrowing === true) || [];

  return [...automatedPatronBlocks, ...manualPatronBlocks];
}

export function shouldStatusModalBeShown(item) {
  return [
    statuses.IN_PROCESS_NON_REQUESTABLE,
    statuses.LONG_MISSING,
    statuses.LOST_AND_PAID,
    statuses.MISSING,
    statuses.RESTRICTED,
    statuses.UNAVAILABLE,
    statuses.UNKNOWN,
    statuses.WITHDRAWN,
  ].includes(item?.status?.name);
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
