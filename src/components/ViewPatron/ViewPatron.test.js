import {
  screen,
  render,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  ProxyManager,
  ViewCustomFieldsRecord,
} from '@folio/stripes/smart-components';

import ViewPatron from './ViewPatron';
import UserDetail from '../UserDetail';
import PatronBlock from '../PatronBlock';
import { getCheckoutSettings } from '../../util';

jest.mock('../UserDetail', () => jest.fn(({ label }) => (
  <div>{label}</div>
)));
jest.mock('../PatronBlock', () => jest.fn(() => <div />));

jest.mock('../../util', () => ({
  getCheckoutSettings: jest.fn(),
}));

const basicProps = {
  stripes: {
    connect: jest.fn((Component) => Component),
    hasInterface: jest.fn(() => true),
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
  checkoutSettings: [],
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
    ViewCustomFieldsRecord.mockClear();
    getCheckoutSettings.mockClear();
    basicProps.stripes.hasInterface.mockClear();
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
        formatMessage: expect.any(Function),
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
        formatMessage: expect.any(Function),
      };

      expect(PatronBlock).toHaveBeenCalledWith(expectedProps, {});
    });
  });

  describe('Custom Fields', () => {
    describe('when patron has custom fields', () => {
      const customFields = {
        field1: 'value1',
        field2: 'value2',
      };
      const props = {
        ...basicProps,
        patron: {
          ...basicProps.patron,
          customFields,
        },
      };

      beforeEach(() => {
        getCheckoutSettings.mockReturnValue({});
        render(
          <ViewPatron
            {...props}
          />
        );
      });

      it('should render "ViewCustomFieldsRecord" for patron', () => {
        expect(ViewCustomFieldsRecord).toHaveBeenCalledWith(
          expect.objectContaining({
            backendModuleName: 'users',
            entityType: 'user',
            customFieldsValues: customFields,
            showAccordion: false,
            columnCount: 3,
            isSectionTitleEnabled: false,
          }),
          {}
        );
      });

      it('should call "getCheckoutSettings" with checkoutSettings', () => {
        expect(getCheckoutSettings).toHaveBeenCalledWith(basicProps.checkoutSettings);
      });
    });

    describe('when proxy has custom fields', () => {
      const customFields = {
        field1: 'value1',
        field2: 'value2',
      };
      const props = {
        ...basicProps,
        proxy: {
          ...basicProps.proxy,
          customFields,
        },
      };

      beforeEach(() => {
        getCheckoutSettings.mockReturnValue({});
        render(
          <ViewPatron
            {...props}
          />
        );
      });

      it('should render "ViewCustomFieldsRecord" for proxy', () => {
        expect(ViewCustomFieldsRecord).toHaveBeenCalledWith(
          expect.objectContaining({
            backendModuleName: 'users',
            entityType: 'user',
            customFieldsValues: customFields,
            showAccordion: false,
            columnCount: 3,
            isSectionTitleEnabled: false,
          }),
          {}
        );
      });
    });

    describe('when both patron and proxy have custom fields', () => {
      const patronCustomFields = {
        patronField: 'patronValue',
      };
      const proxyCustomFields = {
        proxyField: 'proxyValue',
      };
      const props = {
        ...basicProps,
        patron: {
          ...basicProps.patron,
          customFields: patronCustomFields,
        },
        proxy: {
          ...basicProps.proxy,
          customFields: proxyCustomFields,
        },
      };

      beforeEach(() => {
        getCheckoutSettings.mockReturnValue({});
        render(
          <ViewPatron
            {...props}
          />
        );
      });

      it('should render "ViewCustomFieldsRecord" twice', () => {
        expect(ViewCustomFieldsRecord).toHaveBeenCalledTimes(2);
      });

      it('should render "ViewCustomFieldsRecord" for patron with patron custom fields', () => {
        expect(ViewCustomFieldsRecord).toHaveBeenCalledWith(
          expect.objectContaining({
            customFieldsValues: patronCustomFields,
          }),
          {}
        );
      });

      it('should render "ViewCustomFieldsRecord" for proxy with proxy custom fields', () => {
        expect(ViewCustomFieldsRecord).toHaveBeenCalledWith(
          expect.objectContaining({
            customFieldsValues: proxyCustomFields,
          }),
          {}
        );
      });
    });

    describe('when patron has no custom fields', () => {
      const props = {
        ...basicProps,
        patron: {
          ...basicProps.patron,
          customFields: null,
        },
      };

      beforeEach(() => {
        getCheckoutSettings.mockReturnValue({});
        render(
          <ViewPatron
            {...props}
          />
        );
      });

      it('should not render "ViewCustomFieldsRecord" for patron', () => {
        expect(ViewCustomFieldsRecord).not.toHaveBeenCalled();
      });
    });

    describe('when proxy has no custom fields', () => {
      const props = {
        ...basicProps,
        proxy: {
          ...basicProps.proxy,
          customFields: undefined,
        },
      };

      beforeEach(() => {
        getCheckoutSettings.mockReturnValue({});
        render(
          <ViewPatron
            {...props}
          />
        );
      });

      it('should not render "ViewCustomFieldsRecord" for proxy', () => {
        expect(ViewCustomFieldsRecord).not.toHaveBeenCalled();
      });
    });

    describe('when checkoutSettings has allowedCustomFieldRefIds', () => {
      const allowedRefIds = ['refId1', 'refId2'];
      const customFields = {
        field1: 'value1',
      };
      const props = {
        ...basicProps,
        patron: {
          ...basicProps.patron,
          customFields,
        },
      };

      beforeEach(() => {
        getCheckoutSettings.mockReturnValue({
          allowedCustomFieldRefIds: allowedRefIds,
        });
        render(
          <ViewPatron
            {...props}
          />
        );
      });

      it('should pass allowedRefIds to "ViewCustomFieldsRecord"', () => {
        expect(ViewCustomFieldsRecord).toHaveBeenCalledWith(
          expect.objectContaining({
            allowedRefIds,
          }),
          {}
        );
      });
    });

    describe('when getCheckoutSettings returns undefined', () => {
      const customFields = {
        field1: 'value1',
      };
      const props = {
        ...basicProps,
        patron: {
          ...basicProps.patron,
          customFields,
        },
      };

      beforeEach(() => {
        getCheckoutSettings.mockReturnValue(undefined);
        render(
          <ViewPatron
            {...props}
          />
        );
      });

      it('should render "ViewCustomFieldsRecord" with undefined allowedRefIds', () => {
        expect(ViewCustomFieldsRecord).toHaveBeenCalledWith(
          expect.objectContaining({
            allowedRefIds: undefined,
          }),
          {}
        );
      });
    });

    describe('when custom-fields interface is not available', () => {
      const customFields = {
        field1: 'value1',
      };
      const props = {
        ...basicProps,
        patron: {
          ...basicProps.patron,
          customFields,
        },
        stripes: {
          ...basicProps.stripes,
          hasInterface: jest.fn(() => false),
        },
      };

      beforeEach(() => {
        getCheckoutSettings.mockReturnValue({});
        render(
          <ViewPatron
            {...props}
          />
        );
      });

      it('should not render "ViewCustomFieldsRecord"', () => {
        expect(ViewCustomFieldsRecord).not.toHaveBeenCalled();
      });
    });
  });
});
