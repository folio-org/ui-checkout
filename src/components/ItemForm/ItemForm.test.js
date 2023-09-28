import React from 'react';

import {
  fireEvent,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import buildStripes from '@folio/circulation/test/jest/__mock__/stripes.mock';

import ItemForm from './ItemForm';

const testIds = {
  itemForm: 'itemForm',
  itemBarcodeField: 'itemBarcodeField',
  addItemButton: 'addItemButton',
  errorModal: 'errorModal',
  errorModalButton: 'errorModalButton',
  overrideModal: 'overrideModal',
  overrideModalButton: 'overrideModalButton',
  selectItemModal: 'selectItemModal',
  selectItemButton: 'selectItemButton',
  closeSelectItemModalButton: 'closeSelectItemModalButton',
};

jest.mock('../ErrorModal', () => jest.fn((props) => (
  <div {...props}>
    <button
      data-testid={testIds.errorModalButton}
      type="button"
      onClick={props.openOverrideModal}
    >
      errorModalButton
    </button>
  </div>
)));
jest.mock('../OverrideModal', () => jest.fn((props) => (
  <div {...props}>
    <button
      data-testid={testIds.overrideModalButton}
      type="button"
      onClick={props.onOverride}
    >
      overrideModalButton
    </button>
  </div>
)));
jest.mock('../SelectItemModal', () => jest.fn((props) => (
  <div {...props}>
    <button
      data-testid={testIds.selectItemButton}
      type="button"
      onClick={props.onSelectItem}
    >
      selectItemButton
    </button>
    <button
      data-testid={testIds.closeSelectItemModalButton}
      type="button"
      onClick={props.onClose}
    >
      closeSelectItemModalButton
    </button>
  </div>
)));

describe('ItemForm', () => {
  const handleSubmit = jest.fn();
  const onOverride = jest.fn();
  const onItemSelection = jest.fn();
  const onCloseSelectItemModal = jest.fn();
  const mockedInitialValues = {};
  const mockedForm = {
    reset: jest.fn(),
    getState: jest.fn(() => ({ values: mockedInitialValues })),
  };
  const props = {
    stripes: buildStripes(),
    shouldSubmitAutomatically: false,
    submitting: false,
    patron: {},
    item: {},
    items: null,
    handleSubmit,
    onOverride,
    form: mockedForm,
    formRef: {},
    checkoutError: null,
    onClearCheckoutErrors: jest.fn(),
    modules: {
      app: [{}],
    },
    onItemSelection,
    onCloseSelectItemModal,
    patronBlockOverriddenInfo: {},
  };
  const createRefMock = {
    current: {
      focus: jest.fn(),
    },
  };

  jest.spyOn(React, 'createRef').mockReturnValue(createRefMock);

  describe('without modal', () => {
    beforeEach(() => {
      render(
        <ItemForm {...props} />
      );
    });

    it('should render item form', () => {
      expect(screen.getByTestId(testIds.itemForm)).toBeInTheDocument();
    });

    it('should render item barcode field', () => {
      expect(screen.getByTestId(testIds.itemBarcodeField)).toBeInTheDocument();
    });

    it('should render add item button', () => {
      expect(screen.getByTestId(testIds.addItemButton)).toBeInTheDocument();
    });

    it('should not render error modal', () => {
      expect(screen.queryByTestId(testIds.errorModal)).not.toBeInTheDocument();
    });

    it('should not render override modal', () => {
      expect(screen.queryByTestId(testIds.overrideModal)).not.toBeInTheDocument();
    });

    it('should not render select item modal', () => {
      expect(screen.queryByTestId(testIds.selectItemModal)).not.toBeInTheDocument();
    });

    it('should not handle form submit', () => {
      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should correctly handle form submit', () => {
      fireEvent.submit(screen.getByTestId(testIds.itemForm));

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('error modal', () => {
    const errorModalProps = {
      ...props,
      checkoutError: [{
        message: 'error message',
      }],
    };

    beforeEach(() => {
      render(
        <ItemForm {...errorModalProps} />
      );
    });

    it('should render error modal', () => {
      expect(screen.queryByTestId(testIds.errorModal)).toBeInTheDocument();
    });
  });

  describe('override modal', () => {
    const overrideModalProps = {
      ...props,
      checkoutError: [{
        message: 'error message',
      }],
    };

    beforeEach(() => {
      render(
        <ItemForm {...overrideModalProps} />
      );
    });

    it('should render error modal', () => {
      expect(screen.queryByTestId(testIds.errorModal)).toBeInTheDocument();
    });

    it('should render override modal', () => {
      fireEvent.click(screen.getByTestId(testIds.errorModalButton));

      expect(screen.getByTestId(testIds.overrideModal)).toBeInTheDocument();
    });

    it('should not call onOverride', () => {
      expect(onOverride).not.toHaveBeenCalled();
    });

    it('should call onOverride', () => {
      fireEvent.click(screen.getByTestId(testIds.errorModalButton));
      fireEvent.click(screen.getByTestId(testIds.overrideModalButton));

      expect(onOverride).toHaveBeenCalled();
    });
  });

  describe('select item modal', () => {
    const selectItemModalProps = {
      ...props,
      items: [{
        status: {
          name: 'status name 1',
        },
        materialType: {
          name: 'material type name 1',
        },
      }, {
        status: {
          name: 'status name 2',
        },
        materialType: {
          name: 'material type name 2',
        },
      }],
    };

    beforeEach(() => {
      render(
        <ItemForm {...selectItemModalProps} />
      );
    });

    it('should render select item modal', () => {
      expect(screen.getByTestId(testIds.selectItemModal)).toBeInTheDocument();
    });

    it('should not call onItemSelection', () => {
      expect(onItemSelection).not.toHaveBeenCalled();
    });

    it('should call onItemSelection', () => {
      fireEvent.click(screen.getByTestId(testIds.selectItemButton));

      expect(onItemSelection).toHaveBeenCalled();
    });

    it('should not call onCloseSelectItemModal', () => {
      expect(onCloseSelectItemModal).not.toHaveBeenCalled();
    });

    it('should call onCloseSelectItemModal', () => {
      fireEvent.click(screen.getByTestId(testIds.closeSelectItemModalButton));

      expect(onCloseSelectItemModal).toHaveBeenCalled();
    });
  });
});
