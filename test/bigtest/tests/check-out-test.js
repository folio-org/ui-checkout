import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';
import { loanPolicyId } from '../constants';

describe('CheckOut', () => {
  setupApplication(); // { scenarios: ['checkoutByBarcode'] });
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

      await checkOut
        .fillPatronBarcode(user.barcode.toString())
        .clickPatronBtn()
        .whenUserIsLoaded();

      items = this.server.createList('item', 2, 'withLoan');

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
    const titleColumnIndex = 2;
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
        .items(0).whenLoaded()
        .checkoutItem('456')
        .items(1)
        .whenLoaded()
        .checkoutItem('789')
        .items(2)
        .whenLoaded();
    });

    it('shows the list of checked-out items', () => {
      expect(checkOut.itemList.rowCount).to.equal(3);
    });

    it('shows the first item first before sort', () => {
      expect(checkOut.itemList.rows(0).cells(titleColumnIndex).content).to.equal('B');
    });

    // TODO: this test should be re-enabled once UICHKOUT-513 is fixed
    // describe('clicking a header to sort', () => {
    //   beforeEach(async function () {
    //     const titleHeader = checkOut.itemList.headers(titleColumnIndex);
    //     await titleHeader.click().whenListIsSorted(titleColumnIndex);
    //   });

    //   it('sorts the list of items alphabetically', () => {
    //     expect(checkOut.itemList.headers(titleColumnIndex).isSortHeader).to.be.true;
    //     expect(checkOut.itemList.rows(0).cells(titleColumnIndex).content).to.equal('A');
    //     expect(checkOut.itemList.rows(2).cells(titleColumnIndex).content).to.equal('C');
    //   });
    // });
  });

  describe('shows and hides all pre checkout modals one after another', () => {
    beforeEach(async function () {
      const user = this.server.create('user');
      this.server.create('item', 'withLoan', {
        barcode: '123',
        numberOfPieces: 2,
        descriptionOfPieces: 'book + dvd',
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

      await checkOut.checkoutNoteModal.clickConfirm();
      await checkOut.multipieceModal.clickConfirm();
    });

    it('hides all pre checkout modals', () => {
      expect(checkOut.multipieceModal.present).to.be.false;
      expect(checkOut.checkoutNoteModal.present).to.be.false;
    });
  });

  describe('ending a session', () => {
    beforeEach(async function () {
      const user = this.server.create('user');
      this.server.create('item', {
        barcode: '123',
      });

      await checkOut
        .fillPatronBarcode(user.barcode.toString())
        .clickPatronBtn()
        .whenUserIsLoaded();

      await checkOut
        .checkoutItem('123')
        .whenItemListIsPresent()
        .clickEndSessionBtn();
    });

    it('resets the checkout session', () => {
      expect(checkOut.scanItems.itemListPresent).to.be.false;
      expect(checkOut.endSessionBtnPresent).to.be.false;
    });
  });
});
