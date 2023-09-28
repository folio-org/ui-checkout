import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import ScanFooter from './ScanFooter';
import ScanTotal from '../ScanTotal';

jest.mock('../ScanTotal', () => jest.fn(() => null));

const testIds = {
  scanFooter: 'scanFooter',
};

describe('ScanFooter', () => {
  const props = {
    test: 'test',
  };

  beforeEach(() => {
    render(
      <ScanFooter
        {...props}
      />
    );
  });

  it('should render "ScanFooter" component', () => {
    const scanFooter = screen.getByTestId(testIds.scanFooter);

    expect(scanFooter).toBeInTheDocument();
  });

  it('should trigger "ScanTotal" with correct props', () => {
    const expectedProps = {
      ...props,
      buttonId: 'clickable-done-footer',
    };

    expect(ScanTotal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
  });
});
