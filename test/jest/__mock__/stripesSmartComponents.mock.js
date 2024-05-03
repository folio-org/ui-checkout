import React from 'react';

jest.mock('@folio/stripes/smart-components', () => ({
  ChangeDueDateDialog: jest.fn(({
    onClose,
    children,
    ...rest
  }) => (
    <div {...rest}>
      <button
        data-testid="closeDueDateDialog"
        type="button"
        onClick={onClose}
      >
        Close
      </button>
      {children}
    </div>
  )),
  DueDatePicker: jest.fn(({
    dateProps,
    timeProps,
  }) => (
    <>
      {timeProps.label}
      <input type="time" />
      {dateProps.label}
      <input type="date" />
    </>
  )),
  NotePopupModal: jest.fn(({
    label,
  }) => (
    <div>
      <span>{label}</span>
    </div>
  )),
  ProxyManager: jest.fn(() => <div />),
  ProfilePicture: () => <div>ProfilePicture</div>,
}));
