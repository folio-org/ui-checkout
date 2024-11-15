import { FormattedMessage } from 'react-intl';

import {
  fireEvent,
  render,
  screen,
  cleanup
} from '@folio/jest-config-stripes/testing-library/react';

import { runAxeTest } from '@folio/stripes-testing';

import buildStripes from '../../../test/jest/__mock__/stripes.mock';
import componentPropsCheck from '../../../test/jest/helpers/utils';

import {
  BACKEND_ERROR_CODES,
  ERROR_MESSAGE_TRANSLATION_ID_BY_BACKEND_ERROR_CODE,
} from '../../constants';

import ErrorModal from './ErrorModal';

describe('ErrorModal', () => {
  const onClose = jest.fn();
  const openOverrideModal = jest.fn();
  const hasPerm = (arg) => arg === 'ui-users.overrideItemBlock' || arg === 'ui-users.override-item-block.execute';
  const testIds = {
    errorModal: 'errorModal',
    errorItem: 'errorItem',
    overrideButton: 'overrideButton',
    closeButton: 'closeButton',
    messageToDisplay: 'messageToDisplay',
  };
  const baseError = {
    message: 'Error message',
    parameters: [{
      value: 'testParameterValue',
    }],
  };
  const baseProps = {
    onClose,
    onConfirm: () => null,
    open: true,
    errors: [],
    stripes: buildStripes(),
  };

  const renderComponent = (props) => {
    const combined = { ...baseProps, ...props };

    render(<ErrorModal {...combined} />);
  };

  afterEach(cleanup);

  it('should render with no axe errors', async () => {
    renderComponent();

    await runAxeTest({
      rootNode: document.body,
    });
  });

  it('should render error modal', () => {
    renderComponent();

    expect(screen.getByTestId(testIds.errorModal)).toBeInTheDocument();
  });

  it('should call onClose when clicking the close button', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId(testIds.closeButton));
    expect(onClose).toHaveBeenCalled();
  });

  describe('override button', () => {
    it('should render if user has perms & errors fit', () => {
      renderComponent({
        errors: [{
          ...baseError,
          code: BACKEND_ERROR_CODES.itemNotLoanable,
        }],
        stripes: {
          ...buildStripes(),
          hasPerm,
        }
      });

      expect(screen.getByTestId(testIds.overrideButton)).toBeInTheDocument();
    });

    it('should not render if user does not have perms', () => {
      renderComponent({
        errors: [{
          ...baseError,
          code: BACKEND_ERROR_CODES.itemNotLoanable,
        }],
      });

      expect(screen.queryByTestId(testIds.overrideButton)).not.toBeInTheDocument();
    });

    it('should not render if errors not fit', () => {
      renderComponent({
        errors: [{
          ...baseError,
          code: BACKEND_ERROR_CODES.itemHasOpenLoan,
        }],
        stripes: {
          ...buildStripes(),
          hasPerm,
        }
      });

      expect(screen.queryByTestId(testIds.overrideButton)).not.toBeInTheDocument();
    });

    it('should call openOverrideModal when clicking the override button', () => {
      renderComponent({
        errors: [{
          ...baseError,
          code: BACKEND_ERROR_CODES.itemNotLoanable,
        }],
        stripes: {
          ...buildStripes(),
          hasPerm,
        },
        openOverrideModal,
      });

      fireEvent.click(screen.getByTestId(testIds.overrideButton));
      expect(openOverrideModal).toHaveBeenCalled();
    });
  });

  describe('errors', () => {
    it('should return plaintext error message without code', () => {
      renderComponent({
        errors: [baseError]
      });

      expect(screen.getByText(baseError.message)).toBeInTheDocument();
    });

    it('should return no error message with code and code to hide = true', () => {
      renderComponent({
        errors: [{
          ...baseError,
          code: BACKEND_ERROR_CODES.itemHasOpenLoan,
        }]
      });

      expect(screen.queryByText(baseError.message)).not.toBeInTheDocument();
    });

    it('should return plaintext error message with code that has no translation id', () => {
      renderComponent({
        errors: [{
          ...baseError,
          code: '0xdeadbeef',
        }]
      });

      expect(screen.getByText(baseError.message)).toBeInTheDocument();
    });

    it('should return formatted error message for itemNotLoanable error code', () => {
      const item = {
        title: 'itemTitle',
        barcode: 'itemBarcode',
        materialType: {
          name: 'materialTypeName',
        },
      };

      renderComponent({
        errors: [{
          ...baseError,
          code: BACKEND_ERROR_CODES.itemNotLoanable,
        }],
        item,
      });

      componentPropsCheck(FormattedMessage, testIds.messageToDisplay, {
        id: ERROR_MESSAGE_TRANSLATION_ID_BY_BACKEND_ERROR_CODE[
          BACKEND_ERROR_CODES.itemNotLoanable
        ],
        values: {
          ...item,
          materialType: item.materialType.name,
          loanPolicy: baseError?.parameters[0]?.value,
        },
      }, true);
    });

    it('should return formatted error message for userHasNoBarcode error code', () => {
      renderComponent({
        errors: [{
          ...baseError,
          code: BACKEND_ERROR_CODES.userHasNoBarcode,
        }],
      });

      componentPropsCheck(FormattedMessage, testIds.messageToDisplay, {
        id: ERROR_MESSAGE_TRANSLATION_ID_BY_BACKEND_ERROR_CODE[
          BACKEND_ERROR_CODES.userHasNoBarcode
        ],
      }, true);
    });

    it('should return formatted error message for other error codes that have the translation', () => {
      renderComponent({
        errors: [{
          ...baseError,
          code: BACKEND_ERROR_CODES.itemLimitMaterialType,
        }],
      });

      componentPropsCheck(FormattedMessage, testIds.messageToDisplay, {
        id: ERROR_MESSAGE_TRANSLATION_ID_BY_BACKEND_ERROR_CODE[
          BACKEND_ERROR_CODES.itemLimitMaterialType
        ],
      }, true);
    });
  });
});
