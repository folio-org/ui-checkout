import React from 'react';

jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual('react-router-dom'),
    Link: jest.fn(({ to, children, ...rest }) => (
      <span data-test-to={to} {...rest}>
        {children}
      </span>
    )),
  };
});
