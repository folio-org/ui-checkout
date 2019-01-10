import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';
import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';

describe('CheckOut', () => {
  setupApplication();
  const checkOut = new CheckOutInteractor();

  beforeEach(function () {
    return this.visit('/checkout', () => {
      expect(checkOut.$root).to.exist;
    });
  });

  it('has a patron identifier field', () => {
    expect(checkOut.patronIdentifierPresent).to.be.true;
  });

  it('has an item barcode field', () => {
    expect(checkOut.itemBarcodePresent).to.be.true;
  });

  it('has an enter button for patron lookup', () => {
    expect(checkOut.patronEnterBtnPresent).to.be.true;
  });

  describe('entering a patron barcode', () => {
    beforeEach(async function () {
      this.server.create('user', {
        barcode: '123456',
        personal: {
          firstName: 'Bob',
          lastName: 'Brown',
        },
      });

      await checkOut
        .fillPatronBarcode('123456')
        .clickPatronBtn();
    });

    it('displays patron information', () => {
      expect(checkOut.patronFullName).to.equal('Brown, Bob');
    });

    describe('showing awaiting pickup modal', () => {
      beforeEach(function () {
        this.server.create('request', {
          requesterId: '1',
          pickupServicePointId: '1'
        });
      });

      it('shows awaiting pickup modal', () => {
        expect(checkOut.patronEnterBtnPresent).to.be.true;
      });
    });
  });

  describe('entering an item barcode', () => {
    beforeEach(async function () {
      this.server.create('user', {
        barcode: '123456',
        personal: {
          firstName: 'Bob',
          lastName: 'Brown',
        },
      });

      await checkOut
        .fillPatronBarcode('123456')
        .clickPatronBtn();
    });

    describe('checking out multipiece item', () => {
      beforeEach(async function () {
        this.server.create('item', {
          barcode: '123',
          numberOfPieces: 2,
          descriptionOfPieces: 'book + dvd',
        });

        await checkOut
          .fillItemBarcode('123')
          .clickItemBtn();
      });

      it('shows multipiece modal', () => {
        expect(checkOut.patronEnterBtnPresent).to.be.true;
      });
    });
  });
});
