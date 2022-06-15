import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import {
  blockedUserId1,
  blockedUserId2,
  blockedMessage,
  manualBlockMessage,
} from '../constants/mockData';

import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';

const checkOut = new CheckOutInteractor();

describe('Patron blocks', () => {
  describe('automated block', () => {
    setupApplication({
      permissions: {
        'automated-patron-blocks.collection.get': true
      }
    });

    beforeEach(async function () {
      this.server.create('user', {
        id: blockedUserId1,
        barcode: '12345',
        personal: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });

      this.visit('/checkout');

      await checkOut
        .fillPatronBarcode('12345')
        .clickPatronBtn()
        .whenUserIsLoaded();
    });

    it('shows the patron block modal', () => {
      expect(checkOut.blockModal.modalPresent).to.be.true;
    });

    it('shows the patron block message', () => {
      expect(checkOut.blockModal.modalMessage(0).text).to.equal(blockedMessage);
    });
  });
  describe('automated block without patron message', () => {
    setupApplication({
      permissions: {
        'automated-patron-blocks.collection.get': true
      }
    });

    beforeEach(async function () {
      this.server.create('user', {
        id: blockedUserId2,
        barcode: '12345',
        personal: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });

      this.visit('/checkout');

      await checkOut
        .fillPatronBarcode('12345')
        .clickPatronBtn()
        .whenUserIsLoaded();
    });

    it('shows the patron block modal', () => {
      expect(checkOut.blockModal.modalPresent).to.be.true;
    });

    it('shows the empty patron block message', () => {
      expect(checkOut.blockModal.modalMessage(0).text).to.equal('');
    });
  });
  describe('manual block', () => {
    setupApplication({
      scenarios: ['manualPatronBlocks'],
    });

    beforeEach(function () {
      return this.visit('/checkout', () => {
        expect(checkOut.$root).to.exist;
      });
    });

    describe('entering a blocked patron barcode', () => {
      beforeEach(async function () {
        const user = this.server.create('user', {
          barcode: '654321',
          personal: {
            firstName: 'Bob',
            lastName: 'Brown',
          },
        });
        this.server.create('manualblock', { userId: user.id, id: '46399627-08a9-414f-b91c-a8a7ec850d03' });

        await checkOut
          .fillPatronBarcode('654321')
          .clickPatronBtn()
          .whenUserIsLoaded();
      });

      it('shows the patron block modal', () => {
        expect(checkOut.blockModal.modalPresent).to.be.true;
      });

      it('shows the patron block message', () => {
        expect(checkOut.blockModal.modalMessage(0).text).to.equal(manualBlockMessage);
      });

      describe('close patron block modal and try to checkout item', () => {
        beforeEach(async function () {
          const item = this.server.create('item');

          await checkOut.blockModal.closeButton.click();
          await checkOut.checkoutItem(item.barcode);
        });

        it('should not display error modal', () => {
          expect(checkOut.errorModal.isPresent).to.be.false;
        });

        it('shows the patron block modal', () => {
          expect(checkOut.blockModal.modalPresent).to.be.true;
        });
      });
    });
  });
});
