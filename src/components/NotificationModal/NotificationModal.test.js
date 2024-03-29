import { FormattedMessage } from 'react-intl';

import {
  render,
  screen,
  fireEvent
} from '@folio/jest-config-stripes/testing-library/react';

import NotificationModal from './NotificationModal';

describe('NotificationModal', () => {
  const closeModal = jest.fn();
  const testIds = {
    notificationModal: 'notificationModal',
    footerCloseButton: 'footerCloseButton',
  };
  const labelIds = {
    footerMessageId: 'ui-checkout.close',
    labelMessageId: 'ui-checkout.sampleLabel',
    messageId: 'ui-checkout.sampleMessage',
  };
  const baseConfig = {
    onClose: closeModal,
    label: <FormattedMessage id={labelIds.labelMessageId} />,
    message: <FormattedMessage id={labelIds.messageId} />,
  };
  const renderComponent = ({ ...props }) => {
    render(
      <NotificationModal
        {...props}
      />
    );
  };

  beforeEach(() => renderComponent(baseConfig));

  it('should be rendered', () => {
    expect(screen.getByTestId(testIds.notificationModal)).toBeInTheDocument();
  });

  it('should have corresponding footer message', () => {
    expect(screen.getByText(labelIds.footerMessageId)).toBeInTheDocument();
  });

  it('should have corresponding label', () => {
    expect(screen.getByText(labelIds.labelMessageId)).toBeInTheDocument();
  });

  it('should have corresponding message', () => {
    expect(screen.getByText(labelIds.messageId)).toBeInTheDocument();
  });

  it('should trigger onClose function after clicking the close button', () => {
    fireEvent.click(screen.getByTestId(testIds.footerCloseButton));

    expect(closeModal).toHaveBeenCalled();
  });
});
