import {
  beforeEach,
  describe,
  it
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';
import translations from '../../../translations/ui-checkout/en';
import {
  loanPolicyWithLimitName,
  barcode,
  barcodeWithLimitLoanPolicy,
  loanPolicyWithLimitId,
  userBarcode,
} from '../constants';

const checkOut = new CheckOutInteractor();

describe('Override item block', () => {
  let item;
  let user;
  const servicePoint = {
    id: 'servicepointId2',
    name: 'Circ Desk 2',
    code: 'cd2',
    discoveryDisplayName: 'Circulation Desk -- Back Entrance',
    pickupLocation: true
  };

  setupApplication({
    scenarios: ['outOfItemsLimit'],
    currentUser: {
      servicePoints: [servicePoint],
      curServicePoint: servicePoint
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
          lastName: 'Brown'
        },
      });

      item = this.server.create('item', { barcode });
      this.server.get('/loan-policy-storage/loan-policies', {
        'loanPolicies' : [{
          'id' : loanPolicyWithLimitId,
          'name' : loanPolicyWithLimitName,
          'loanable' : true,
          'loansPolicy' : {
            'profileId' : 'Fixed',
            'closedLibraryDueDateManagementId' : 'CURRENT_DUE_DATE',
            'gracePeriod' : {
              'duration' : 1,
              'intervalId' : 'Weeks'
            },
            'fixedDueDateScheduleId' : 'fe837440-381e-4cd7-a102-6e66a90c4a2a',
            'itemLimit' : 1
          },
          'itemLimit' : 1,
          'renewable' : false,
        }],
        'totalRecords' : 1
      });

      await checkOut
        .fillPatronBarcode(user.barcode)
        .clickPatronBtn()
        .fillItemBarcode(item.barcode)
        .clickItemBtn();
    });

    describe('out of item block limit checkout', () => {
      beforeEach(async function () {
        item = this.server.create('item', { barcode: barcodeWithLimitLoanPolicy });

        await checkOut
          .fillItemBarcode(item.barcode)
          .clickItemBtn();
      });

      it('error modal should be displayed', () => {
        expect(checkOut.errorModal.isPresent).to.be.true;
      });

      it('should be displayed', () => {
        expect(checkOut.errorModal.overrideButton.isPresent).to.be.true;
      });

      describe('close error modal', () => {
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
            'userId': user.id,
            'itemId': item.id,
            'status': {
              'name': 'Open'
            },
            'loanDate': '2017-03-05T18:32:31Z',
            'action': 'checkedOutThroughOverride',
            'loanPolicyId': loanPolicyWithLimitId,
            item
          });
        });

        it('override modal should be displayed', () => {
          expect(checkOut.overrideModal.isPresent).to.be.true;
        });

        it('due date picker should not be displayed', () => {
          expect(checkOut.overrideModal.dueDatePicker.isPresent).to.be.false;
        });

        it('comment field should be displayed', () => {
          expect(checkOut.overrideModal.comment.isPresent).to.be.true;
        });

        it('save and close button should be displayed', () => {
          expect(checkOut.overrideModal.saveAndCloseButton.isPresent).to.be.true;
        });

        describe('override item limit', () => {
          beforeEach(async function () {
            await checkOut.overrideModal.comment.fill('textarea', 'test');
            await checkOut.overrideModal.saveAndCloseButton.click();
          });

          it('override modal should not be displayed', () => {
            expect(checkOut.overrideModal.isPresent).to.be.false;
          });

          it('item should be checked out', () => {
            expect(checkOut.items().length).to.equal(1);
          });

          it('should have proper loan policy', () => {
            expect(checkOut.items(0).loanPolicy.text).to.equal(
              `${loanPolicyWithLimitName}${translations['item.block.overrided']}`
            );
          });
        });
      });
    });
  });
});
