import {
  render,
  screen,
} from '@testing-library/react';

import '../../../test/jest/__mock__';

import Loans from './Loans';
import UserDetail from './UserDetail';

jest.mock('./Loans', () => jest.fn(() => <div />));
jest.mock('../../../icons/user-placeholder.png', () => jest.fn(() => 'image_path'));
jest.mock('../../util', () => ({
  getFullName: jest.fn((user) => user.personal.lastName),
}));

const basicProps = {
  user: {
    id: 'userId',
    barcode: 'userBarcode',
    personal: {
      lastName: 'lastName',
    },
    active: true,
    expirationDate: '01/01/2023',
  },
  id: 'id',
  label: 'label',
  settings: [{
    value: 'true',
  }],
  resources: {
    patronGroups: {
      records: [{
        group: 'patronGroup',
      }],
    },
    openLoansCount: {
      records: [],
    },
    openAccounts: {
      records: [],
    },
    openRequests: {
      records: [],
    },
  },
  renderLoans: true,
  stripes: {},
};
const labelIds = {
  patronGroup: 'ui-checkout.user.patronGroup',
  statusLabel: 'ui-checkout.status',
  activeStatus: 'ui-checkout.active',
  inactiveStatus: 'ui-checkout.inactive',
  expirationDate: 'ui-checkout.user.expiration',
  barcodeLabel: 'ui-checkout.user.detail.barcode',
};
const testIds = {
  keyValue: 'keyValue',
};
const keyValueOrder = {
  patronGroup: 1,
  expirationDate: 3,
};

describe('UserDetail', () => {
  describe('when "patronGroups" is provided', () => {
    beforeEach(() => {
      render(
        <UserDetail {...basicProps} />
      );
    });

    it('should render provided label', () => {
      const label = screen.getByText(basicProps.label);

      expect(label).toBeVisible();
    });

    it('should render user name', () => {
      const userName = screen.getByText(basicProps.user.personal.lastName);

      expect(userName).toBeVisible();
    });

    it('should render barcode label', () => {
      const barcodeLabel = screen.getByText(labelIds.barcodeLabel);

      expect(barcodeLabel).toBeVisible();
    });

    it('should render user barcode', () => {
      const userBarcode = screen.getByText(basicProps.user.barcode);

      expect(userBarcode).toBeVisible();
    });

    it('should render image', () => {
      const image = screen.getByAltText('presentation');

      expect(image).toBeVisible();
    });

    it('should render patron group label', () => {
      const patronGroupLabel = screen.getByText(labelIds.patronGroup);

      expect(patronGroupLabel).toBeVisible();
    });

    it('should render patron group value', () => {
      const patronGroupValue = screen.getByText(basicProps.resources.patronGroups.records[0].group);

      expect(patronGroupValue).toBeVisible();
    });

    it('should render status label', () => {
      const statusLabel = screen.getByText(labelIds.statusLabel);

      expect(statusLabel).toBeVisible();
    });

    it('should render status value', () => {
      const statusValue = screen.getByText(labelIds.activeStatus);

      expect(statusValue).toBeVisible();
    });

    it('should render expiration label', () => {
      const expirationLabel = screen.getByText(labelIds.expirationDate);

      expect(expirationLabel).toBeVisible();
    });

    it('should render expiration value', () => {
      const expirationValue = screen.getByText(basicProps.user.expirationDate);

      expect(expirationValue).toBeVisible();
    });

    it('should render "Loans" with correct props', () => {
      const expectedProps = {
        resources: basicProps.resources,
        stripes: basicProps.stripes,
        user: basicProps.user,
      };

      expect(Loans).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });
  });

  describe('when "patronGroups" is not provided', () => {
    const props = {
      ...basicProps,
      resources: {
        ...basicProps.resources,
        patronGroups: null,
      },
    };

    beforeEach(() => {
      render(
        <UserDetail {...props} />
      );
    });

    it('should render empty value of patron group', () => {
      const patronGroupValue = screen.getAllByTestId(testIds.keyValue)[keyValueOrder.patronGroup];

      expect(patronGroupValue).toBeEmpty();
    });
  });

  describe('when user is not active', () => {
    const props = {
      ...basicProps,
      user: {
        ...basicProps.user,
        active: false,
      },
    };

    beforeEach(() => {
      render(
        <UserDetail {...props} />
      );
    });

    it('should render inactive status value', () => {
      const statusValue = screen.getByText(labelIds.inactiveStatus);

      expect(statusValue).toBeVisible();
    });
  });

  describe('when "expirationDate" is not provided', () => {
    const props = {
      ...basicProps,
      user: {
        ...basicProps.user,
        expirationDate: null,
      },
    };

    beforeEach(() => {
      render(
        <UserDetail {...props} />
      );
    });

    it('should render empty value of expiration date', () => {
      const expirationDateValue = screen.getAllByTestId(testIds.keyValue)[keyValueOrder.expirationDate];

      expect(expirationDateValue).toBeEmpty();
    });
  });
});
