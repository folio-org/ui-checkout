import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../test/jest/__mock__';

import { DueDatePicker } from '@folio/stripes/smart-components';
import {
  Modal,
  TextArea,
} from '@folio/stripes/components';

import { BACKEND_ERROR_CODES } from '../../constants';
import OverrideModal, {
  getInitialValues,
} from './OverrideModal';
import { renderOrderedPatronBlocks } from '../../util';

const testDate = '02/02/2023';
const mockTz = jest.fn(function tz() {
  return this;
});
const mockSet = jest.fn(function set() {
  return this;
});

jest.mock('../../util', () => ({
  renderOrderedPatronBlocks: jest.fn(() => <div />),
}));
jest.mock('moment-timezone', () => jest.fn(() => ({
  tz: mockTz,
  set: mockSet,
  format() {
    return testDate;
  },
})));

const basicProps = {
  stripes: {},
  closeOverrideModal: jest.fn(),
  onOverride: jest.fn(),
  overrideError: {
    code: BACKEND_ERROR_CODES.itemNotLoanable,
    message: 'message',
  },
  overridePatronBlock: false,
  patronBlockOverriddenInfo: {
    comment: '',
  },
  patronBlocks: [],
  item: {
    title: 'title',
    barcode: 'barcode',
    materialType: {
      name: 'materialTypeName',
    },
  },
};
const labelIds = {
  overrideLoanPolicy: 'ui-checkout.overrideLoanPolicy',
  blockedLabel: 'ui-checkout.blockedLabel',
  overridePatronBlock: 'ui-checkout.overridePatronBlock',
  overrideItemBlock: 'ui-checkout.overrideItemBlock',
  additionalReasons: 'ui-checkout.additionalReasons',
  itemWillBeCheckedOut: 'ui-checkout.messages.itemWillBeCheckedOut',
  saveAndClose: 'ui-checkout.saveAndClose',
  cancel: 'ui-checkout.cancel',
  comment: 'ui-checkout.comment',
  date: 'ui-checkout.cddd.date',
  time: 'ui-checkout.cddd.time',
};
const testIds = {
  overrideForm: 'overrideForm',
  saveAndCloseButton: 'saveAndCloseButton',
  cancelButton: 'cancelButton',
  comment: 'comment',
};

describe('OverrideModal', () => {
  describe('component', () => {
    const mockEvent = {
      preventDefault: () => {},
    };

    afterEach(() => {
      DueDatePicker.mockClear();
    });

    describe('when "overrideError" is "ITEM_NOT_LOANABLE"', () => {
      beforeEach(() => {
        render(<OverrideModal {...basicProps} />);
      });

      it('should render "Modal" with correct props', () => {
        const expectedProps = {
          size: 'small',
          dismissible: true,
          enforceFocus: false,
          open: true,
          onClose: basicProps.closeOverrideModal,
        };

        expect(Modal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should set correct label to modal', () => {
        const modalLabel = screen.getByText(labelIds.overrideLoanPolicy);

        expect(modalLabel).toBeVisible();
      });

      it('should render item information label', () => {
        const itemInfoLabel = screen.getByText(labelIds.itemWillBeCheckedOut);

        expect(itemInfoLabel).toBeVisible();
      });

      it('should render "DueDatePicker" with correct props', () => {
        const expectedProps = {
          required: true,
          stripes: basicProps.stripes,
          onChange: expect.any(Function),
        };

        expect(DueDatePicker).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should trigger "closeOverrideModal" during submitting', () => {
        const form = screen.getByTestId(testIds.overrideForm);

        fireEvent.submit(form, mockEvent);

        expect(basicProps.closeOverrideModal).toHaveBeenCalled();
      });

      it('should trigger "onOverride" with correct arguments during submitting', () => {
        const form = screen.getByTestId(testIds.overrideForm);
        const expectedProps = {
          barcode: basicProps.item.barcode,
          comment: '',
          dueDate: '',
        };

        fireEvent.submit(form, mockEvent);

        expect(basicProps.onOverride).toHaveBeenCalledWith(expectedProps);
      });

      it('should render "TextArea" with correct props', () => {
        const expectedProps = {
          required: true,
          value: basicProps.patronBlockOverriddenInfo.comment,
          onChange: expect.any(Function),
        };

        expect(TextArea).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should render "comment" label', () => {
        const commentLabel = screen.getByText(labelIds.comment);

        expect(commentLabel).toBeVisible();
      });

      it('should render "Save and close" button label', () => {
        const saveAndCloseLabel = screen.getByText(labelIds.saveAndClose);

        expect(saveAndCloseLabel).toBeVisible();
      });

      it('should render new "comment" after changing textarea field', async () => {
        const comment = screen.getByTestId(testIds.comment);
        const event = {
          target: {
            value: 'new comment',
          },
        };

        fireEvent.change(comment, event);

        await waitFor(() => expect(comment).toHaveValue(event.target.value));
      });

      it('"Save and close" button should be disabled', () => {
        const saveAndCloseButton = screen.getByTestId(testIds.saveAndCloseButton);

        expect(saveAndCloseButton).toBeDisabled();
      });

      it('should render "Cancel" button label', () => {
        const cancelLabel = screen.getByText(labelIds.cancel);

        expect(cancelLabel).toBeVisible();
      });

      it('should trigger "closeOverrideModal" after clicking on "Cancel" button', () => {
        const cancelButton = screen.getByTestId(testIds.cancelButton);

        fireEvent.click(cancelButton);

        expect(basicProps.closeOverrideModal).toHaveBeenCalled();
      });

      it('should render time label of date picker', () => {
        const timeLabel = screen.getByText(labelIds.time, {
          exact: false,
        });

        expect(timeLabel).toBeVisible();
      });

      it('should render date label of date picker', () => {
        const dateLabel = screen.getByText(labelIds.date, {
          exact: false,
        });

        expect(dateLabel).toBeVisible();
      });
    });

    describe('when patron block comment is not provided', () => {
      const props = {
        ...basicProps,
        patronBlockOverriddenInfo: {},
      };

      beforeEach(() => {
        render(<OverrideModal {...props} />);
      });

      it('should render default "comment"', () => {
        const comment = screen.getByTestId(testIds.comment);
        const defaultComment = '';

        expect(comment).toHaveValue(defaultComment);
      });
    });

    describe('when override information comment is provided', () => {
      const props = {
        ...basicProps,
        patronBlockOverriddenInfo: {
          comment: 'comment',
        },
      };

      beforeEach(() => {
        render(<OverrideModal {...props} />);
      });

      it('"Save and close" button should be enabled', () => {
        const saveAndCloseButton = screen.getByTestId(testIds.saveAndCloseButton);

        expect(saveAndCloseButton).toBeEnabled();
      });

      it('should trigger "closeOverrideModal" after clicking on "Save and close" button', () => {
        const saveAndCloseButton = screen.getByTestId(testIds.saveAndCloseButton);

        fireEvent.click(saveAndCloseButton);

        expect(basicProps.closeOverrideModal).toHaveBeenCalled();
      });
    });

    describe('when "overrideError" is "ITEM_LIMIT_LOAN_TYPE"', () => {
      const props = {
        ...basicProps,
        overrideError: {
          code: BACKEND_ERROR_CODES.itemLimitLoanType,
        },
      };

      beforeEach(() => {
        render(<OverrideModal {...props} />);
      });

      it('should set correct label to modal', () => {
        const modalLabel = screen.getByText(labelIds.overrideItemBlock);

        expect(modalLabel).toBeVisible();
      });
    });

    describe('when "overrideError" is not presented', () => {
      const props = {
        ...basicProps,
        overrideError: null,
      };

      beforeEach(() => {
        render(<OverrideModal {...props} />);
      });

      it('should not call "DueDatePicker"', () => {
        expect(DueDatePicker).not.toHaveBeenCalled();
      });

      it('should trigger "onOverride" with correct arguments during submitting', () => {
        const form = screen.getByTestId(testIds.overrideForm);
        const expectedProps = {
          barcode: basicProps.item.barcode,
          comment: '',
        };

        fireEvent.submit(form, mockEvent);

        expect(basicProps.onOverride).toHaveBeenCalledWith(expectedProps);
      });
    });

    describe('when "overridePatronBlock" is true', () => {
      const props = {
        ...basicProps,
        overridePatronBlock: true,
        patronBlocks: Array(4),
      };

      beforeEach(() => {
        render(<OverrideModal {...props} />);
      });

      it('should set correct label to modal', () => {
        const modalLabel = screen.getByText(labelIds.overridePatronBlock);

        expect(modalLabel).toBeVisible();
      });

      it('should render "Blocked" label', () => {
        const blockedLabel = screen.getByText(labelIds.blockedLabel, {
          exact: false,
        });

        expect(blockedLabel).toBeVisible();
      });

      it('should render "Additional reasons" message', () => {
        const additionalReasonsMessage = screen.getByText(labelIds.additionalReasons);

        expect(additionalReasonsMessage).toBeVisible();
      });

      it('should trigger "renderOrderedPatronBlocks" with correct argument', () => {
        expect(renderOrderedPatronBlocks).toHaveBeenCalledWith(props.patronBlocks);
      });
    });
  });

  describe('getInitialValues', () => {
    const timeZone = 'testTimeZone';
    const initialValues = getInitialValues(timeZone);

    it('should return date and time', () => {
      const expectedResult = {
        date: testDate,
        time: '23:59:00.000Z',
      };

      expect(initialValues).toEqual(expectedResult);
    });

    it('should trigger "tz" with correct argument first time', () => {
      expect(mockTz).toHaveBeenNthCalledWith(1, timeZone);
    });

    it('should trigger "tz" with correct argument second time', () => {
      expect(mockTz).toHaveBeenNthCalledWith(2, 'UTC', true);
    });

    it('should trigger "set" with correct argument', () => {
      const startOfTheDay = {
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      };

      expect(mockSet).toHaveBeenCalledWith(startOfTheDay);
    });
  });
});
