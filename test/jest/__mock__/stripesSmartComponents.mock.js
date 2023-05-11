import React from 'react';

jest.mock('@folio/stripes/smart-components', () => ({
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
}));
