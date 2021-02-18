import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';

import {
  blockedUserId1,
} from '../constants';

const checkOut = new CheckOutInteractor();

describe('Proxy modal', () => {
  setupApplication({
    scenarios: ['proxies'],
    permissions: {
      'automated-patron-blocks.collection.get': true,
    }
  });

  beforeEach(async function () {
    this.visit('/checkout');

    const user = this.server.create('user', {
      id: blockedUserId1,
      barcode: '12345',
      personal: {
        firstName: 'Bob',
        lastName: 'Brown',
      },
    });
    this.server.create('manualblock', {
      userId: user.id,
      id: '46399627-08a9-414f-b91c-a8a7ec850d03',
    });

    await checkOut
      .fillPatronBarcode('12345')
      .clickPatronBtn()
      .whenUserIsLoaded();
  });

  it('should show the proxy modal', () => {
    expect(checkOut.proxyModal.modalPresent).to.be.true;
  });

  describe('Continue', () => {
    beforeEach(async function () {
      await checkOut.proxyModal.clickContinue();
      await checkOut.blockModal.whenBlockModalLoaded();
    });

    it('should show the block modal after proxy modal', () => {
      expect(checkOut.blockModal.modalPresent).to.be.true;
    });
  });
});
