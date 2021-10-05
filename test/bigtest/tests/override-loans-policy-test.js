import { expect } from 'chai';

import {
  beforeEach,
  describe,
  it
} from '@bigtest/mocha';

import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';
import {
  notLoanablePolicyId,
  notLoanablePolicyName,
  notLoanableItemBarcode,
  userBarcode,
} from '../constants';

const checkOut = new CheckOutInteractor();
let item;
let user;

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
      user = this.server.create('user', {
        barcode: userBarcode,
        personal: {
          firstName: 'Bob',
          lastName: 'Brown',
        },
      });

      await checkOut
        .fillPatronBarcode(userBarcode)
        .clickPatronBtn()
        .whenUserIsLoaded();
    });

    describe('non loanable checkout', () => {
      beforeEach(async function () {
        item = this.server.create('item', { barcode: notLoanableItemBarcode });

        this.server.get('/loan-policy-storage/loan-policies', {
          loanPolicies: [{
            id: notLoanablePolicyId,
            name: notLoanablePolicyName,
            loanable: false
          }],
          totalRecords: 1
        });

        await checkOut
          .fillItemBarcode(notLoanableItemBarcode)
          .clickItemBtn();
      });

      it('error modal should be displayed', () => {
        expect(checkOut.errorModal.isPresent).to.be.true;
      });

      it('close button of error modal should be displayed', () => {
        expect(checkOut.errorModal.closeButton.isPresent).to.be.true;
      });

      it('override button should be displayed', () => {
        expect(checkOut.errorModal.overrideButton.isPresent).to.be.true;
      });

      describe('close button click', () => {
        beforeEach(async function () {
          await checkOut.errorModal.closeButton.click();
        });

        it('should not be displayed', () => {
          expect(checkOut.errorModal.isPresent).to.be.false;
        });
      });

      describe('override button click', () => {
        beforeEach(async function () {
          await checkOut.errorModal.overrideButton.click();

          this.server.post('/circulation/check-out-by-barcode', {
            userId: user.id,
            itemId: item.id,
            status: {
              name: 'Open'
            },
            loanDate: '2017-03-05T18:32:31Z',
            action: 'checkedOutThroughOverride',
            loanPolicyId: notLoanablePolicyId,
            item
          });
        });

        it('should not be displayed', () => {
          expect(checkOut.errorModal.isPresent).to.be.false;
        });

        describe('override modal', () => {
          it('should be displayed', () => {
            expect(checkOut.overrideModal.isPresent).to.be.true;
          });

          it('due date picker should be displayed', () => {
            expect(checkOut.overrideModal.dueDatePicker.isPresent).to.be.true;
          });

          it('comment should be displayed', () => {
            expect(checkOut.overrideModal.comment.isPresent).to.be.true;
          });

          it('save and close button should be displayed', () => {
            expect(checkOut.overrideModal.saveAndCloseButton.isPresent).to.be.true;
          });

          it('cancel button should be displayed', () => {
            expect(checkOut.overrideModal.cancelButton.isPresent).to.be.true;
          });

          it('override button should be displayed', () => {
            expect(checkOut.overrideModal.saveAndCloseButton.isPresent).to.be.true;
          });

          it('override button should be disabled', () => {
            expect(checkOut.overrideModal.saveAndCloseButtonDisabled).to.be.true;
          });

          describe('cancel button click', () => {
            beforeEach(async function () {
              await checkOut.overrideModal.cancelButton.click();
            });

            it('should not be displayed', () => {
              expect(checkOut.overrideModal.isPresent).to.be.false;
            });
          });

          describe('fill in date to make it clickable', () => {
            beforeEach(async function () {
              await checkOut.overrideModal.comment.fill('textarea', 'test');
              await checkOut.overrideModal.dueDatePicker.fill('input', '04/15/2019');
            });

            it('should be active', () => {
              expect(checkOut.overrideModal.saveAndCloseButtonDisabled).to.be.false;
            });

            describe('click on save and close button', () => {
              beforeEach(async function () {
                await checkOut.overrideModal.saveAndCloseButton.click();
              });

              it('override modal should not be displayed', () => {
                expect(checkOut.overrideModal.isPresent).to.be.false;
              });

              it('item should be checked out', () => {
                expect(checkOut.items().length).to.equal(1);
              }).timeout(1000);

              describe('checked out item', () => {
                it('should have proper title', () => {
                  expect(checkOut.items(0).title.text).to.equal(item.title);
                });

                it('should have proper loan policy', () => {
                  expect(checkOut.items(0).loanPolicy.text).to.equal(notLoanablePolicyName);
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
