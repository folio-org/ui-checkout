import React from 'react';

jest.mock('@folio/stripes/components', () => ({
  Button: jest.fn(({
    children,
    ...rest
  }) => (
    <button
      type="button"
      {...rest}
    >
      <span>
        {children}
      </span>
    </button>
  )),
  Checkbox: jest.fn((props) => (
    <label htmlFor="id">
      {props.label}
      <input id="id" type="checkbox" {...props} />
    </label>
  )),
  Col: jest.fn(({ children, ...rest }) => <div {...rest}>{children}</div>),
  ConfirmationModal: jest.fn(({
    heading,
    message,
    onCancel,
    onConfirm,
    cancelLabel,
    confirmLabel,
    ...rest
  }) => (
    <div data-testid="confirmationModal" {...rest}>
      <span>{heading}</span>
      <span>{message}</span>
      <button type="button" onClick={onCancel}>{cancelLabel || 'Cancel'}</button>
      <button type="button" onClick={onConfirm}>{confirmLabel || 'Confirm'}</button>
    </div>
  )),
  FormattedDate: jest.fn(({ value }) => (
    <div data-testid>
      {value}
    </div>
  )),
  FormattedTime: jest.fn(({ value }) => (
    <div>
      {value}
    </div>
  )),
  Icon: jest.fn(({ icon }) => (
    <div>
      {icon}
    </div>
  )),
  Modal: jest.fn(({
    children,
    label,
    footer,
    id,
    'data-testid': testId,
  }) => (
    <div
      id={id}
      data-testid={testId ?? 'modalWindow'}
    >
      <p>{label}</p>
      {children}
      {footer}
    </div>
  )),
  ModalFooter: jest.fn(({ children }) => (
    <div>
      {children}
    </div>
  )),
  MultiColumnList: jest.fn(({ children }) => (
    <div>
      {children}
    </div>
  )),
  Row: jest.fn(({ children, ...rest }) => <div {...rest}>{children}</div>),
  KeyValue: jest.fn(({
    'data-testid': testId,
    label,
    value,
  }) => (
    <div data-testid={testId}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )),
}));
