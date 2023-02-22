import React from 'react';

jest.mock('@folio/stripes/core', () => ({
  stripesShape: {},
  IfPermission: jest.fn(({ children }) => <div>{children}</div>),
}));
