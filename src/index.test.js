import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import CheckOutRouting from './index';

const testIds = {
  checkOut: 'checkOut',
  noMatch: 'noMatch',
};
const checkoutRoute = '/checkout';
const basicProps = {
  stripes: {
    connect: (component) => component,
  },
  match: {
    path: checkoutRoute,
  },
  location: {
    pathname: checkoutRoute,
  },
};

jest.mock('./CheckOut', () => () => <div data-testid={testIds.checkOut}>CheckOut</div>);

describe('UI CheckOut', () => {
  describe('When route is matched', () => {
    beforeEach(() => {
      render(
        <MemoryRouter initialEntries={[checkoutRoute]}>
          <CheckOutRouting
            {...basicProps}
          />
        </MemoryRouter>
      );
    });

    it('should render "CheckOut" component', () => {
      expect(screen.getByTestId(testIds.checkOut)).toBeInTheDocument();
    });
  });

  describe('When route is not matched', () => {
    const badRoute = '/bad-route';
    const props = {
      ...basicProps,
      match: {
        path: badRoute,
      },
      location: {
        pathname: badRoute,
      },
    };

    beforeEach(() => {
      render(
        <MemoryRouter initialEntries={[checkoutRoute]}>
          <CheckOutRouting
            {...props}
          />
        </MemoryRouter>
      );
    });

    it('should render "NoMatch" component', () => {
      expect(screen.getByTestId(testIds.noMatch)).toBeInTheDocument();
    });
  });
});
