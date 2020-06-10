import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';

const checkOut = new CheckOutInteractor();

describe('Patron blocks', () => {
  describe('manual block', () => {
    setupApplication({
      scenarios: ['manualPatronBlocks'],
    });

    beforeEach(function () {
      return this.visit('/checkout', () => {
        expect(checkOut.$root).to.exist;
      });
    });

    describe('entering a blocked patron barcode', () => {
      beforeEach(async function () {
        const user = this.server.create('user', {
          barcode: '654321',
          personal: {
            firstName: 'Bob',
            lastName: 'Brown',
          },
        });
        this.server.create('manualblock', { userId: user.id, id: '46399627-08a9-414f-b91c-a8a7ec850d03' });

        await checkOut
          .fillPatronBarcode('654321')
          .clickPatronBtn()
          .whenUserIsLoaded();
      });

      it('shows the patron block modal', () => {
        expect(checkOut.blockModal.modalPresent).to.be.true;
      });
    });
  });
});
