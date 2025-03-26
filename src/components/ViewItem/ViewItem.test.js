import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import { ChangeDueDateDialog } from '@folio/stripes/smart-components';
import {
  MultiColumnList,
  Tooltip,
} from '@folio/stripes/components';

import {
  DCB_INSTANCE_ID,
  DCB_HOLDINGS_RECORD_ID,
  DCB_USER_LASTNAME,
} from '../../constants';

import ViewItem, {
  visibleColumns,
  columnWidths,
  sortMap,
} from './ViewItem';

const receivedLoans = [
  {
    id: 'loanId',
    itemId: 'itemId',
    dueDate: '2023-05-24T14:30:00',
    item: {
      instanceId: 'instanceId',
      barcode: 'itemBarcode',
      title: 'itemTitle',
      holdingsRecordId: 'holdingsRecordId',
      circulationNotes: [
        {
          noteType: 'Check out',
        },
      ],
    },
    loanPolicyId: 'loanPolicyId',
    loanPolicy: {
      name: 'loanPolicyName',
    },
    dueDateChangedByRecall: true,
  },
];
const basicProps = {
  scannedItems: receivedLoans,
  stripes: {
    connect: jest.fn(Component => Component),
    hasPerm: () => true,
    hasAnyPerm: () => true,
  },
  patron: {
    id: 'patronId',
  },
  parentMutator: {
    query: {
      update: jest.fn(),
    },
    scannedItems: {
      replace: jest.fn(),
    },
    loans: {
      reset: jest.fn(),
      GET: jest.fn(() => ({
        loans: receivedLoans,
      })),
    },
  },
  showCheckoutNotes: jest.fn(),
  loading: false,
  overriddenItemLimitData: {
    itemLimitOverridden: true,
    overriddenItemsList: ['itemBarcode'],
  },
  intl: {},
};
const basicPropsWithDCBItem = {
  ...basicProps,
  scannedItems: [{
    ...receivedLoans[0],
    item: {
      instanceId: DCB_INSTANCE_ID,
      holdingsRecordId: DCB_HOLDINGS_RECORD_ID,
    },
  }],
};
const basicPropsWithDCBUser = {
  ...basicProps,
  scannedItems: [{
    ...receivedLoans[0],
    borrower: {
      lastName: DCB_USER_LASTNAME,
    },
  }],
};
const labelIds = {
  overrided: 'ui-checkout.item.block.overrided',
  dueDateChange: 'ui-checkout.due.date.change',
  moreDetails: 'ui-checkout.actions.moreDetails',
  itemDetailsButton: 'ui-checkout.itemDetails',
  loanDetailsButton: 'ui-checkout.loanDetails',
  loanPolicyButton: 'ui-checkout.loanPolicy',
  changeDueDateButton: 'stripes-smart-components.cddd.changeDueDate',
  notesButton: 'ui-checkout.checkout.notes',
  patronInfoButton: 'ui-checkout.checkout.addInfo.patronInfo.button',
  staffInfoButton: 'ui-checkout.checkout.addInfo.staffInfo.button'
};
const testIds = {
  formattedDate: 'formattedDate',
  formattedTime: 'formattedTime',
  closeDueDateDialog: 'closeDueDateDialog',
  headerButton: 'headerButton',
};
const testDate = '02/02/2023';

describe('ViewItem', () => {
  describe('component', () => {
    afterEach(() => {
      ChangeDueDateDialog.mockClear();
      Tooltip.mockClear();
      cleanup();
    });

    describe('when all data provided', () => {
      beforeEach(() => {
        render(
          <ViewItem {...basicProps} />
        );
      });

      it('should trigger "connect" with correct argument', () => {
        expect(basicProps.stripes.connect).toHaveBeenCalledWith(ChangeDueDateDialog);
      });

      it('should render "MultiColumnList" with correct props', () => {
        const expectedProps = {
          id: 'list-items-checked-out',
          rowMetadata: ['id'],
          interactive: false,
          onHeaderClick: expect.any(Function),
          sortOrder: 'no',
          sortDirection: 'descending',
          visibleColumns,
          columnWidths,
        };

        expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should render "ChangeDueDateDialog" with correct props', () => {
        const expectedProps = {
          stripes: basicProps.stripes,
          loanIds: [{}],
          onClose: expect.any(Function),
          open: false,
          user: basicProps.patron,
        };

        expect(ChangeDueDateDialog).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should render number of checked out item', () => {
        const itemNumber = 1;
        const renderedNumber = screen.getByText(itemNumber);

        expect(renderedNumber).toBeVisible();
      });

      it('should render item title', () => {
        const itemTitle = screen.getByText(basicProps.scannedItems[0].item.title);

        expect(itemTitle).toBeVisible();
      });

      it('should render loan policy name', () => {
        const loanPolicy = screen.getByText(basicProps.scannedItems[0].loanPolicy.name);

        expect(loanPolicy).toBeVisible();
      });

      it('should render overrided item block label', () => {
        const overridedLabel = screen.getByText(labelIds.overrided);

        expect(overridedLabel).toBeVisible();
      });

      it('should render item barcode', () => {
        const itemBarcode = screen.getByText(basicProps.scannedItems[0].item.barcode);

        expect(itemBarcode).toBeVisible();
      });

      it('should render "Tooltip" with correct id', () => {
        const expectedProps = {
          id: basicProps.scannedItems[0].id,
        };

        expect(Tooltip).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should render tooltip label', () => {
        const tooltipLabel = screen.getByText(labelIds.dueDateChange);

        expect(tooltipLabel).toBeVisible();
      });

      it('should render item due date', () => {
        const itemDueDate = screen.getByTestId(testIds.formattedDate);

        expect(itemDueDate).toHaveTextContent(basicProps.scannedItems[0].dueDate);
      });

      it('should render item due time', () => {
        const itemDueTime = screen.getByTestId(testIds.formattedTime);

        expect(itemDueTime).toHaveTextContent(basicProps.scannedItems[0].dueDate);
      });

      it('should render "More details" label', () => {
        const moreDetailsLabel = screen.getByText(labelIds.moreDetails);

        expect(moreDetailsLabel).toBeVisible();
      });

      it('should render item details button label', () => {
        const itemDetailsLabel = screen.getByText(labelIds.itemDetailsButton);

        expect(itemDetailsLabel).toBeVisible();
      });

      it('should trigger "query.update" for item with correct arguments', () => {
        const itemDetailsButton = screen.getByText(labelIds.itemDetailsButton);
        const expectedArg = {
          _path: `/inventory/view/${basicProps.scannedItems[0].item.instanceId}/${basicProps.scannedItems[0].item.holdingsRecordId}/${basicProps.scannedItems[0].itemId}`,
        };

        fireEvent.click(itemDetailsButton);

        expect(basicProps.parentMutator.query.update).toHaveBeenCalledWith(expectedArg);
      });

      it('should render loan details button label', () => {
        const loanDetailsLabel = screen.getByText(labelIds.loanDetailsButton);

        expect(loanDetailsLabel).toBeVisible();
      });

      it('should trigger "query.update" for loan details with correct arguments', () => {
        const loanDetailsButton = screen.getByText(labelIds.loanDetailsButton);
        const expectedArg = {
          _path: `/users/view/${basicProps.scannedItems[0].userId}?layer=loan&loan=${basicProps.scannedItems[0].id}`,
        };

        fireEvent.click(loanDetailsButton);

        expect(basicProps.parentMutator.query.update).toHaveBeenCalledWith(expectedArg);
      });

      it('should render loan policy button label', () => {
        const loanPolicyLabel = screen.getByText(labelIds.loanPolicyButton);

        expect(loanPolicyLabel).toBeVisible();
      });

      it('should trigger "query.update" for loan policy with correct arguments', () => {
        const loanPolicyButton = screen.getByText(labelIds.loanPolicyButton);
        const expectedArg = {
          _path: `/settings/circulation/loan-policies/${basicProps.scannedItems[0].loanPolicyId}`,
        };

        fireEvent.click(loanPolicyButton);

        expect(basicProps.parentMutator.query.update).toHaveBeenCalledWith(expectedArg);
      });

      it('should render change due date button label', () => {
        const changeDueDateLabel = screen.getByText(labelIds.changeDueDateButton);

        expect(changeDueDateLabel).toBeVisible();
      });

      it('should render "ChangeDueDateDialog" with correct props after clicking on change due date button', async () => {
        const changeDueDateButton = screen.getByText(labelIds.changeDueDateButton);
        const expectedProps = {
          stripes: basicProps.stripes,
          loanIds: [{ id: basicProps.scannedItems[0].id }],
          onClose: expect.any(Function),
          open: true,
          user: basicProps.patron,
        };

        fireEvent.click(changeDueDateButton);

        await waitFor(() => {
          expect(ChangeDueDateDialog).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
        });
      });

      it('should render notes button label', () => {
        const notesLabel = screen.getByText(labelIds.notesButton);

        expect(notesLabel).toBeVisible();
      });

      it('should trigger "showCheckoutNotes" with correct argument', () => {
        const notesButton = screen.getByText(labelIds.notesButton);

        fireEvent.click(notesButton);

        expect(basicProps.showCheckoutNotes).toHaveBeenCalledWith(expect.objectContaining(basicProps.scannedItems[0]));
      });
    });

    describe('when due date dialog was closed', () => {
      beforeAll(() => {
        render(
          <ViewItem {...basicProps} />
        );

        const closeDueDateDialogButton = screen.getByTestId(testIds.closeDueDateDialog);

        fireEvent.click(closeDueDateDialogButton);
      });

      it('should trigger "ChangeDueDateDialog" component with correct props', async () => {
        const expectedProps = {
          stripes: basicProps.stripes,
          loanIds: [{}],
          onClose: expect.any(Function),
          open: false,
          user: basicProps.patron,
        };

        await waitFor(() => {
          expect(ChangeDueDateDialog).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
        });
      });

      it('should trigger "loans.reset"', async () => {
        await waitFor(() => {
          expect(basicProps.parentMutator.loans.reset).toHaveBeenCalled();
        });
      });

      it('should trigger "loans.GET" with correct argument', async () => {
        const expectedArgument = {
          params: {
            query: `(id==${basicProps.scannedItems[0].id})`,
          },
        };

        await waitFor(() => {
          expect(basicProps.parentMutator.loans.GET).toHaveBeenCalledWith(expectedArgument);
        });
      });

      it('should trigger "scannedItems.replace" with correct argument', async () => {
        await waitFor(() => {
          expect(basicProps.parentMutator.scannedItems.replace).toHaveBeenCalledWith(receivedLoans);
        });
      });
    });

    describe('when "loading" is true', () => {
      const props = {
        ...basicProps,
        loading: true,
      };

      beforeEach(() => {
        render(
          <ViewItem {...props} />
        );
      });

      it('should render "MultiColumnList" with correct props', () => {
        const expectedProps = {
          id: 'list-items-checked-out',
          rowMetadata: ['id'],
          interactive: false,
          onHeaderClick: expect.any(Function),
          sortOrder: 'no',
          sortDirection: 'descending',
          isEmptyMessage: null,
          visibleColumns,
          columnWidths,
        };

        expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    describe('when "noteType" is not "Check out"', () => {
      const props = {
        ...basicProps,
        scannedItems: [
          {
            ...receivedLoans[0],
            item: {
              ...receivedLoans[0].item,
              circulationNotes: [
                {
                  noteType: 'Test',
                }
              ],
            },
          }
        ],
      };

      beforeEach(() => {
        render(
          <ViewItem {...props} />
        );
      });

      it('should not render checkout notes button', () => {
        const checkoutNotesButton = screen.queryByText(labelIds.notesButton);

        expect(checkoutNotesButton).not.toBeInTheDocument();
      });
    });

    describe('when "dueDateChangedByHold" is true', () => {
      const props = {
        ...basicProps,
        scannedItems: [
          {
            ...basicProps.scannedItems[0],
            dueDateChangedByRecall: false,
            dueDateChangedByHold: true,
          }
        ]
      };

      beforeEach(() => {
        render(
          <ViewItem {...props} />
        );
      });

      it('should render due date "Tooltip"', () => {
        const expectedProps = {
          id: basicProps.scannedItems[0].id,
        };

        expect(Tooltip).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    describe('when "dueDateChangedByNearExpireUser" is true', () => {
      const props = {
        ...basicProps,
        scannedItems: [
          {
            ...basicProps.scannedItems[0],
            dueDateChangedByRecall: false,
            dueDateChangedByNearExpireUser: true,
          }
        ]
      };

      beforeEach(() => {
        render(
          <ViewItem {...props} />
        );
      });

      it('should render due date "Tooltip"', () => {
        const expectedProps = {
          id: basicProps.scannedItems[0].id,
        };

        expect(Tooltip).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    describe('when "itemLimitOverridden" is false', () => {
      const props = {
        ...basicProps,
        overriddenItemLimitData: {
          itemLimitOverridden: false,
        },
      };

      beforeEach(() => {
        render(
          <ViewItem {...props} />
        );
      });

      it('should not render overrided item block label', () => {
        const overridedLabel = screen.queryByText(labelIds.overrided);

        expect(overridedLabel).not.toBeInTheDocument();
      });
    });

    describe('when patron is not provided', () => {
      const props = {
        ...basicProps,
        patron: null,
      };

      beforeEach(() => {
        render(
          <ViewItem {...props} />
        );
      });

      it('should not render "ChangeDueDateDialog"', () => {
        expect(ChangeDueDateDialog).not.toHaveBeenCalled();
      });
    });

    describe('when header was clicked', () => {
      it('should render "MultiColumnList" with initial props', () => {
        MultiColumnList.mockImplementationOnce(({ onHeaderClick }) => (
          <button
            data-testid={testIds.headerButton}
            type="button"
            onClick={() => onHeaderClick({}, { name: 'test' })}
          >
            Header button
          </button>
        ));
        render(
          <ViewItem {...basicProps} />
        );

        const expectedProps = {
          sortOrder: 'no',
          sortDirection: 'descending',
        };
        const headerButton = screen.getByTestId(testIds.headerButton);

        fireEvent.click(headerButton);

        expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should render "MultiColumnList" with changed "sortOrder" and "sortDirection" props', () => {
        const newSortOrder = Object.keys(sortMap)[1];
        const expectedProps = {
          sortOrder: newSortOrder,
          sortDirection: 'ascending',
        };

        MultiColumnList.mockImplementationOnce(({ onHeaderClick }) => (
          <button
            data-testid={testIds.headerButton}
            type="button"
            onClick={() => onHeaderClick({}, { name: newSortOrder })}
          >
            Header button
          </button>
        ));
        render(
          <ViewItem {...basicProps} />
        );

        const headerButton = screen.getByTestId(testIds.headerButton);

        fireEvent.click(headerButton);

        expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should render "MultiColumnList" with "sortDirection" property changed to "asc"', () => {
        const newSortOrder = Object.keys(sortMap)[0];
        const expectedProps = {
          sortOrder: 'no',
          sortDirection: 'ascending',
        };

        MultiColumnList.mockImplementationOnce(({ onHeaderClick }) => (
          <button
            data-testid={testIds.headerButton}
            onClick={() => onHeaderClick({}, { name: newSortOrder })}
            type="button"
          >
            Header button
          </button>
        ));
        render(
          <ViewItem {...basicProps} />
        );

        const headerButton = screen.getByTestId(testIds.headerButton);

        fireEvent.click(headerButton);

        expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should render "MultiColumnList" with "sortDirection" property changed to "desc"', () => {
        const newSortOrder = Object.keys(sortMap)[0];
        const expectedProps = {
          sortOrder: 'no',
          sortDirection: 'descending',
        };
        const mockedMultiColumnList = ({ onHeaderClick }) => (
          <button
            data-testid={testIds.headerButton}
            onClick={() => onHeaderClick({}, { name: newSortOrder })}
            type="button"
          >
            Header button
          </button>
        );

        MultiColumnList
          .mockImplementationOnce(mockedMultiColumnList)
          .mockImplementationOnce(mockedMultiColumnList);
        render(
          <ViewItem {...basicProps} />
        );

        const headerButton = screen.getByTestId(testIds.headerButton);

        fireEvent.click(headerButton);
        fireEvent.click(headerButton);

        expect(MultiColumnList).toHaveBeenNthCalledWith(3, expect.objectContaining(expectedProps), {});
      });
    });
  });

  describe('sortMap', () => {
    const testSubStr = 'testSubStr';
    const loan = {
      no: 'loanNo',
      item: {
        title: 'itemTitle',
        barcode: 'itemBarcode',
      },
      dueDate: {
        substr: jest.fn(() => testSubStr),
      },
    };

    it('should return loan "no"', () => {
      expect(sortMap.no(loan)).toBe(loan.no);
    });

    it('should return item title', () => {
      expect(sortMap.title(loan)).toBe(loan.item.title);
    });

    it('should return loan policy', () => {
      expect(sortMap.loanPolicy()).toBe('-');
    });

    it('should return item barcode', () => {
      expect(sortMap.barcode(loan)).toBe(loan.item.barcode);
    });

    it('should return due date', () => {
      expect(sortMap.dueDate(loan)).toBe(testSubStr);
    });

    it('should trigger "substr" with correct arguments', () => {
      sortMap.dueDate(loan);

      expect(loan.dueDate.substr).toHaveBeenCalledWith(0, 10);
    });

    it('should return formatted time', () => {
      expect(sortMap.time(loan)).toBe(testDate);
    });
  });

  describe('ViewItem with DCB Item', () => {
    it('should not render item details button label', () => {
      render(
        <ViewItem {...basicPropsWithDCBItem} />
      );
      expect(screen.queryByText(labelIds.itemDetailsButton)).toBeNull();
    });
  });

  describe('ViewItem with DCB User', () => {
    it('should not render Add patron info button label', () => {
      render(
        <ViewItem {...basicPropsWithDCBUser} />
      );
      expect(screen.queryByText(labelIds.patronInfoButton)).toBeNull();
    });
    it('should not render Add staff info button label', () => {
      render(
        <ViewItem {...basicPropsWithDCBUser} />
      );
      expect(screen.queryByText(labelIds.staffInfoButton)).toBeNull();
    });
  });
});
