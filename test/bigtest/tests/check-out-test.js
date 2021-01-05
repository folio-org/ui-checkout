import React from 'react';
import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';
import { Response } from 'miragejs';

import { Button } from '@folio/stripes/components';

import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';
import { loanPolicyId } from '../constants';

const itemModalStatuses = [
  'Missing',
  'Withdrawn',
  'Lost and paid',
];

// Assumed to be several non-checked out item statuses
const nonCheckedOutItemStatuses = [
  'Intellectual item',
];

describe('CheckOut', () => {
  setupApplication({
    modules: [{
      type: 'plugin',
      name: '@folio/plugin-find-user',
      displayName: 'ui-checkout.patronLookup',
      pluginType: 'find-user',
      /* eslint-disable-next-line react/prop-types */
      module: ({ selectUser }) => (
        <Button
          id="clickable-find-user"
          buttonStyle="link"
          onClick={() => { selectUser({ id: 1, barcode: '123456' }); }}
        >
          Patron look-up
        </Button>
      ),
    },
    {
      type: 'plugin',
      name: '@folio/plugin-create-inventory-records',
      pluginType: 'create-inventory-records',
      module: () => (
        <Button
          id="clickable-create-inventory-records"
          buttonStyle="default"
        >
          New fast add record
        </Button>
      ),
    }],
  });

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

  it('has a button for New fast add record', () => {
    expect(checkOut.createInventoryEnterBtnPresent).to.be.true;
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

      this.server.create('request', {
        pickupServicePointId: '1',
        status: 'Open - Awaiting pickup'
      });

      await checkOut
        .fillPatronBarcode('123456')
        .clickPatronBtn();
    });

    it('displays patron information', () => {
      expect(checkOut.patronFullName).to.equal('Brown, Bob');
    });

    it('showing awaiting pickup modal', () => {
      expect(checkOut.patronEnterBtnPresent).to.be.true;
    });

    it('shows correct amount of open requests', () => {
      expect(checkOut.openRequestsCount.text).to.equal('1');
      expect(checkOut.openRequestsCount.$root.attributes.href).to.exist;
    });
  });

  describe('entering no patron data', () => {
    beforeEach(async function () {
      await checkOut.clickPatronBtn();
    });

    it('returns an error', () => {
      expect(checkOut.patronErrorPresent).to.be.true;
    });
  });

  describe('entering bad patron data', () => {
    beforeEach(async function () {
      await checkOut
        .fillPatronBarcode('zvbxrpl')
        .clickPatronBtn();
    });

    it('returns an error', () => {
      expect(checkOut.patronErrorPresent).to.be.true;
    });
  });

  describe('select user via plugin', () => {
    beforeEach(async function () {
      this.server.create('user', {
        barcode: '123456',
        personal: {
          firstName: 'Bob',
          lastName: 'Brown',
        },
      });

      await checkOut
        .clickFindUserBtn();
    });

    it('displays patron information', () => {
      expect(checkOut.patronFullName).to.equal('Brown, Bob');
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

    describe('checking out a single item successfully', () => {
      beforeEach(async function () {
        this.server.create('item', {
          barcode: '123',
          title: 'Book 1',
        });

        await checkOut.checkoutItem('123');
      });

      it('shows a list of checked out items', () => {
        expect(checkOut.scanItems.itemListPresent).to.be.true;
        expect(checkOut.items().length).to.equal(1);
      });

      it('should hide item list empty message during checkout', () => {
        expect(checkOut.itemListEmptyMessage).to.equal('');
      });
    });

    describe('checking out a single item unsuccessfully', () => {
      beforeEach(async function () {
        this.server.post('/circulation/check-out-by-barcode', {}, 500);
        await checkOut.checkoutItem('123');
      });

      it('should hide item list empty message during checkout', () => {
        expect(checkOut.itemListEmptyMessage).to.equal('');
      });
    });

    nonCheckedOutItemStatuses.forEach(status => {
      describe(`checking out item with status ${status}`, () => {
        let item;
        let errorMessage;

        beforeEach(async function () {
          const intellectualItem = this.server.create('item', {
            status: {
              name: status,
            },
          });

          this.server.post('/circulation/check-out-by-barcode', (schema, request) => {
            const params = JSON.parse(request.requestBody);
            item = schema.items.findBy({ barcode: params.itemBarcode });
            errorMessage = `${item.title} (${item.materialType.name}) (Barcode: ${item.barcode}) has the item status ${item.status.name} and cannot be checked out`;

            return new Response(422, { 'Content-Type': 'application/json' }, {
              errors: [{
                message: errorMessage,
                parameters: [{
                  key : 'itemBarcode',
                  value : params.itemBarcode,
                }]
              }]
            });
          });

          await checkOut.checkoutItem(intellectualItem.barcode);
        });

        it('should show error modal', () => {
          expect(checkOut.errorModal.isPresent).to.be.true;
        });

        it('should show error message', () => {
          expect(checkOut.errorModal.content).to.equal(errorMessage);
        });
      });
    });

    describe('using the item menu', () => {
      let loan;
      beforeEach(async function () {
        this.server.create('item', {
          barcode: '123',
          title: 'A',
          instanceId: 'instance1',
          holdingsRecordId: 'holdings1',
        });
        loan = this.server.create('loan', { itemId: '1' });

        await checkOut
          .checkoutItem('123')
          .itemMenu.clickItemMenu();
      });

      describe('choosing item details', () => {
        beforeEach(async function () {
          await checkOut.itemMenu.selectItemDetails();
        });

        it('redirects to item details page', function () {
          const { search, pathname } = this.location;
          expect(pathname + search).to.include('/inventory/view/instance1/holdings1/1');
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
          expect(pathname + search).to.include(`/settings/circulation/loan-policies/${loanPolicyId}`);
        });
      });

      describe('changing due date', () => {
        beforeEach(async function () {
          await checkOut.itemMenu.changeDueDate();
        });

        it('shows the change date dialog', () => {
          expect(checkOut.itemMenu.changeDueDateDialogPresent).to.be.true;
        });

        describe('closing change date dialog', () => {
          beforeEach(async function () {
            await checkOut.itemMenu.clickCloseDueDate();
          });

          it('closes the change date dialog', () => {
            expect(checkOut.itemMenu.changeDueDateDialogPresent).to.be.false;
          });
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

        await checkOut.checkoutItem('123');
      });

      it('shows multipiece modal', () => {
        expect(checkOut.multipieceModal.present).to.be.true;
      });

      describe('cancelling the multipiece modal', () => {
        beforeEach(async function () {
          await checkOut.multipieceModal.clickCancel();
        });

        it('clears the barcode field', () => {
          expect(checkOut.itemBarcode).to.equal('');
        });
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
              source: {
                personal: {
                  firstName: 'John',
                  lastName: 'Doe',
                }
              },
              date: '2019-08-06T08:06:48.551+0000',
            }
          ],
        });

        await checkOut.checkoutItem('123');
      });

      it('shows checkoutNote modal', () => {
        expect(checkOut.checkoutNoteModal.present).to.be.true;
      });

      describe('cancelling the checkout note modal', () => {
        beforeEach(async function () {
          await checkOut.checkoutNoteModal.clickCancel();
        });

        it('clears the barcode field', () => {
          expect(checkOut.itemBarcode).to.equal('');
        });
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
              source: {
                personal: {
                  firstName: 'John',
                  lastName: 'Doe',
                }
              },
              date: '2019-08-06T08:06:48.551+0000',
            }
          ],
        });

        await checkOut.checkoutItem('123');
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
              source: {
                personal: {
                  firstName: 'John',
                  lastName: 'Doe',
                }
              },
              date: '2019-08-06T08:06:48.551+0000',
            }
          ],
        });

        await checkOut.checkoutItem('245');
        await checkOut.checkoutNoteModal.clickConfirm();
        await checkOut.selectElipse();
        await checkOut.awaitDropdownPresent;
      });

      it('shows checkout Notes option on the action menu', () => {
        expect(checkOut.checkoutNotes.isPresent).to.be.true;
      });
    });
  });

  describe('checkout multiple items', () => {
    let items;
    let user;
    const itemsAmount = 2;

    beforeEach(async function () {
      user = this.server.create('user');
      items = this.server.createList('item', itemsAmount, 'withLoan');

      await checkOut
        .fillPatronBarcode(user.barcode.toString())
        .clickPatronBtn()
        .whenUserIsLoaded();


      for (const [index, item] of items.entries()) {
        // eslint-disable-next-line no-await-in-loop
        await checkOut
          .fillItemBarcode(item.barcode)
          .clickItemBtn()
          .items(index).whenLoaded();
      }
    });

    it(`should be proper amount of items - ${itemsAmount}`, () => {
      expect(checkOut.items().length).to.equal(itemsAmount);
    });

    it('newest item should be on top', () => {
      expect(checkOut.items(0).barcode.text).to.equal(items[1].barcode.toString());
    });
  });

  describe('sorting items', () => {
    beforeEach(async function () {
      const user = this.server.create('user');

      await checkOut
        .fillPatronBarcode(user.barcode.toString())
        .clickPatronBtn()
        .whenUserIsLoaded();

      this.server.create('item', {
        barcode: '123',
        title: 'A',
      });
      this.server.create('item', {
        barcode: '456',
        title: 'C',
      });
      this.server.create('item', {
        barcode: '789',
        title: 'B',
      });

      // The checkout list places new items on top, so checking out in this order will
      // result in a list as follows:
      // No 3 => 'B' (first in list)
      // No 2 => 'C'
      // No 1 => 'A' (last in list)
      await checkOut
        .checkoutItem('123')
        .items(0).whenLoaded();

      await checkOut.checkoutItem('456')
        .items(1)
        .whenLoaded();

      await checkOut.checkoutItem('789')
        .items(2)
        .whenLoaded();

      await checkOut.whenItemListIsPresent();
    });

    it('shows the list of checked-out items', () => {
      expect(checkOut.itemsCount).to.equal(3);
    });

    it('shows the first item first before sort', () => {
      expect(checkOut.items(0).title.text).to.equal('B');
    });

    describe('clicking a header to sort', () => {
      const titleColumnIndex = 2;
      beforeEach(async function () {
        const titleHeader = checkOut.itemList.headers(titleColumnIndex);
        await titleHeader.click();
      });

      it('sorts the list of items alphabetically, ascending', () => {
        expect(checkOut.itemList.headers(titleColumnIndex).isSortHeader).to.be.true;
        expect(checkOut.itemList.rows(0).cells(titleColumnIndex).content).to.equal('A');
        expect(checkOut.itemList.rows(2).cells(titleColumnIndex).content).to.equal('C');
      });
    });

    describe('clicking a header twice to reverse sort, descending', () => {
      const titleColumnIndex = 2;
      beforeEach(async function () {
        const titleHeader = checkOut.itemList.headers(titleColumnIndex);
        await titleHeader.click();
        await titleHeader.click();
      });

      it('sorts the list of items alphabetically', () => {
        expect(checkOut.itemList.headers(titleColumnIndex).isSortHeader).to.be.true;
        expect(checkOut.itemList.rows(0).cells(titleColumnIndex).content).to.equal('C');
        expect(checkOut.itemList.rows(2).cells(titleColumnIndex).content).to.equal('A');
      });
    });
  });

  describe('asks for confirmation before checking out items with special status', () => {
    itemModalStatuses.forEach(status => {
      describe(`Checking out item with status ${status}`, function () {
        beforeEach(async function () {
          const user = this.server.create('user');
          this.server.create('item', 'withLoan', {
            barcode: '123',
            status: { name: status },
          });

          await checkOut
            .fillPatronBarcode(user.barcode.toString())
            .clickPatronBtn()
            .whenUserIsLoaded();

          await checkOut
            .fillItemBarcode('123')
            .clickItemBtn();
        });

        it('shows the status confirmation modal', () => {
          expect(checkOut.confirmStatusModal.isPresent).to.be.true;
        });
      });
    });
  });

  describe('shows and hides all pre checkout modals one after another', () => {
    beforeEach(async function () {
      const user = this.server.create('user');
      this.server.create('item', 'withLoan', {
        barcode: '123',
        numberOfPieces: 2,
        descriptionOfPieces: 'book + dvd',
        status: { name: 'Withdrawn' },
        circulationNotes: [
          {
            note: 'test note',
            noteType: 'Check out',
            staffOnly: false,
            source: {
              personal: {
                firstName: 'John',
                lastName: 'Doe',
              }
            },
            date: '2019-08-06T08:06:48.551+0000',
          }
        ],
      });

      await checkOut
        .fillPatronBarcode(user.barcode.toString())
        .clickPatronBtn()
        .whenUserIsLoaded();

      await checkOut
        .fillItemBarcode('123')
        .clickItemBtn();

      await checkOut.confirmStatusModal.confirmButton.click();
      await checkOut.checkoutNoteModal.clickConfirm();
      await checkOut.multipieceModal.clickConfirm();
    });

    it('hides all pre checkout modals', () => {
      expect(checkOut.confirmStatusModalPresent).to.be.false;
      expect(checkOut.multipieceModal.present).to.be.false;
      expect(checkOut.checkoutNoteModal.present).to.be.false;
    });

    describe('ending a session', () => {
      beforeEach(async function () {
        await checkOut.clickEndSessionBtn();
      });

      it('resets the checkout session', () => {
        expect(checkOut.scanItems.itemListPresent).to.be.false;
        expect(checkOut.endSessionBtnPresent).to.be.false;
      });
    });
  });

  describe('when the app is visited after checking in an item', () => {
    beforeEach(async function () {
      const user = this.server.create('user', {
        personal: {
          firstName: 'Bob',
          lastName: 'Brown',
        },
      });

      const item = this.server.create('item');

      return this.visit({
        pathname: '/checkout',
        state: {
          itemBarcode: item.barcode,
          patronBarcode: user.barcode,
        }
      });
    });

    it('should display patron information', () => {
      expect(checkOut.patronFullName).to.equal('Brown, Bob');
    });

    it('should show a list of checked out items', () => {
      expect(checkOut.scanItems.itemListPresent).to.be.true;
      expect(checkOut.items().length).to.equal(1);
    });
  });
});
