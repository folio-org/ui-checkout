import React from 'react';
import {
  take,
  orderBy,
} from 'lodash';

import {
  Col,
  Row,
  dayjs,
} from '@folio/stripes/components';

import {
  defaultPatronIdentifier,
  statuses,
  OPEN_REQUEST_STATUSES,
  DCB_HOLDINGS_RECORD_ID,
  DCB_INSTANCE_ID,
  DCB_USER_LASTNAME,
} from './constants';

/**
 * getFullName
 * Format a name like "Last, First Middle" or "Last, Preferred Middle" or
 * "Last, First" or ... you get the idea.
 * @param {*} user
 * @returns {string}
 */
export function getFullName(user) {
  const parts = [
    user?.personal?.preferredFirstName ? user?.personal?.preferredFirstName : user?.personal?.firstName,
    user?.personal?.middleName,
  ];

  return [user?.personal?.lastName, parts.filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

export function getFormattedPronouns(user, withPrefixSpace = false) {
  const pronouns = user?.personal?.pronouns;

  return pronouns ? `${withPrefixSpace ? ' ' : ''}(${pronouns})` : undefined;
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
    return settings.prefPatronIdentifier.split(',');
  }

  return [defaultPatronIdentifier];
}

export function buildIdentifierQuery(patron, idents) {
  const query = idents.map(ident => `${ident}=="${patron.identifier}"`);
  return `(${query.join(' OR ')})`;
}

export function buildRequestQuery(requesterId, servicePointId) {
  const servicePointClause = servicePointId ? `pickupServicePointId==${servicePointId} and ` : '';
  return `(requesterId==${requesterId} and ${servicePointClause}status=="${OPEN_REQUEST_STATUSES.OPEN_AWAITING_PICKUP}")`;
}

export function getPatronBlocks(manualBlocks = [], automatedBlocks = []) {
  let manualPatronBlocks = manualBlocks.filter(p => p.borrowing === true);
  manualPatronBlocks = manualPatronBlocks.filter(p => dayjs(dayjs(p.expirationDate).format()).isSameOrAfter(dayjs().format()));
  const automatedPatronBlocks = automatedBlocks.filter(p => p.blockBorrowing === true);

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
    const key = block.id || block.patronBlockConditionId;
    const content = block.desc || block.message || '';

    return (
      <Row key={key}>
        <Col xs>
          <b
            data-test-block-message
            data-testid="blockMessage"
          >
            {content}
          </b>
        </Col>
      </Row>
    );
  });
}

export const isDCBItem = (item) => item.instanceId === DCB_INSTANCE_ID && item.holdingsRecordId === DCB_HOLDINGS_RECORD_ID;

export const isDCBUser = (user) => user?.lastName === DCB_USER_LASTNAME;
