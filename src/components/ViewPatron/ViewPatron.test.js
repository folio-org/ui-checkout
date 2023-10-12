import {
  screen,
  render,
} from '@folio/jest-config-stripes/testing-library/react';

import { ProxyManager } from '@folio/stripes/smart-components';

import ViewPatron from './ViewPatron';
import UserDetail from '../UserDetail';
import PatronBlock from '../PatronBlock';

jest.mock('../UserDetail', () => jest.fn(({ label }) => (
  <div>{label}</div>
)));
jest.mock('../PatronBlock', () => jest.fn(() => <div />));

const basicProps = {
  stripes: {
    connect: jest.fn((Component) => Component),
  },
  patron: {
    id: 'patronId',
  },
  proxy: {
    id: 'proxyId',
  },
  onSelectPatron: jest.fn(),
  onClearPatron: jest.fn(),
  patronBlocks: [{}],
  settings: [],
};
const labelIds = {
  borrower: 'ui-checkout.borrower',
  borrowerProxy: 'ui-checkout.borrowerProxy',
  proxyExpiration: 'ui-checkout.proxy.expiration',
};

describe('ViewPatron', () => {
  afterEach(() => {
    UserDetail.mockClear();
    PatronBlock.mockClear();
  });

  describe('when "proxy.id" is not equal "patron.id"', () => {
    beforeEach(() => {
      render(
        <ViewPatron
          {...basicProps}
        />
      );
    });

    it('should trigger "connect" with correct arguments', () => {
      const expectedResults = [
        [UserDetail, { dataKey: 'proxy' }],
        [UserDetail, { dataKey: 'patron' }],
        [ProxyManager],
      ];

      expectedResults.forEach((args, index) => {
        expect(basicProps.stripes.connect).toHaveBeenNthCalledWith(index + 1, ...args);
      });
    });

    it('should render "UserDetail" with correct props', () => {
      const expectedResults = [
        {
          id: 'patron-detail',
          user: basicProps.patron,
          renderLoans: true,
          settings: basicProps.settings,
        },
        {
          id: 'proxy-detail',
          user: basicProps.proxy,
          settings: basicProps.settings,
        },
      ];

      expectedResults.forEach((args, index) => {
        expect(UserDetail).toHaveBeenNthCalledWith(index + 1, expect.objectContaining(args), {});
      });
    });

    it('should render patron label', () => {
      const patronLabel = screen.getByText(labelIds.borrower);

      expect(patronLabel).toBeVisible();
    });

    it('should render proxy label', () => {
      const proxyLabel = screen.getByText(labelIds.borrowerProxy);

      expect(proxyLabel).toBeVisible();
    });

    it('should render proxy expiration label', () => {
      const proxyExpirationLabel = screen.getByText(labelIds.proxyExpiration);

      expect(proxyExpirationLabel).toBeVisible();
    });

    it('should render "PatronBlock" with correct props', () => {
      const expectedProps = {
        patronBlocksCount: basicProps.patronBlocks.length,
        user: basicProps.patron,
      };

      expect(PatronBlock).toHaveBeenCalledWith(expectedProps, {});
    });

    it('should render "ProxyManager" with correct props', () => {
      const expectedProps = {
        patron: basicProps.patron,
        proxy: basicProps.proxy,
        onSelectPatron: basicProps.onSelectPatron,
        onClose: basicProps.onClearPatron,
      };

      expect(ProxyManager).toHaveBeenCalledWith(expectedProps, {});
    });
  });

  describe('when "proxy.id" and "patron.id" are equal', () => {
    const props = {
      ...basicProps,
      proxy: {
        id: 'patronId',
      },
    };

    beforeEach(() => {
      render(
        <ViewPatron
          {...props}
        />
      );
    });

    it('should render "UserDetail" only once', () => {
      expect(UserDetail).toHaveBeenCalledTimes(1);
    });

    it('should not render proxy label', () => {
      const proxyLabel = screen.queryByText(labelIds.borrowerProxy);

      expect(proxyLabel).toBeNull();
    });
  });

  describe('when "patronBlocks" array is empty', () => {
    const props = {
      ...basicProps,
      patronBlocks: [],
    };

    beforeEach(() => {
      render(
        <ViewPatron
          {...props}
        />
      );
    });

    it('should render "PatronBlock" with correct props', () => {
      const expectedProps = {
        patronBlocksCount: 0,
        user: basicProps.patron,
      };

      expect(PatronBlock).toHaveBeenCalledWith(expectedProps, {});
    });
  });
});
