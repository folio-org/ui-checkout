import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import { ConfirmationModal } from '@folio/stripes/components';

import ModalManager, {
  formatter,
  columnWidths,
  columnMapping,
  visibleColumns,
} from './ModalManager';
import CheckoutNoteModal from './components/CheckoutNoteModal';
import MultipieceModal from './components/MultipieceModal';
import { shouldStatusModalBeShown } from './util';

const basicProps = {
  intl: {},
  checkedoutItem: {
    barcode: 'itemBarcode',
    title: 'itemTitle',
    materialType: 'itemMaterialType',
    status: {
      name: 'statusName',
    },
    discoverySuppress: false,
    circulationNotes: [
      {
        noteType: 'Check out',
        date: '2022',
        note: 'note',
      },
      {
        noteType: 'Check out',
        date: '2023',
        note: 'note_2',
        source: {
          personal: {
            firstName: 'firstName',
            lastName: 'lastName',
          },
        },
      }
    ],
  },
  checkoutNotesMode: false,
  onDone: jest.fn(),
  onCancel: jest.fn(),
};
const labelIds = {
  confirmLabel: 'ui-checkout.confirm',
  suppressedMessage: 'ui-checkout.confirmStatusModal.suppressedMessage',
  notSuppressedMessage: 'ui-checkout.confirmStatusModal.notSuppressedMessage',
  confirmationModalHeading: 'ui-checkout.confirmStatusModal.heading',
  checkoutNotesMessage: 'ui-checkout.checkoutNotes.message',
  checkoutNoteModalMessage: 'ui-checkout.checkoutNoteModal.message',
  checkoutNotesHeading: 'ui-checkout.checkoutNotes.heading',
  checkoutNoteModalHeading: 'ui-checkout.checkoutNoteModal.heading',
  closeLabel: 'ui-checkout.close',
  multipieceCloseLabel: 'ui-checkout.multipieceModal.cancel',
};
const testIds = {
  confirmationModal: 'confirmationModal',
  multipieceModal: 'multipieceModal',
  checkoutNoteModal: 'checkoutNoteModal',
  confirmNoteModalButton: 'confirmNoteModalButton',
  cancelNoteModalButton: 'cancelNoteModalButton',
  multipieceCloseButton: 'multipieceCloseButton',
  multipieceConfirmButton: 'multipieceConfirmButton',
};

jest.mock('./util', () => ({
  shouldStatusModalBeShown: jest.fn(),
}));
jest.mock('./components/CheckoutNoteModal', () => jest.fn(({
  message,
  heading,
  cancelLabel,
  confirmLabel,
  onConfirm,
  onCancel,
}) => (
  <div data-testid={testIds.checkoutNoteModal}>
    <span>{message}</span>
    <span>{heading}</span>
    <button
      type="button"
      onClick={onCancel}
      data-testid={testIds.cancelNoteModalButton}
    >
      {cancelLabel}
    </button>
    <button
      type="button"
      onClick={onConfirm}
      data-testid={testIds.confirmNoteModalButton}
    >
      {confirmLabel}
    </button>
  </div>
)));
jest.mock('./components/MultipieceModal', () => jest.fn(({
  onClose,
  onConfirm,
}) => (
  <div data-testid={testIds.multipieceModal}>
    <button
      type="button"
      data-testid={testIds.multipieceCloseButton}
      onClick={onClose}
    >
      Close
    </button>
    <button
      type="button"
      data-testid={testIds.multipieceConfirmButton}
      onClick={onConfirm}
    >
      Confirm
    </button>
  </div>
)));

describe('ModalManager', () => {
  describe('ConfirmationModal', () => {
    afterEach(jest.clearAllMocks);

    describe('When "discoverySuppress" is true', () => {
      const props = {
        ...basicProps,
        checkedoutItem: {
          ...basicProps.checkedoutItem,
          discoverySuppress: true,
        },
      };

      beforeEach(() => {
        shouldStatusModalBeShown.mockReturnValueOnce(true);

        render(
          <ModalManager {...props} />
        );
      });

      it('should render correct confirmation modal message', () => {
        const notSuppressedMessage = screen.getByText(labelIds.suppressedMessage);

        expect(notSuppressedMessage).toBeVisible();
      });
    });

    describe('When "discoverySuppress" is false', () => {
      beforeEach(() => {
        shouldStatusModalBeShown.mockReturnValueOnce(true);

        render(
          <ModalManager {...basicProps} />
        );
      });

      it('should trigger "shouldStatusModalBeShown" with correct argument', () => {
        expect(shouldStatusModalBeShown).toHaveBeenCalledWith(basicProps.checkedoutItem);
      });

      it('should trigger "ConfirmationModal" with correct props', () => {
        const expectedProps = {
          id: 'test-confirm-status-modal',
          open: true,
          item: basicProps.checkedoutItem,
          onConfirm: expect.any(Function),
          onCancel: expect.any(Function),
        };

        expect(ConfirmationModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should render confirmation modal heading', () => {
        const confirmationModalHeading = screen.getByText(labelIds.confirmationModalHeading);

        expect(confirmationModalHeading).toBeVisible();
      });

      it('should render correct confirmation modal message', () => {
        const notSuppressedMessage = screen.getByText(labelIds.notSuppressedMessage);

        expect(notSuppressedMessage).toBeVisible();
      });

      it('should render confirm button label of confirmation modal', () => {
        const confirmButtonLabel = screen.getByText(labelIds.confirmLabel);

        expect(confirmButtonLabel).toBeVisible();
      });

      it('should close "ConfirmationModal" after clicking on cancel button', () => {
        const cancelLabel = 'Cancel';
        const cancelButton = screen.getByText(cancelLabel);

        fireEvent.click(cancelButton);

        const confirmationModal = screen.queryByTestId(testIds.confirmationModal);

        expect(confirmationModal).not.toBeInTheDocument();
      });

      it('should close "ConfirmationModal" after clicking on confirm button', () => {
        const confirmButton = screen.getByText(labelIds.confirmLabel);

        fireEvent.click(confirmButton);

        const confirmationModal = screen.queryByTestId(testIds.confirmationModal);

        expect(confirmationModal).not.toBeInTheDocument();
      });
    });
  });

  describe('CheckoutNoteModal', () => {
    afterEach(jest.clearAllMocks);

    describe('When "checkoutNotesMode" is true', () => {
      const props = {
        ...basicProps,
        checkoutNotesMode: true,
      };

      beforeEach(() => {
        render(
          <ModalManager {...props} />
        );
      });

      it('should trigger "CheckoutNoteModal" with correct props', () => {
        const expectedProps = {
          open: true,
          onConfirm: expect.any(Function),
          onCancel: expect.any(Function),
          hideConfirm: props.checkoutNotesMode,
          notes: [
            {
              ...props.checkedoutItem.circulationNotes[1],
              source: `${props.checkedoutItem.circulationNotes[1].source.personal.lastName}, ${props.checkedoutItem.circulationNotes[1].source.personal.firstName}`,
              noteType: undefined,
            },
            {
              ...props.checkedoutItem.circulationNotes[0],
              source: '',
              noteType: undefined,
            }
          ],
          formatter,
          columnWidths,
          columnMapping,
          visibleColumns,
        };

        expect(CheckoutNoteModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should render correct modal message', () => {
        const modalMessage = screen.getByText(labelIds.checkoutNotesMessage);

        expect(modalMessage).toBeVisible();
      });

      it('should render correct modal header', () => {
        const modalHeader = screen.getByText(labelIds.checkoutNotesHeading);

        expect(modalHeader).toBeVisible();
      });

      it('should render correct cancel button label', () => {
        const buttonLabel = screen.getByText(labelIds.closeLabel);

        expect(buttonLabel).toBeVisible();
      });

      it('should render correct confirm button label', () => {
        const buttonLabel = screen.getByText(labelIds.confirmLabel);

        expect(buttonLabel).toBeVisible();
      });

      it('should close modal after clicking on cancel button', () => {
        const cancelButton = screen.getByTestId(testIds.cancelNoteModalButton);

        fireEvent.click(cancelButton);

        const checkoutNoteModal = screen.queryByTestId(testIds.checkoutNoteModal);

        expect(checkoutNoteModal).not.toBeInTheDocument();
      });

      it('should close modal after clicking on confirm button', () => {
        const confirmButton = screen.getByTestId(testIds.confirmNoteModalButton);

        fireEvent.click(confirmButton);

        const checkoutNoteModal = screen.queryByTestId(testIds.checkoutNoteModal);

        expect(checkoutNoteModal).not.toBeInTheDocument();
      });
    });

    describe('When "checkoutNotesMode" is false', () => {
      beforeEach(() => {
        render(
          <ModalManager {...basicProps} />
        );
      });

      it('should render correct modal header', () => {
        const modalHeader = screen.getByText(labelIds.checkoutNoteModalHeading);

        expect(modalHeader).toBeVisible();
      });

      it('should render correct modal message', () => {
        const modalMessage = screen.getByText(labelIds.checkoutNoteModalMessage);

        expect(modalMessage).toBeVisible();
      });

      it('should render correct cancel button label', () => {
        const buttonLabel = screen.getByText(labelIds.multipieceCloseLabel);

        expect(buttonLabel).toBeVisible();
      });
    });
  });

  describe('MultipieceModal', () => {
    const basicExpectedProps = {
      open: true,
      onConfirm: expect.any(Function),
      onClose: expect.any(Function),
    };
    const triggerMultipieceModal = (props) => {
      render(
        <ModalManager {...props} />
      );

      const confirmNoteModalButton = screen.getByTestId(testIds.confirmNoteModalButton);

      fireEvent.click(confirmNoteModalButton);
    };

    afterEach(jest.clearAllMocks);

    describe('When "numberOfPieces" more than 1', () => {
      const props = {
        ...basicProps,
        checkedoutItem: {
          ...basicProps.checkedoutItem,
          numberOfPieces: 2,
        },
      };

      beforeEach(() => {
        triggerMultipieceModal(props);
      });

      it('should trigger "MultipieceModal" with correct props', async () => {
        const expectedProps = {
          ...basicExpectedProps,
          item: props.checkedoutItem,
        };

        await waitFor(() => {
          expect(MultipieceModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
        });
      });

      it('should close modal after clicking on close button', () => {
        const closeButton = screen.getByTestId(testIds.multipieceCloseButton);

        fireEvent.click(closeButton);

        const multipieceModal = screen.queryByTestId(testIds.multipieceModal);

        expect(multipieceModal).not.toBeInTheDocument();
      });

      it('should trigger after clicking on confirm button "onDone"', () => {
        const multipieceConfirmButton = screen.getByTestId(testIds.multipieceConfirmButton);

        basicProps.onDone.mockClear();
        fireEvent.click(multipieceConfirmButton);

        expect(basicProps.onDone).toHaveBeenCalled();
      });
    });

    describe('When "descriptionOfPieces" is presented', () => {
      const props = {
        ...basicProps,
        checkedoutItem: {
          ...basicProps.checkedoutItem,
          descriptionOfPieces: 'descriptionOfPieces',
        },
      };

      beforeEach(() => {
        triggerMultipieceModal(props);
      });

      it('should trigger "MultipieceModal" with correct props', async () => {
        const expectedProps = {
          ...basicExpectedProps,
          item: props.checkedoutItem,
        };

        await waitFor(() => {
          expect(MultipieceModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
        });
      });
    });

    describe('When "numberOfMissingPieces" is presented', () => {
      const props = {
        ...basicProps,
        checkedoutItem: {
          ...basicProps.checkedoutItem,
          numberOfMissingPieces: 1,
        },
      };

      beforeEach(() => {
        triggerMultipieceModal(props);
      });

      it('should trigger "MultipieceModal" with correct props', async () => {
        const expectedProps = {
          ...basicExpectedProps,
          item: props.checkedoutItem,
        };

        await waitFor(() => {
          expect(MultipieceModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
        });
      });
    });

    describe('When "missingPieces" is true', () => {
      const props = {
        ...basicProps,
        checkedoutItem: {
          ...basicProps.checkedoutItem,
          missingPieces: true,
        },
      };

      beforeEach(() => {
        triggerMultipieceModal(props);
      });

      it('should trigger "MultipieceModal" with correct props', async () => {
        const expectedProps = {
          ...basicExpectedProps,
          item: props.checkedoutItem,
        };

        await waitFor(() => {
          expect(MultipieceModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
        });
      });
    });
  });

  describe('Component updating', () => {
    let wrapper;
    const props = {
      ...basicProps,
      checkedoutItem: {
        ...basicProps.checkedoutItem,
        circulationNotes: [],
      },
    };

    afterEach(jest.clearAllMocks);

    beforeEach(() => {
      wrapper = render(
        <ModalManager {...props} />
      );
    });

    it('should render "CheckoutNoteModal"', () => {
      const newProps = {
        ...props,
        checkoutNotesMode: true,
      };

      wrapper.rerender(
        <ModalManager {...newProps} />
      );

      const checkoutNoteModal = screen.getByTestId(testIds.checkoutNoteModal);

      expect(checkoutNoteModal).toBeInTheDocument();
    });
  });

  describe('formatter', () => {
    const checkoutItem = {
      date: 'date',
      note: 'note',
      source: 'source',
    };

    it('should render "date"', () => {
      render(formatter.date(checkoutItem));

      const dates = screen.getAllByText(checkoutItem.date);

      dates.forEach(date => {
        expect(date).toBeVisible();
      });
    });

    it('should render "note"', () => {
      render(formatter.note(checkoutItem));

      const note = screen.getByText(checkoutItem.note);

      expect(note).toBeVisible();
    });

    it('should render "source"', () => {
      render(formatter.source(checkoutItem));

      const source = screen.getByText(checkoutItem.source);

      expect(source).toBeVisible();
    });
  });

  describe('focus', () => {
    let originalRAF;

    beforeAll(() => {
      originalRAF = global.requestAnimationFrame;
      global.requestAnimationFrame = (cb) => cb();
    });

    afterAll(() => {
      global.requestAnimationFrame = originalRAF;
    });

    it('should focus barcodeEl.current when onDone is called', () => {
      const focusMock = jest.fn();
      const barcodeEl = {
        current: {
          focus: focusMock,
        },
      };
      const props = {
        ...basicProps,
        barcodeEl,
        checkedoutItem: {
          ...basicProps.checkedoutItem,
          numberOfPieces: 2,
        },
      };

      render(<ModalManager {...props} />);

      fireEvent.click(screen.getByTestId(testIds.confirmNoteModalButton));
      fireEvent.click(screen.getByTestId(testIds.multipieceConfirmButton));

      expect(focusMock).toHaveBeenCalled();
    });

    it('should focus barcodeEl.current when onCancel is called', () => {
      const focusMock = jest.fn();
      const barcodeEl = {
        current: {
          focus: focusMock,
        },
      };
      const props = {
        ...basicProps,
        barcodeEl,
        checkedoutItem: {
          ...basicProps.checkedoutItem,
          numberOfPieces: 2,
        },
      };

      render(<ModalManager {...props} />);

      fireEvent.click(screen.getByTestId(testIds.confirmNoteModalButton));
      fireEvent.click(screen.getByTestId(testIds.multipieceCloseButton));

      expect(focusMock).toHaveBeenCalled();
    });
  });
});
