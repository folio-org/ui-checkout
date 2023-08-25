import React from 'react';
import { IntlProvider } from 'react-intl';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  render,
  screen,
  within,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../test/jest/__mock__';
import buildStripes from '../../../test/jest/__mock__/stripes.mock';

import { refundClaimReturned } from '../../constants';

import Loans from './Loans';

describe('Loans', () => {
  const testIds = {
    loans: 'loans',
    openRequestsCountLink: 'openRequestsCountLink',
    openAccountsCountLink: 'openAccountsCountLink',
    openLoansLink: 'openLoansLink',
  };
  const permissions = {
    viewRequests: 'ui-checkout.viewRequests,ui-requests.view',
    viewFeeFines: 'ui-checkout.viewFeeFines,ui-users.feesfines.view',
    viewLoans: 'ui-checkout.viewLoans,ui-users.loans.view',
  };
  const accountEntry = {
    id: 1,
    paymentStatus: {
      name: refundClaimReturned.PAYMENT_STATUS,
    },
    amount: 200,
    remaining: 20,
  };
  const baseProps = {
    resources: {},
    stripes: buildStripes(),
    user: {
      barcode: 0,
      id: 0,
    },
  };
  const renderComponent = (props) => {
    const combined = {
      ...baseProps,
      ...props
    };

    render(
      <Router>
        <IntlProvider locale="en">
          <Loans {...combined} />
        </IntlProvider>
      </Router>
    );
  };

  describe('with base props', () => {
    beforeEach(() => renderComponent());

    it('should render Loans container', () => {
      expect(screen.getByTestId(testIds.loans)).toBeInTheDocument();
    });
  });

  describe('with various props and permissions', () => {
    it('should render openRequestsCountLink if viewRequests permission is present', () => {
      renderComponent({
        stripes: {
          ...buildStripes(),
          hasPerm: (arg) => arg === permissions.viewRequests,
        }
      });

      expect(screen.getByTestId(testIds.openRequestsCountLink)).toBeInTheDocument();
    });

    it('should render openAccountsCountLink if viewFeeFines permission is present', () => {
      renderComponent({
        resources: {
          openAccounts: {
            records: [
              accountEntry,
            ],
          },
        },
        stripes: {
          ...buildStripes(),
          hasPerm: (arg) => arg === permissions.viewFeeFines,
        }
      });

      expect(screen.getByTestId(testIds.openAccountsCountLink)).toBeInTheDocument();
    });

    it('should render openLoansLink if viewLoans permission is present', () => {
      renderComponent({
        stripes: {
          ...buildStripes(),
          hasPerm: (arg) => arg === permissions.viewLoans,
        }
      });

      expect(screen.getByTestId(testIds.openLoansLink)).toBeInTheDocument();
    });

    it('should add account remaining value to balanceOutstanding if suspended claim returned', () => {
      renderComponent({
        resources: {
          openAccounts: {
            records: [
              {
                ...accountEntry,
                paymentStatus: {
                  name: '',
                },
              },
            ],
          },
        },
        stripes: {
          ...buildStripes(),
          hasPerm: (arg) => arg === permissions.viewFeeFines,
        }
      });

      const container = screen.getByTestId(testIds.openAccountsCountLink);

      expect(within(container).getByText(accountEntry.remaining.toFixed(2))).toBeInTheDocument();
    });
  });
});
