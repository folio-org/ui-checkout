import React from 'react';
import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { Button } from '@folio/stripes/components';

import setupApplication from '../helpers/setup-application';
import CheckOutInteractor from '../interactors/check-out';

describe('CheckOut With Suspended Accounts', () => {
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

  it('has an enter button for patron lookup', () => {
    expect(checkOut.patronEnterBtnPresent).to.be.true;
  });

  describe('entering a patron barcode', () => {
    beforeEach(async function () {
      const user = this.server.create('user', {
        id: 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd',
        barcode: '123456',
        personal: {
          firstName: 'Bob',
          lastName: 'Brown',
        },
      });

      const loan = this.server.create('loan', {
        id: '8e9f211b-6024-4828-8c14-ace39c6c2863',
        userId: user.id,
        overdueFinePolicyId: () => 'a6130d37-0468-48ca-a336-c2bde575768d',
        lostItemPolicyId: () => '48a3115d-d476-4582-b6a8-55c09eed7ec7',
      });

      const feeFine = this.server.create('feefine', {
        feeFineType: 'Lost item fee',
        defaultAmount: 200
      });

      this.server.create('account', {
        id: 1,
        userId: user.id,
        status: {
          name: 'Open',
        },
        paymentStatus: {
          name: 'Suspended claim returned'
        },
        amount: 200,
        remaining: 20,
        loanId: loan.id,
        feeFineType: feeFine.feeFineType,
        feeFineId: feeFine.id
      });

      this.server.create('account', {
        id: 2,
        userId: user.id,
        status: {
          name: 'Open',
        },
        paymentStatus: {
          name: 'Outstanding'
        },
        amount: 15,
        remaining: 5,
        loanId: loan.id,
        feeFineType: feeFine.feeFineType,
        feeFineId: feeFine.id
      });

      this.server.get('/accounts');

      await checkOut
        .fillPatronBarcode('123456')
        .clickPatronBtn();
    });

    it('displays patron information', () => {
      expect(checkOut.patronFullName).to.equal('Brown, Bob');
    });

    it('display amount of fees/fines suspended', () => {
      expect(checkOut.suspendedAccount.text).to.equal('20.00');
    });
  });
});
