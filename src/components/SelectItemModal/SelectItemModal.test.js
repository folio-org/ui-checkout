import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../test/jest/__mock__';

import {
  Modal,
  MultiColumnList,
} from '@folio/stripes/components';

import SelectItemModal, {
  formatter,
  COLUMN_NAMES,
  COLUMN_WIDTHS,
  COLUMN_MAP,
  MAX_HEIGHT,
} from './SelectItemModal';

const testIds = {
  selectItemModal: 'selectItemModal',
};
const messageIds = {
  modalHeading: 'ui-checkout.selectItemModal.heading',
  itemListHeader: 'ui-checkout.selectItemModal.itemListHeader',
  resultCount: 'ui-checkout.selectItemModal.resultCount',
};

describe('SelectItemModal', () => {
  const props = {
    checkoutItems: [],
    onClose: jest.fn(),
    onSelectItem: jest.fn(),
  };

  describe('component', () => {
    beforeEach(() => {
      render(
        <SelectItemModal
          {...props}
        />
      );
    });

    it('should render into the document', () => {
      const scanTotal = screen.getByTestId(testIds.selectItemModal);

      expect(scanTotal).toBeInTheDocument();
    });

    it('should render modal label', () => {
      const modalLabel = screen.getByText(messageIds.modalHeading);

      expect(modalLabel).toBeInTheDocument();
    });

    it('should render list header', () => {
      const listHeader = screen.getByText(messageIds.itemListHeader);

      expect(listHeader).toBeInTheDocument();
    });

    it('should render result count', () => {
      const resultCount = screen.getByText(messageIds.resultCount);

      expect(resultCount).toBeInTheDocument();
    });

    it('should trigger "Modal" with correct props', () => {
      const expectedProps = {
        open: true,
        dismissible: true,
        onClose: props.onClose,
      };

      expect(Modal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger "MultiColumnList" with correct props', () => {
      const expectedProps = {
        id: 'items-list',
        interactive: true,
        contentData: props.checkoutItems,
        visibleColumns: COLUMN_NAMES,
        columnMapping: COLUMN_MAP,
        columnWidths: COLUMN_WIDTHS,
        formatter,
        maxHeight: MAX_HEIGHT,
        onRowClick: props.onSelectItem,
      };

      expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });
  });

  describe('formatter', () => {
    const basicItem = {
      status: {
        name: 'statusName',
      },
      effectiveLocation: {
        name: 'effectiveLocationName'
      },
      materialType: {
        name: 'materialTypeName',
      },
      temporaryLoanType: {
        name: 'temporaryLoanTypeName',
      },
      permanentLoanType: {
        name: 'permanentLoanTypeName',
      },
    };

    it('should return status name', () => {
      expect(formatter.itemStatus(basicItem)).toBe(basicItem.status.name);
    });

    it('should return location name', () => {
      expect(formatter.location(basicItem)).toBe(basicItem.effectiveLocation.name);
    });

    it('should return empty string for location name', () => {
      const item = {
        ...basicItem,
        effectiveLocation: {},
      };

      expect(formatter.location(item)).toBe('');
    });

    it('should return material type name', () => {
      expect(formatter.materialType(basicItem)).toBe(basicItem.materialType.name);
    });

    it('should return temporary loan type name', () => {
      expect(formatter.loanType(basicItem)).toBe(basicItem.temporaryLoanType.name);
    });

    it('should return permanent loan type name', () => {
      const item = {
        ...basicItem,
        temporaryLoanType: {},
      };

      expect(formatter.loanType(item)).toBe(basicItem.permanentLoanType.name);
    });

    it('should return empty string for loan type', () => {
      const item = {
        ...basicItem,
        temporaryLoanType: {},
        permanentLoanType: {},
      };

      expect(formatter.loanType(item)).toBe('');
    });
  });
});
