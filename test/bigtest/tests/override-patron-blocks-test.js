import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import { Response } from 'miragejs';

import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';
import translations from '../../../translations/ui-checkout/en';
import {
  barcode,
  userBarcode,
} from '../constants/mockData';

const checkOut = new CheckOutInteractor();

describe('Override patron block', () => {
  let item;
  let newItem;
  let user;
  const servicePoint = {
    id: 'servicepointId2',
    name: 'Circ Desk 2',
    code: 'cd2',
    discoveryDisplayName: 'Circulation Desk -- Back Entrance',
    pickupLocation: true,
  };

  setupApplication({
    scenarios: ['manualPatronBlocks'],
    currentUser: {
      servicePoints: [servicePoint],
      curServicePoint: servicePoint,
    },
  });

  beforeEach(function () {
    return this.visit('/checkout', () => {
      expect(checkOut.$root).to.exist;
    });
  });

  describe('entering patron barcode', () => {
    beforeEach(async function () {
      item = this.server.create('item', { barcode });
      user = this.server.create('user', {
        barcode: userBarcode,
        id: 1,
      });

      await checkOut
        .fillPatronBarcode(user.barcode)
        .clickPatronBtn();
    });

    it('should show patron block modal', () => {
      expect(checkOut.blockModal.modalPresent).to.be.true;
    });

    it('should show override button', () => {
      expect(checkOut.blockModal.overrideButton.isPresent).to.be.true;
    });

    describe('override patron block', () => {
      beforeEach(async () => {
        await checkOut.blockModal.overrideButton.click();
      });

      it('should show override patron block modal', () => {
        expect(checkOut.overrideModal.isPresent).to.be.true;
        expect(checkOut.overrideModal.label.text).to.equal(translations.overridePatronBlock);
      });

      describe('fill override patron block comment', () => {
        beforeEach(async function () {
          await checkOut.overrideModal.comment.fill('textarea', 'Reason');
          await checkOut.overrideModal.saveAndCloseButton.click();
        });

        it('override modal should not be displayed', () => {
          expect(checkOut.overrideModal.isPresent).to.be.false;
        });

        describe('checkout item', () => {
          beforeEach(async function () {
            await checkOut
              .fillItemBarcode(item.barcode)
              .clickItemBtn();
          });

          it('should checkout item', () => {
            expect(checkOut.scanItems.itemListPresent).to.be.true;
          });
        });

        describe('try to checkout not loanable item', () => {
          beforeEach(async function () {
            await checkOut
              .fillItemBarcode(item.barcode)
              .clickItemBtn();

            await this.server.post('circulation/check-out-by-barcode', () => {
              return new Response(422, { 'Content-Type': 'application/json' }, {
                errors: [{
                  message: 'Item is not loanable',
                  code: 'ITEM_NOT_LOANABLE',
                  parameters: [{
                    key: 'itemBarcode',
                    value: '123',
                  }],
                }],
              });
            });
          });

          it('should show error item modal', () => {
            expect(checkOut.errorModal.isPresent).to.be.true;
            expect(checkOut.errorModal.overrideButton.isPresent).to.be.true;
          });

          describe('click override button', () => {
            beforeEach(async () => {
              await checkOut.errorModal.overrideButton.click();
            });

            it('should show override modal', () => {
              expect(checkOut.overrideModal.isPresent).to.be.true;
            });

            it('modal should have correct comment', () => {
              expect(checkOut.overrideModal.commentTextarea.value).to.equal('Reason');
            });

            it('"Save & close" button should be active', () => {
              expect(checkOut.overrideModal.saveAndCloseButtonDisabled).to.be.false;
            });

            describe('fill override modal', () => {
              beforeEach(async () => {
                await checkOut.overrideModal.comment.fill('textarea', 'Reason test');
                await checkOut.overrideModal.dueDatePicker.fill('input', '04/15/2019');
                await checkOut.overrideModal.saveAndCloseButton.click();
              });

              it('should hide override modal', () => {
                expect(checkOut.overrideModal.isPresent).to.be.false;
              });
            });
          });
        });

        describe('try to checkout item when new block appeared', () => {
          beforeEach(async function () {
            this.server.create('manualblock', { userId: user.id });
            newItem = this.server.create('item', { barcode: '111111' });

            await checkOut
              .fillItemBarcode(newItem.barcode)
              .clickItemBtn();
          });

          it('should show patron blocked modal', () => {
            expect(checkOut.blockModal.modalPresent).to.be.true;
          });

          it('should show override button', () => {
            expect(checkOut.blockModal.overrideButton.isPresent).to.be.true;
          });

          describe('override patron block', () => {
            beforeEach(async () => {
              await checkOut.blockModal.overrideButton.click();
            });

            it('should show override patron block modal', () => {
              expect(checkOut.overrideModal.isPresent).to.be.true;
              expect(checkOut.overrideModal.commentTextarea.value).to.equal('Reason');
            });

            describe('fill override patron block comment', () => {
              beforeEach(async function () {
                await checkOut.overrideModal.comment.fill('textarea', 'Reason + another reason');
                await checkOut.overrideModal.saveAndCloseButton.click();
              });

              it('override modal should not be displayed', () => {
                expect(checkOut.overrideModal.isPresent).to.be.false;
              });

              describe('checkout item', () => {
                beforeEach(async function () {
                  await checkOut
                    .fillItemBarcode(newItem.barcode)
                    .clickItemBtn();
                });

                it('should checkout item', () => {
                  expect(checkOut.scanItems.itemListPresent).to.be.true;
                });
              });

              describe('overridden information still available after visiting other pages', () => {
                beforeEach(function () {
                  this.visit('/settings');

                  return this.visit('/checkout', () => {
                    expect(checkOut.$root).to.exist;
                  });
                });

                it('should not show patron blocked modal', () => {
                  expect(checkOut.blockModal.modalPresent).to.be.false;
                });
              });
            });
          });
        });
      });
    });
  });
});
