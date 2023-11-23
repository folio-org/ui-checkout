import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import AddInfoDialog from './AddInfoDialog';

const infoType = 'infoType';
const labelIds = {
  cancelButton: 'ui-checkout.cancel',
  saveAndCloseButton: 'ui-checkout.saveAndClose',
  modalLabel: `ui-checkout.checkout.addInfo.${infoType}.header`,
  modalBody: `ui-checkout.checkout.addInfo.${infoType}.body`,
};
const testIds = {
  addInfoDialogField: 'addInfoDialogField',
};
const props = {
  infoType,
  loan: {
    item: {
      title: 'itemTitle',
      materialType: {
        name: 'materialTypeName'
      },
      barcode: 'barcode',
    },
  },
  addPatronOrStaffInfo: jest.fn().mockResolvedValue({}),
  onClose: jest.fn(),
};
const elementValue = {
  value: 'value',
};
const event = {
  target: {
    value: 'value',
  },
};

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(() => ({
    sendCallout: jest.fn(),
  })),
}));

describe('AddInfoDialog', () => {
  jest.spyOn(document, 'getElementById').mockReturnValue(elementValue);

  beforeEach(() => {
    render(
      <AddInfoDialog
        {...props}
      />
    );
  });

  it('should render modal label', () => {
    const modalLabel = screen.getByText(labelIds.modalLabel);

    expect(modalLabel).toBeVisible();
  });

  it('should render modal body', () => {
    const modalBody = screen.getByText(labelIds.modalBody);

    expect(modalBody).toBeVisible();
  });

  it('should render cancel button label', () => {
    const cancelButton = screen.getByText(labelIds.cancelButton);

    expect(cancelButton).toBeVisible();
  });

  it('should render save and close button label', () => {
    const saveAndCloseButton = screen.getByText(labelIds.saveAndCloseButton);

    expect(saveAndCloseButton).toBeVisible();
  });

  it('should render disabled save and close button', () => {
    const saveAndCloseButton = screen.getByText(labelIds.saveAndCloseButton);

    expect(saveAndCloseButton).toBeDisabled();
  });

  it('should enable save and close button', () => {
    const addInfoDialogField = screen.getByTestId(testIds.addInfoDialogField);

    fireEvent.change(addInfoDialogField, event);

    const saveAndCloseButton = screen.getByText(labelIds.saveAndCloseButton);

    expect(saveAndCloseButton).toBeEnabled();
  });

  describe('Data submitting', () => {
    beforeEach(() => {
      const addInfoDialogField = screen.getByTestId(testIds.addInfoDialogField);
      const saveAndCloseButton = screen.getByText(labelIds.saveAndCloseButton);

      fireEvent.change(addInfoDialogField, event);
      fireEvent.click(saveAndCloseButton);
    });

    it('should save patron and staff info', () => {
      const expectedArgs = [props.loan, props.infoType, elementValue.value];

      expect(props.addPatronOrStaffInfo).toHaveBeenCalledWith(...expectedArgs);
    });

    it('should trigger onClose', async () => {
      await waitFor(() => {
        expect(props.onClose).toHaveBeenCalled();
      });
    });
  });
});
