import { expect } from 'chai';

import {
  beforeEach,
  describe,
  it
} from '@bigtest/mocha';

import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';
import {
  notLoanableItemBarcode,
  notLoanablePolicyName,
  checkoutErrorMessage,
} from '../constants';

const userBarcode = '123456';
const checkOut = new CheckOutInteractor();
let item;

describe('Handle list of errors', () => {
  const servicePoint = {
    id: 'servicepointId2',
    name: 'Circ Desk 2',
    code: 'cd2',
    discoveryDisplayName: 'Circulation Desk -- Back Entrance',
    pickupLocation: true,
  };

  setupApplication({
    scenarios: ['errorsList'],
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

  describe('fill form with a patron and an item barcode', () => {
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

    describe('try to checkout item', () => {
      beforeEach(async function () {
        item = this.server.create('item', {
          barcode: notLoanableItemBarcode,
          title: 'Harry Potter and the Half-Blood Prince',
          materialType: { name: 'book' },
        });

        await checkOut
          .fillItemBarcode(notLoanableItemBarcode)
          .clickItemBtn();
      });

      it('should display error modal', () => {
        expect(checkOut.errorModal.isPresent).to.be.true;
      });

      it('should contain list of errors ', () => {
        expect(checkOut.errorModal.errorsList.isPresent).to.be.true;
        expect(checkOut.errorModal.errorsListCollection().length).to.equal(2);
      });

      it('should display first error message', () => {
        expect(checkOut.errorModal.errorsListCollection(0).text).to.equal(checkoutErrorMessage);
      });

      it('should display second error message', () => {
        expect(checkOut.errorModal.errorsListCollection(1).text).to.include(`${item.barcode}`);
        expect(checkOut.errorModal.errorsListCollection(1).text).to.include(`${item.title}`);
        expect(checkOut.errorModal.errorsListCollection(1).text).to.include(`${item.materialType.name}`);
        expect(checkOut.errorModal.errorsListCollection(1).text).to.include(notLoanablePolicyName);
      });

      it('should not display override button', () => {
        expect(checkOut.errorModal.overrideButton.isPresent).to.be.false;
      });
    });
  });
});
