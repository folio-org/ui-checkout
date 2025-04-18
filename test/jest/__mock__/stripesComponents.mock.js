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
      {children}
    </button>
  )),
  Checkbox: jest.fn((props) => (
    <label htmlFor="id">
      {props.label}
      <input id="id" type="checkbox" {...props} />
    </label>
  )),
  Col: jest.fn(({ children, ...rest }) => (
    <div {...rest}>{typeof children === 'function' ? children() : children}</div>
  )),
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
  dayjs: jest.fn(() => ({
    format: () => '02/02/2023',
    isSameOrAfter: () => true,
    isSameOrBefore: () => true,
  })),
  Dropdown: jest.fn(({
    renderTrigger,
    renderMenu,
  }) => (
    <div>
      {renderTrigger({ getTriggerProps: jest.fn() })}
      {renderMenu({ onToggle: jest.fn() })}
    </div>
  )),
  DropdownMenu: jest.fn(({ children, ...rest }) => <div {...rest}>{ children }</div>),
  FormattedDate: jest.fn(({ value }) => (
    <div data-testid="formattedDate">
      {value}
    </div>
  )),
  FormattedTime: jest.fn(({ value }) => (
    <div data-testid="formattedTime">
      {value}
    </div>
  )),
  Headline: jest.fn(({ children }) => (
    <div>
      {children}
    </div>
  )),
  KeyValue: jest.fn(({
    'data-testid': testId,
    label,
    value,
    children,
  }) => (
    <div data-testid={testId}>
      <span>{label}</span>
      <span data-testid="keyValue">{value || children}</span>
    </div>
  )),
  Icon: jest.fn(({ icon }) => (
    <div>
      {icon}
    </div>
  )),
  MCLPagingTypes: {
    PREV_NEXT: 'prev-next',
  },
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
  MultiColumnList: jest.fn(({
    children,
    formatter,
    contentData,
    onNeedMoreData,
  }) => {
    return (
      <div>
        {
          contentData.map(item => (
            Object.keys(formatter).map(key => {
              return formatter[key](item);
            })
          ))
        }
        <button
          type="button"
          data-testid="loadMoreButton"
          onClick={onNeedMoreData}
        >
          Load more
        </button>
        {children}
      </div>
    );
  }),
  Pane: jest.fn(({
    paneTitle,
    paneSub,
    lastMenu,
    children,
  }) => (
    <div>
      <span>{paneTitle}</span>
      <span>{paneSub}</span>
      <span>{lastMenu}</span>
      {children}
    </div>
  )),
  Paneset: jest.fn(({ children }) => (
    <div>
      {children}
    </div>
  )),
  Row: jest.fn(({ children, ...rest }) => <div {...rest}>{children}</div>),
  TextArea: jest.fn(({
    label,
    onChange,
    value,
    'data-testid': testId,
  }) => (
    <>
      {label}
      <textarea
        data-testid={testId}
        onChange={onChange}
        value={value}
      />
    </>
  )),
  TextField: jest.fn((props) => <input {...props} />),
  Tooltip: jest.fn(({
    children,
    text,
    ...rest
  }) => (
    <div {...rest}>
      {text}
      {children}
    </div>
  )),
}));
