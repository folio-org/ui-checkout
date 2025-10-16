import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  getFullName,
  getCheckoutSettings,
  getPatronIdentifiers,
  buildIdentifierQuery,
  buildRequestQuery,
  getPatronBlocks,
  shouldStatusModalBeShown,
  renderOrderedPatronBlocks,
  isDCBItem,
  getFormattedPronouns,
} from './util';
import {
  defaultPatronIdentifier,
  OPEN_REQUEST_STATUSES,
  DCB_HOLDINGS_RECORD_ID,
  DCB_INSTANCE_ID,
} from './constants';

const testIds = {
  blockMessage: 'blockMessage',
};

describe('util', () => {
  const lastName = 'LastName';
  const firstName = 'FirstName';
  const middleName = 'MiddleName';
  const pronouns = 'xy/yx';
  const personal = {
    lastName,
    firstName,
    pronouns,
  };
  const user = {
    personal,
  };
  const mockId = '12345678';
  const settings = [{ value: '{"prefPatronIdentifier": "barcode,id"}' }];
  const emptySettings = [{ value: '' }];
  const { OPEN_AWAITING_PICKUP } = OPEN_REQUEST_STATUSES;

  describe('getFullName', () => {
    it('handles empty personal data', () => {
      expect(getFullName({})).toEqual('');
    });

    it('handles { last }', () => {
      expect(getFullName({
        personal: {
          lastName,
        },
      })).toEqual('LastName');
    });

    it('handles {last, first}', () => {
      expect(getFullName(user)).toEqual('LastName, FirstName');
    });

    it('handles { last, first, middle }', () => {
      expect(getFullName({
        personal: {
          ...personal,
          middleName,
        },
      })).toEqual('LastName, FirstName MiddleName');
    });

    it('handles preferred', () => {
      const preferredFirstName = 'PreferredFirstName';

      expect(getFullName({
        personal: {
          ...personal,
          middleName,
          preferredFirstName,
        },
      })).toEqual('LastName, PreferredFirstName MiddleName');
    });

    it('handles empty preferred value', () => {
      const preferredFirstName = '';

      expect(getFullName({
        personal: {
          ...personal,
          middleName,
          preferredFirstName,
        },
      })).toEqual('LastName, FirstName MiddleName');
    });
  });

  describe('getFormattedPronouns', () => {
    it('returns formatted pronouns', () => {
      expect(getFormattedPronouns(user)).toEqual('(xy/yx)');
    });
  });

  describe('getCheckoutSettings', () => {
    it('should return undefined if input length is 0', () => {
      expect(getCheckoutSettings([])).toEqual(undefined);
    });

    it('should return parsed JSON for a valid input', () => {
      expect(getCheckoutSettings(settings)).toEqual({ prefPatronIdentifier: 'barcode,id' });
    });

    it('should return an empty object if there\'s an error', () => {
      expect(getCheckoutSettings(emptySettings)).toEqual({});
    });
  });

  describe('getPatronIdentifiers', () => {
    it('should return the identifiers from a valid prefs object', () => {
      expect(getPatronIdentifiers(settings)).toEqual(['barcode', 'id']);
    });

    it('should return default identifiers in case of invalid prefs object', () => {
      expect(getPatronIdentifiers(emptySettings)).toEqual([defaultPatronIdentifier]);
    });
  });

  describe('buildIdentifierQuery', () => {
    it('should convert a set of identifiers to a CQL query', () => {
      const idents = getPatronIdentifiers(settings);

      expect(buildIdentifierQuery({ identifier: mockId }, idents))
        .toEqual(`(${idents[0]}=="${mockId}" OR ${idents[1]}=="${mockId}")`);
    });
  });

  describe('buildRequestQuery', () => {
    it('should convert requesterId to a CQL query', () => {
      expect(buildRequestQuery(mockId))
        .toEqual(`(requesterId==${mockId} and status=="${OPEN_AWAITING_PICKUP}")`);
    });

    it('should convert requesterId and servicePointId to a CQL query', () => {
      expect(buildRequestQuery(mockId, mockId))
        .toEqual(`(requesterId==${mockId} and pickupServicePointId==${mockId} and status=="${OPEN_AWAITING_PICKUP}")`);
    });
  });

  describe('getPatronBlocks', () => {
    const manualBlock = { borrowing: true, expirationDate: '2101-01-01' };
    const automatedBlock = { blockBorrowing: true };

    it('should return patron blocks fulfilling the requirements', () => {
      expect(getPatronBlocks([manualBlock], [automatedBlock]))
        .toEqual([automatedBlock, manualBlock]);
    });

    it('should return empty array if patron blocks don\'t fulfill the requirements', () => {
      expect(getPatronBlocks([{ ...manualBlock, borrowing: false }], []))
        .toEqual([]);
    });

    it('should return empty array if no args are provided', () => {
      expect(getPatronBlocks()).toEqual([]);
    });
  });

  describe('shouldStatusModalBeShown', () => {
    it('should return true if item status is in the list', () => {
      expect(shouldStatusModalBeShown({ status: { name: 'Unknown' } }))
        .toEqual(true);
    });

    it('should return false if item status is not in the list', () => {
      expect(shouldStatusModalBeShown({ status: { name: 'U-02' } })).toEqual(false);
    });
  });

  describe('renderOrderedPatronBlocks', () => {
    it('should render patron blocks with desc field content', () => {
      const description = 'Description';

      render(renderOrderedPatronBlocks([{ id: 0, desc: description }]));

      expect(screen.getByText(description)).toBeInTheDocument();
    });

    it('should render patron blocks with message field content as fallback', () => {
      const message = 'Message';

      render(renderOrderedPatronBlocks([{ id: 0, message }]));

      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should render patron blocks empty if no fallbacks are present', () => {
      render(renderOrderedPatronBlocks([{ id: 0 }]));

      expect(screen.getByTestId(testIds.blockMessage)).toBeEmptyDOMElement();
    });
  });

  describe('isDCBItem ', () => {
    it('should return true when both item instance id and item holdings record id are DCB_INSTANCE_ID and DCB_HOLDINGS_RECORD_ID respectively', () => {
      const item = {
        instanceId: DCB_INSTANCE_ID,
        holdingsRecordId: DCB_HOLDINGS_RECORD_ID,
      };
      expect(isDCBItem(item)).toBeTruthy();
    });

    it('should return false when item instance id is DCB_INSTANCE_ID and item holdings record id is not DCB_HOLDINGS_RECORD_ID', () => {
      const item = {
        instanceId: DCB_INSTANCE_ID,
        holdingsRecordId: 'test',
      };
      expect(isDCBItem(item)).toBeFalsy();
    });

    it('should return false when item instance id is not DCB_INSTANCE_ID and item holdings record id is DCB_HOLDINGS_RECORD_ID', () => {
      const item = {
        instanceId: 'test',
        holdingsRecordId: DCB_HOLDINGS_RECORD_ID,
      };
      expect(isDCBItem(item)).toBeFalsy();
    });

    it('should return false when item instance id is not DCB_INSTANCE_ID and item holdings record id is not DCB_HOLDINGS_RECORD_ID', () => {
      const item = {
        instanceId: 'test',
        holdingsRecordId: 'test',
      };
      expect(isDCBItem(item)).toBeFalsy();
    });
  });
});
