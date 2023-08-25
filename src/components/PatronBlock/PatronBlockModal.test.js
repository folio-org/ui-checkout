import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../test/jest/__mock__';

import { Modal } from '@folio/stripes/components';

import PatronBlockModal from './PatronBlockModal';
import { renderOrderedPatronBlocks } from '../../util';

jest.mock('../../util', () => ({
  renderOrderedPatronBlocks: jest.fn(),
}));

const testIds = {
  patronBlockModal: 'patronBlockModal',
  overrideButton: 'overrideButton',
  closeButton: 'closeButton',
  detailsButton: 'detailsButton',
};
const messageIds = {
  modalLabel: 'ui-checkout.blockModal',
  blockedLabel: 'ui-checkout.blockedLabel',
  additionalReasons: 'ui-checkout.additionalReasons',
  overrideButtonLabel: 'ui-checkout.override',
  closeButtonLabel: 'ui-checkout.close',
  detailsButtonLabel: 'ui-checkout.detailsButton',
};

describe('PatronBlockModal', () => {
  const basicProps = {
    open: true,
    onClose: jest.fn(),
    patronBlocks: [
      {
        id: 'id_1',
        message: 'message_1',
      },
      {
        id: 'id_2',
        message: 'message_2',
      },
      {
        id: 'id_3',
        message: 'message_3',
      },
      {
        id: 'id_4',
        message: 'message_4',
      },
    ],
    viewUserPath: jest.fn(),
    openOverrideModal: jest.fn(),
  };

  describe('when "patronBlocks" is not empty', () => {
    beforeEach(() => {
      render(
        <PatronBlockModal
          {...basicProps}
        />
      );
    });

    afterEach(cleanup);

    it('should trigger "renderOrderedPatronBlocks" with correct arguments', () => {
      expect(renderOrderedPatronBlocks).toHaveBeenCalledWith(basicProps.patronBlocks);
    });

    it('should render modal window', () => {
      const modalWindow = screen.getByTestId(testIds.patronBlockModal);

      expect(modalWindow).toBeInTheDocument();
    });

    it('should render modal label', () => {
      const modalWindowLabel = screen.getByText(messageIds.modalLabel);

      expect(modalWindowLabel).toBeVisible();
    });

    it('should trigger "Modal" component with correct props', () => {
      const expectedProps = {
        open: basicProps.open,
        onClose: basicProps.onClose,
        dismissible: true,
      };

      expect(Modal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should render "blockedLabel"', () => {
      const blockedLabel = screen.getByText(messageIds.blockedLabel, { exact: false });

      expect(blockedLabel).toBeVisible();
    });

    it('should render "additionalReasons" message', () => {
      const additionalReasonsMessage = screen.getByText(messageIds.additionalReasons);

      expect(additionalReasonsMessage).toBeVisible();
    });

    it('should render override button label', () => {
      const overrideButtonLabel = screen.getByText(messageIds.overrideButtonLabel);

      expect(overrideButtonLabel).toBeVisible();
    });

    it('should render close button label', () => {
      const closeButtonLabel = screen.getByText(messageIds.closeButtonLabel);

      expect(closeButtonLabel).toBeVisible();
    });

    it('should render details button label', () => {
      const detailsButtonLabel = screen.getByText(messageIds.detailsButtonLabel);

      expect(detailsButtonLabel).toBeVisible();
    });

    it('should trigger "openOverrideModal"', () => {
      fireEvent.click(screen.getByTestId(testIds.overrideButton));

      expect(basicProps.openOverrideModal).toHaveBeenCalled();
    });

    it('should trigger "onClose"', () => {
      fireEvent.click(screen.getByTestId(testIds.closeButton));

      expect(basicProps.onClose).toHaveBeenCalled();
    });

    it('should trigger "viewUserPath"', () => {
      fireEvent.click(screen.getByTestId(testIds.detailsButton));

      expect(basicProps.viewUserPath).toHaveBeenCalled();
    });
  });

  describe('when "patronBlocks" is not empty array', () => {
    const props = {
      ...basicProps,
      patronBlocks: [],
    };

    beforeEach(() => {
      render(
        <PatronBlockModal
          {...props}
        />
      );
    });

    it('should not render "additionalReasons" message', () => {
      const additionalReasonsMessage = screen.queryByText(messageIds.additionalReasons);

      expect(additionalReasonsMessage).not.toBeInTheDocument();
    });
  });
});
