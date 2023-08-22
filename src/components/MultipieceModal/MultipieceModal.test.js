import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../test/jest/__mock__';

import { Modal } from '@folio/stripes/components';

import MultipieceModal from './MultipieceModal';

const testIds = {
  multipieceModal: 'multipieceModal',
  confirmButton: 'confirmButton',
  cancelButton: 'cancelButton',
};
const messageIds = {
  modalLabel: 'ui-checkout.multipieceModal.label',
  message: 'ui-checkout.multipieceModal.message',
  numberOfPieces: 'ui-checkout.multipieceModal.item.numberOfPieces',
  descriptionOfPieces: 'ui-checkout.multipieceModal.item.descriptionOfPieces',
  numberOfMissingPieces: 'ui-checkout.multipieceModal.item.numberOfMissingPieces',
  descriptionOfmissingPieces: 'ui-checkout.multipieceModal.item.descriptionOfmissingPieces',
  confirmButton: 'ui-checkout.multipieceModal.confirm',
  cancelButton: 'ui-checkout.multipieceModal.cancel',
};

describe('MultipieceModal', () => {
  const basicProps = {
    open: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    item: {
      title: 'title',
      barcode: '123',
      materialType: 'book',
      numberOfPieces: 'numberOfPieces',
      descriptionOfPieces: 'descriptionOfPieces',
    },
  };

  describe('when all props are provided', () => {
    const props = {
      ...basicProps,
      item: {
        ...basicProps.item,
        numberOfMissingPieces: 'numberOfMissingPieces',
        descriptionOfmissingPieces: 'descriptionOfmissingPieces',
      },
    };

    beforeEach(() => {
      render(
        <MultipieceModal
          {...props}
        />
      );
    });

    afterEach(() => {
      cleanup();
    });

    it('should render modal window', () => {
      const modalWindow = screen.getByTestId(testIds.multipieceModal);

      expect(modalWindow).toBeInTheDocument();
    });

    it('should trigger "Modal" component with correct props', () => {
      const expectedProps = {
        id: 'multipiece-modal',
        size: 'small',
        dismissible: true,
        onClose: basicProps.onClose,
        open: basicProps.open,
      };

      expect(Modal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should have correct label', () => {
      const modalWindowLabel = screen.getByText(messageIds.modalLabel);

      expect(modalWindowLabel).toBeInTheDocument();
    });

    it('should have correct message', () => {
      const modalWindowMessage = screen.getByText(messageIds.message);

      expect(modalWindowMessage).toBeInTheDocument();
    });

    it('should render numberOfPieces label', () => {
      const numberOfPiecesLabel = screen.getByText(messageIds.numberOfPieces);

      expect(numberOfPiecesLabel).toBeInTheDocument();
    });

    it('should render descriptionOfPieces label', () => {
      const descriptionOfPiecesLabel = screen.getByText(messageIds.descriptionOfPieces);

      expect(descriptionOfPiecesLabel).toBeInTheDocument();
    });

    it('should render numberOfMissingPieces label', () => {
      const numberOfMissingPiecesLabel = screen.getByText(messageIds.numberOfMissingPieces);

      expect(numberOfMissingPiecesLabel).toBeInTheDocument();
    });

    it('should render descriptionOfmissingPieces label', () => {
      const descriptionOfmissingPiecesLabel = screen.getByText(messageIds.descriptionOfmissingPieces);

      expect(descriptionOfmissingPiecesLabel).toBeInTheDocument();
    });

    it('should render confirm button label', () => {
      const confirmButtonLabel = screen.getByText(messageIds.confirmButton);

      expect(confirmButtonLabel).toBeInTheDocument();
    });

    it('should render cancel button label', () => {
      const cancelButtonLabel = screen.getByText(messageIds.cancelButton);

      expect(cancelButtonLabel).toBeInTheDocument();
    });

    it('should trigger "onConfirm" with correct argument after clicking on confirm button', () => {
      fireEvent.click(screen.getByTestId(testIds.confirmButton));

      expect(basicProps.onConfirm).toHaveBeenCalledWith(props.item);
    });

    it('should trigger "onClose" after clicking on cancel button', () => {
      fireEvent.click(screen.getByTestId(testIds.cancelButton));

      expect(basicProps.onClose).toHaveBeenCalled();
    });
  });

  describe('when "numberOfMissingPieces" and "descriptionOfmissingPieces" are not provided', () => {
    beforeEach(() => {
      render(
        <MultipieceModal
          {...basicProps}
        />
      );
    });

    it('should not render numberOfMissingPieces label', () => {
      const numberOfMissingPiecesLabel = screen.queryByText(messageIds.numberOfMissingPieces);

      expect(numberOfMissingPiecesLabel).not.toBeInTheDocument();
    });

    it('should not render descriptionOfmissingPieces label', () => {
      const descriptionOfmissingPiecesLabel = screen.queryByText(messageIds.descriptionOfmissingPieces);

      expect(descriptionOfmissingPiecesLabel).not.toBeInTheDocument();
    });
  });
});
