import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';
import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';

describe('override loan policy', () => {
  setupApplication({ scenarios: ['itemIsNotLoanable'] });
  const checkOut = new CheckOutInteractor();

  beforeEach(function () {
    return this.visit('/checkout', () => {
      expect(checkOut.$root).to.exist;
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

    describe('non loanable checkout', () => {
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

      describe('error modal', () => {
        it('should be displayed', () => {
          expect(checkOut.errorModal.isPresent).to.be.true;
        });

        describe('close button', () => {
          it('should be displayed', () => {
            expect(checkOut.errorModal.closeButton.isPresent).to.be.true;
          });

          describe('close button click', () => {
            beforeEach(async function () {
              await checkOut.errorModal.closeButton.click('button');
            });

            it('should not be displayed', () => {
              expect(checkOut.errorModal.isPresent).to.be.false;
            });
          });
        });

        describe('override button', () => {
          it('should be displayed', () => {
            expect(checkOut.errorModal.overrideButton.isPresent).to.be.true;
          });

          describe('override button click', () => {
            beforeEach(async function () {
              await checkOut.errorModal.overrideButton.click('button');
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
                  expect(checkOut.overrideModal.saveAndCloseButton.isPresent).to.be.true;
                });
              });

              describe('cancel button', () => {
                it('should be displayed', () => {
                  expect(checkOut.overrideModal.cancelButton.isPresent).to.be.true;
                });

                describe('cancel button click', () => {
                  beforeEach(async function () {
                    await checkOut.overrideModal.cancelButton.click('button');
                  });

                  it('should not be displayed', () => {
                    expect(checkOut.overrideModal.isPresent).to.be.false;
                  });
                });
              });

              describe('override button', () => {
                it('should be displayed', () => {
                  expect(checkOut.overrideModal.saveAndCloseButton.isPresent).to.be.true;
                });

                it('should be disabled', () => {
                  expect(checkOut.overrideModal.saveAndCloseButtonDisabled).to.be.true;
                });

                describe('fill in date to make it clickable', () => {
                  beforeEach(async function () {
                    await checkOut.overrideModal.comment.fill('textarea', 'test');
                    await checkOut.overrideModal.dueDatePicker.fill('input', '04/15/2019');
                  });

                  it('should be active', () => {
                    expect(checkOut.overrideModal.saveAndCloseButtonDisabled).to.be.false;
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
