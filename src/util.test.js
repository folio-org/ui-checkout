import '../test/jest/__mock__';

import {
  getFullName,
} from './util';

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
});
