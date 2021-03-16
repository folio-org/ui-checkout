import { describe, it } from '@bigtest/mocha';
import { expect } from 'chai';
import setupApplication from '../helpers/setup-application';
import {
  buildIdentifierQuery,
  getCheckoutSettings,
  getPatronIdentifiers,
} from '../../../src/util';

describe('Utility functions', () => {
  setupApplication();

  describe('getting checkout settings', () => {
    it('returns undefined for an empty array', () => {
      expect(getCheckoutSettings([])).to.equal(undefined);
    });
    it('returns parsed JSON for a valid input', () => {
      expect(getCheckoutSettings([{ value:'"v1"' }])).to.equal('v1');
    });
    it('returns an empty object if there\'s an error', () => {
      expect(getCheckoutSettings([{ value:'' }])).to.deep.equal({});
    });
  });

  describe('getting patron identifiers', () => {
    it('returns the identifiers from a valid prefs object', () => {
      const settingsArray = [{ value:'{"prefPatronIdentifier":"barcode,id"}' }];
      expect(getPatronIdentifiers(settingsArray)).to.have.members(['barcode', 'id']);
    });
  });

  describe('making a patron identifier query', () => {
    it('converts a set of identifiers to a CQL query', () => {
      const patron = { identifier: '12345678' };
      const idents = ['barcode', 'id'];
      expect(buildIdentifierQuery(patron, idents)).to.equal('(barcode=="12345678" OR id=="12345678")');
    });
  });
});
