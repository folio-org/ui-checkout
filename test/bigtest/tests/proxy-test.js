import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';

const checkOut = new CheckOutInteractor();
const proxy = {
  barcode: 'deadbeef',
  personal: {
    firstName: 'The',
    lastName: 'Patron',
  },
};
const sponsor = {
  barcode: 'c0ffee',
  personal: {
    firstName: 'The',
    lastName: 'Sponsor',
  },
};

describe('checkout with proxy', function () {
  setupApplication({
    scenarios: ['proxies'],
  });


  beforeEach(function () {
    return this.visit('/checkout', () => {
      expect(checkOut.$root).to.exist;
    });
  });

  describe('checkout', () => {
    beforeEach(async function () {
      await checkOut
        .fillPatronBarcode(proxy.barcode)
        .clickPatronBtn()
        .whenUserIsLoaded();
    });

    it('proxy modal is displayed', () => {
      expect(checkOut.proxyModal.modalPresent).to.be.true;
    });

    describe('click cancel', () => {
      beforeEach(async function () {
        await checkOut.proxyModal.clickCancel();
      });

      it('closes proxy modal', () => {
        expect(checkOut.proxyModal.modalPresent).to.be.false;
      });

      it('patron information is empty', () => {
        expect(checkOut.patronDetailIsPresent).to.be.false;
      });
    });

    describe('continue as self', () => {
      beforeEach(async function () {
        await checkOut.proxyModal.clickAsSelf();
        await checkOut.proxyModal.clickContinue();
      });

      it('closes proxy modal', () => {
        expect(checkOut.proxyModal.modalPresent).to.be.false;
      });

      it('displays patron information', () => {
        expect(checkOut.patronDetailIsPresent).to.be.true;
      });

      it('displays patron information', () => {
        expect(checkOut.patronFullName).to.equal(`${proxy.personal.lastName}, ${proxy.personal.firstName}`);
      });
    });

    describe('continue as sponsor', () => {
      beforeEach(async function () {
        await checkOut.proxyModal.clickAsProxy();
        await checkOut.proxyModal.clickContinue();
      });

      it('closes proxy modal', () => {
        expect(checkOut.proxyModal.modalPresent).to.be.false;
      });

      it('displays patron information', () => {
        expect(checkOut.patronDetailIsPresent).to.be.true;
      });

      it('borrower information contains sponsor details', () => {
        expect(checkOut.patronFullName).to.equal(`${sponsor.personal.lastName}, ${sponsor.personal.firstName}`);
      });

      it('displays proxy information', () => {
        expect(checkOut.patronDetailIsPresent).to.be.true;
      });

      it('proxy information information contains patron details', () => {
        expect(checkOut.proxyFullName).to.equal(`${proxy.personal.lastName}, ${proxy.personal.firstName}`);
      });
    });
  });
});
