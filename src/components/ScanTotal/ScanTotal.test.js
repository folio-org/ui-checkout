import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react';

import '../../../test/jest/__mock__';

import ScanTotal from './ScanTotal';

const testIds = {
  scanTotal: 'scanTotal',
  endSessionButton: 'endSessionButton',
};
const messageIds = {
  endSessionButtonLabel: 'ui-checkout.end.session',
  totalItemsScanned: 'ui-checkout.totalItemsScanned',
};

describe('ScanTotal', () => {
  const basicProps = {
    buttonId: 'id',
    onSessionEnd: jest.fn(),
    total: 1,
  };

  describe('when "total" more that 0', () => {
    beforeEach(() => {
      render(
        <ScanTotal
          {...basicProps}
        />
      );
    });

    afterEach(cleanup);

    it('should render "ScanTotal" component', () => {
      const scanTotal = screen.getByTestId(testIds.scanTotal);

      expect(scanTotal).toBeInTheDocument();
    });

    it('should render total items label', () => {
      const totalItemsScanned = screen.getByText(messageIds.totalItemsScanned);

      expect(totalItemsScanned).toBeInTheDocument();
    });

    it('should render end session button label', () => {
      const endSessionButtonLabel = screen.getByText(messageIds.endSessionButtonLabel);

      expect(endSessionButtonLabel).toBeInTheDocument();
    });

    it('should trigger "onSessionEnd"', () => {
      const endSessionButton = screen.getByTestId(testIds.endSessionButton);

      fireEvent.click(endSessionButton);

      expect(basicProps.onSessionEnd).toHaveBeenCalled();
    });
  });

  describe('when "total" equals 0 or less then 0', () => {
    const props = {
      ...basicProps,
      total: 0,
    };

    beforeEach(() => {
      render(
        <ScanTotal
          {...props}
        />
      );
    });

    it('should not render total items label', () => {
      const totalItemsScanned = screen.queryByText(messageIds.totalItemsScanned);

      expect(totalItemsScanned).not.toBeInTheDocument();
    });
  });
});
