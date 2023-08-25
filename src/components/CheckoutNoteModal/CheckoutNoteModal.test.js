import React from 'react';
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../test/jest/__mock__';

import {
  Modal,
  MultiColumnList,
} from '@folio/stripes/components';

import CheckoutNoteModal from './CheckoutNoteModal';

jest.mock('lodash', () => ({
  uniqueId: () => 'test',
}));

const testIds = {
  nodeModal: 'checkoutNoteModal',
  confirmButton: 'confirmButton',
  cancelButton: 'cancelButton',
};
const messageIds = {
  cancelLabel: 'ui-checkout.multipieceModal.cancel',
  confirmLabel: 'ui-checkout.multipieceModal.confirm',
};

describe('CheckoutNoteModal', () => {
  const basicProps = {
    message: 'test message',
    open: true,
    heading: 'heading',
    onCancel: jest.fn(),
    onConfirm: jest.fn(),
    visibleColumns: [],
    notes: [{
      test: 'some notes',
    }],
    formatter: {},
    columnMapping: {},
    columnWidths: {},
  };

  describe('when all props are provided', () => {
    const props = {
      ...basicProps,
      cancelLabel: 'cancelLabel',
      confirmLabel: 'confirmLabel',
      id: 'testId',
    };

    beforeEach(() => {
      render(
        <CheckoutNoteModal
          {...props}
        />
      );
    });

    afterEach(() => {
      cleanup();
    });

    it('should render modal window', () => {
      const checkoutNoteModal = screen.getByTestId(testIds.nodeModal);

      expect(checkoutNoteModal).toBeInTheDocument();
    });

    it('should render correct message', () => {
      const modalMessage = screen.getByText(basicProps.message);

      expect(modalMessage).toBeInTheDocument();
    });

    it('should trigger "Modal" component with correct props', () => {
      const expectedProps = {
        'data-testid': testIds.nodeModal,
        open: basicProps.open,
        id: props.id,
        dismissible: true,
        label: basicProps.heading,
        size: 'small',
        onClose: basicProps.onCancel,
      };

      expect(Modal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger "MultiColumnList" component with correct props', () => {
      const expectedProps = {
        visibleColumns: basicProps.visibleColumns,
        contentData: basicProps.notes,
        fullWidth: true,
        formatter: basicProps.formatter,
        columnMapping: basicProps.columnMapping,
        columnWidths: basicProps.columnWidths,
      };

      expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should render confirm button label', () => {
      const confirmButtonLabel = screen.getByText(props.confirmLabel);

      expect(confirmButtonLabel).toBeInTheDocument();
    });

    it('should trigger "onConfirm" after clicking on confirm button', () => {
      const confirmButton = screen.getByTestId(testIds.confirmButton);

      fireEvent.click(confirmButton);

      expect(basicProps.onConfirm).toHaveBeenCalled();
    });

    it('should render cancel button label', () => {
      const cancelButtonLabel = screen.getByText(props.cancelLabel);

      expect(cancelButtonLabel).toBeInTheDocument();
    });

    it('should trigger "onCancel" after clicking on cancel button', () => {
      const cancelButton = screen.getByTestId(testIds.cancelButton);

      fireEvent.click(cancelButton);

      expect(basicProps.onCancel).toHaveBeenCalled();
    });

    it('should have correct "id" attribute for confirm button', () => {
      const confirmButton = screen.getByTestId(testIds.confirmButton);

      expect(confirmButton).toHaveAttribute('id', `clickable-${props.id}-confirm`);
    });

    it('should have correct "id" attribute for cancel button', () => {
      const cancelButton = screen.getByTestId(testIds.cancelButton);

      expect(cancelButton).toHaveAttribute('id', `clickable-${props.id}-cancel`);
    });
  });

  describe('when "cancelLabel", "confirmLabel" and "id" props are not provided', () => {
    beforeEach(() => {
      render(
        <CheckoutNoteModal
          {...basicProps}
        />
      );
    });

    afterEach(() => {
      cleanup();
    });

    it('should render confirm button label', () => {
      const confirmButtonLabel = screen.getByText(messageIds.confirmLabel);

      expect(confirmButtonLabel).toBeInTheDocument();
    });

    it('should render cancel button label', () => {
      const cancelButtonLabel = screen.getByText(messageIds.cancelLabel);

      expect(cancelButtonLabel).toBeInTheDocument();
    });

    it('should have correct "id" attribute for confirm button', () => {
      const confirmButton = screen.getByTestId(testIds.confirmButton);

      expect(confirmButton).toHaveAttribute('id', 'clickable-test-confirm');
    });

    it('should have correct "id" attribute for cancel button', () => {
      const cancelButton = screen.getByTestId(testIds.cancelButton);

      expect(cancelButton).toHaveAttribute('id', 'clickable-test-cancel');
    });
  });
});
