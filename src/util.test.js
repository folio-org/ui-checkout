import {
  render,
  screen,
} from '@testing-library/react';

import '../test/jest/__mock__';

import {
  getFullName,
  getCheckoutSettings,
  getPatronIdentifiers,
  buildIdentifierQuery,
  buildRequestQuery,
  getPatronBlocks,
  shouldStatusModalBeShown,
  renderOrderedPatronBlocks,
} from './util';
import {
  defaultPatronIdentifier,
  OPEN_REQUEST_STATUSES,
} from './constants';

describe('util', () => {
  const lastName = 'LastName';
  const firstName = 'FirstName';
  const middleName = 'MiddleName';
  const personal = {
    lastName,
    firstName,
  };
  const user = {
    personal,
  };
  const mockId = '12345678';
  const settings = [{ value: '{"prefPatronIdentifier": "barcode,id"}' }];
  const emptySettings = [{ value: '' }];
  const { OPEN_AWAITING_PICKUP } = OPEN_REQUEST_STATUSES;

  describe('getFullName', () => {
    it('should not return user personal data', () => {
      expect(getFullName({})).toEqual(',  ');
    });

    it('should return last name', () => {
      expect(getFullName({
        personal: {
          lastName,
        },
      })).toEqual('LastName,  ');
    });

    it('should return last name and first name', () => {
      expect(getFullName(user)).toEqual('LastName, FirstName ');
    });

    it('should return last name, first name and middle name', () => {
      expect(getFullName({
        personal: {
          ...personal,
          middleName,
        },
      })).toEqual('LastName, FirstName MiddleName');
    });

    it('should return last name, preferred first name and middle name', () => {
      const preferredFirstName = 'PreferredFirstName';
      expect(getFullName({
        personal: {
          ...personal,
          middleName,
          preferredFirstName,
        },
      })).toEqual('LastName, PreferredFirstName MiddleName');
    });

    it('should handle empty preferred first name', () => {
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
        .toEqual(`(requesterId==${mockId} and pickupServicePointId=${mockId} and status=="${OPEN_AWAITING_PICKUP}")`);
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
      render(renderOrderedPatronBlocks([{ id: 0, desc: 'Description' }]));

      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should render patron blocks with message field content as fallback', () => {
      render(renderOrderedPatronBlocks([{ id: 0, message: 'Message' }]));

      expect(screen.getByText('Message')).toBeInTheDocument();
    });

    it('should render patron blocks empty if no fallbacks are present', () => {
      render(renderOrderedPatronBlocks([{ id: 0 }]));

      expect(screen.getByTestId('block-message')).toBeEmptyDOMElement();
    });
  });
});
