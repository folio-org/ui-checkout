import React from 'react';

jest.mock('@folio/stripes/core', () => ({
  stripesConnect: (Component) => (props) => (
    <Component
      {...props}
      stripes={{
        logger: () => {},
      }}
    />
  ),
  stripesShape: {},
  withStripes: (Component) => (props) => <Component {...props} />,
  withModules: (Component) => (props) => <Component {...props} />,
  TitleManager: jest.fn(({ children, ...rest }) => (
    <span {...rest}>{children}</span>
  )),
  Pluggable: jest.fn((props) => (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      {...props}
      onClick={typeof props.selectUser === 'function' && props.user ? props.selectUser(props.user) : () => {}}
    >
      {props.children}
    </div>
  )),
  IfPermission: jest.fn(({ children }) => <div>{children}</div>),
  IfAnyPermission: jest.fn(({ children }) => <div>{children}</div>),
}));
