import { expect } from 'chai';

import {
  beforeEach,
  describe,
  it
} from '@bigtest/mocha';

import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';
import { loanPolicyName } from '../constants';

const itemBarcode = '123';
const userBarcode = '123456';
const checkOut = new CheckOutInteractor();
let item;

describe('override loan policy', () => {
  const servicePoint = {
    id: 'servicepointId2',
    name: 'Circ Desk 2',
    code: 'cd2',
    discoveryDisplayName: 'Circulation Desk -- Back Entrance',
    pickupLocation: true,
  };

  setupApplication({
    scenarios: ['itemIsNotLoanable'],
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

  describe('entering an item barcode', () => {
    beforeEach(async function () {
      this.server.create('user', {
        barcode: userBarcode,
        personal: {
          firstName: 'Bob',
          lastName: 'Brown',
        },
      });

      await checkOut
        .fillPatronBarcode(userBarcode)
        .clickPatronBtn();
    });

    describe('non loanable checkout', () => {
      beforeEach(async function () {
        item = this.server.create('item', { barcode: itemBarcode });

        await checkOut
          .fillItemBarcode(itemBarcode)
          .clickItemBtn();
      });

      describe('error modal', () => {
        it('should be displayed', () => {
          expect(checkOut.errorModal.isPresent).to.be.true;
        });

        describe('close button', () => {
          it('should be displayed', () => {
            expect(checkOut.errorModal.closeBtnIsVisible).to.be.true;
          });

          describe('close button click', () => {
            beforeEach(async function () {
              await checkOut.errorModal.clickCloseBtn();
            });

            it('should not be displayed', () => {
              expect(checkOut.errorModal.isPresent).to.be.false;
            });
          });
        });

        describe('override button', () => {
          it('should be displayed', () => {
            expect(checkOut.errorModal.overrideBtnIsVisible).to.be.true;
          });

          describe('override button click', () => {
            beforeEach(async function () {
              await checkOut.errorModal.clickOverrideBtn();
            });

            it('should not be displayed', () => {
              expect(checkOut.errorModal.isPresent).to.be.false;
            });

            describe('override modal', () => {
              it('should be displayed', () => {
                expect(checkOut.overrideModal.isPresent).to.be.true;
              });

              describe('due date picker', () => {
                it('should be displayed', () => {
                  expect(checkOut.overrideModal.dueDatePicker.isPresent).to.be.true;
                });
              });

              describe('comment', () => {
                it('should be displayed', () => {
                  expect(checkOut.overrideModal.comment.isPresent).to.be.true;
                });
              });

              describe('save and close button', () => {
                it('should be displayed', () => {
                  expect(checkOut.overrideModal.saveAndCloseBtnIsVisible).to.be.true;
                });
              });

              describe('cancel button', () => {
                it('should be displayed', () => {
                  expect(checkOut.overrideModal.cancelBtnIsVisible).to.be.true;
                });

                describe('cancel button click', () => {
                  beforeEach(async function () {
                    await checkOut.overrideModal.clickCancelBtn();
                  });

                  it('should not be displayed', () => {
                    expect(checkOut.overrideModal.isPresent).to.be.false;
                  });
                });
              });

              describe('override button', () => {
                it('should be displayed', () => {
                  expect(checkOut.overrideModal.saveAndCloseBtnIsVisible).to.be.true;
                });

                it('should be disabled', () => {
                  expect(checkOut.overrideModal.saveAndCloseBtnDisabled).to.be.true;
                });

                describe('fill in date to make it clickable', () => {
                  beforeEach(async function () {
                    await checkOut.overrideModal.comment.fill('textarea', 'test');
                    await checkOut.overrideModal.dueDatePicker.fill('input', '04/15/2019');
                  });

                  it('should be active', () => {
                    expect(checkOut.overrideModal.saveAndCloseBtnDisabled).to.be.false;
                  });

                  describe('click on save and close button', () => {
                    beforeEach(async function () {
                      await checkOut.overrideModal.clickSaveAndCloseBtn();
                    });

                    it('override modal should not be displayed', () => {
                      expect(checkOut.overrideModal.isPresent).to.be.false;
                    });

                    it('item should be checked out', () => {
                      expect(checkOut.items().length).to.equal(1);
                    });

                    describe('checked out item', () => {
                      it('should have proper title', () => {
                        expect(checkOut.items(0).title.text).to.equal(item.title);
                      });

                      it('should have proper loan policy', () => {
                        expect(checkOut.items(0).loanPolicy.text).to.equal(loanPolicyName);
                      });

                      it('should have proper barcode', () => {
                        expect(checkOut.items(0).barcode.text).to.equal(item.barcode);
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
