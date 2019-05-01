import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';
import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';

describe('CheckOut', () => {
  setupApplication({ scenarios: ['checkoutByBarcode'] });
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

  describe('entering a blocked patron barcode', () => {
    beforeEach(async function () {
      const user = this.server.create('user', {
        barcode: '123456',
        personal: {
          firstName: 'Bob',
          lastName: 'Brown',
        },
      });
      this.server.create('manualblock', { userId: user.id });
    });

    it('shows the patron block modal', () => {
      expect(checkOut.blockModal.modalPresent).to.be.true;
    });
  });

  describe('entering an item barcode', () => {
    beforeEach(async function () {
      this.server.create('user', {
        id: 'user1',
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
        let item = this.server.create('item', {
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
      let loan;
      beforeEach(async function () {
        let item = this.server.create('item', {
          id: 'i1',
          barcode: '123',
          title: 'A',
          instanceId: 'instance1',
          holdingsRecordId: 'holdings1',
        });
        loan = this.server.create('loan', { itemId: 'i1' });
        item = this.server.create('item', {
          barcode: '456',
          title: 'B',
          instanceId: 'instance2',
          holdingsRecordId: 'holdings2'
        });
        this.server.create('loan', { item: item.attsrs, itemId: item.id });
        item = this.server.create('item', {
          barcode: '789',
          title: 'C',
          instanceId: 'instance3',
          holdingsRecordId: 'holdings3'
        });
        this.server.create('loan', { item: item.attrs, itemId: item.id });

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
          expect(pathname + search).to.include('/inventory/view/instance1/holdings1/i1');
        });
      });

      describe('choosing loan details', () => {
        beforeEach(async function () {
          await checkOut.itemMenu.selectLoanDetails();
        });

        it('redirects to (user) loan details page', function () {
          const { search, pathname } = this.location;
          expect(pathname + search).to.include('/users/view/user1');
          expect(search).to.include(`layer=loan&loan=${loan.id}`);
        });
      });

      describe('choosing loan policy', () => {
        beforeEach(async function () {
          await checkOut.itemMenu.selectLoanPolicy();
        });

        it('redirects to the loan policy page', function () {
          const { search, pathname } = this.location;
          expect(pathname + search).to.include('/settings/circulation/loan-policies/policy1');
        });
      });

      describe('changing due date', () => {
        beforeEach(async function () {

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

    describe('checking out item with Checkout Notes', () => {
      beforeEach(async function () {
        this.server.create('item', {
          barcode: '123',
          circulationNotes: [
            {
              note: 'test note',
              noteType: 'Check out',
              staffOnly: false,
            }
          ],
        });

        await checkOut
          .fillItemBarcode('123')
          .clickItemBtn();
      });

      it('shows checkoutNote modal', () => {
        expect(checkOut.checkoutNoteModal.present).to.be.true;
      });
    });

    describe('closes checkoutNote modal', () => {
      beforeEach(async function () {
        this.server.create('item', {
          barcode: '123',
          circulationNotes: [
            {
              note: 'test note',
              noteType: 'Check out',
              staffOnly: false,
            }
          ],
        });

        await checkOut
          .fillItemBarcode('123')
          .clickItemBtn();
        await checkOut.checkoutNoteModal.clickConfirm();
      });

      it('hides checkoutNote modal', () => {
        expect(checkOut.checkoutNoteModal.present).to.be.false;
      });
    });

    describe('showing checkout Notes option', () => {
      beforeEach(async function () {
        this.server.create('item', 'withLoan', {
          barcode: '245',
          circulationNotes: [
            {
              note: 'test note',
              noteType: 'Check out',
              staffOnly: false,
            }
          ],
        });

        await checkOut
          .fillItemBarcode('245')
          .clickItemBtn();
        await checkOut.checkoutNoteModal.clickConfirm();
        await checkOut.selectElipse();
        await checkOut.awaitDropdownPresent;
      });

      it('shows checkout Notes option on the action menu', () => {
        expect(checkOut.checkoutNotes.isPresent).to.be.true;
      });
    });
  });
});
