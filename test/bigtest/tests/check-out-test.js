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
            });
          });
        });
      });
    });
  });
});
