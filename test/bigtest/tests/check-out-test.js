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

    describe('checking out a single item', () => {
      beforeEach(async function () {
        this.server.create('item', {
          barcode: '123',
          title: 'Book 1',
        });
        this.server.create('loan');

        await checkOut
          .fillItemBarcode('123')
          .clickItemBtn();
      });

      it('shows a list of checked out items', () => {
        expect(checkOut.scanItems.itemListPresent).to.be.true;
      });
    });

    describe('using the item menu', () => {
      beforeEach(async function () {
        this.server.create('item', {
          barcode: '123',
          title: 'Book 1',
          instanceId: 'instance1',
          holdingsRecordId: 'holdings1'
        });
        this.server.create('loan');

        await checkOut
          .fillItemBarcode('123')
          .clickItemBtn()
          .itemMenu.clickItemMenu();
      });

      describe('choosing item details', () => {
        beforeEach(async function () {
          await checkOut.itemMenu.selectItemDetails();
        });

        it('redirects to item details page', function () {
          const { search, pathname } = this.location;
          expect(pathname + search).to.include('/inventory/view/instance1/holdings1/123');
        });
      });

      describe('choosing loan details', () => {
        beforeEach(async function () {
          await checkOut.itemMenu.selectLoanDetails();
        });

        it('redirects to (user) loan details page', function () {
          const { search, pathname } = this.location;
          expect(pathname + search).to.include('/users/view/df7f4993-8c14-4a0f-ab63-93975ab01c76');
          expect(search).to.include('layer=loan');
          expect(search).to.include('loan=cf23adf0-61ba-4887-bf82-956c4aae2260');
        });
      });
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
