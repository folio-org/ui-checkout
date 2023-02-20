import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  render,
  screen,
} from '@testing-library/react';

import { stripes } from '../package';

import '../test/jest/__mock__';

import CheckOutRouting from './index';

const { route } = stripes;
const testIds = {
  checkOutComponent: 'checkOutComponent',
  noMatch: 'noMatch',
};

jest.mock('./CheckOut', () => () => <div data-testid={testIds.checkOutComponent}>CheckOut</div>);

describe('UI CheckOut', () => {
  const renderCheckOut = () => {
    const component = (
      <Router>
        <CheckOutRouting
          stripes={{
            connect: (item) => item,
          }}
          match={{
            path: route,
            url: route,
            isExact: true,
            params: {},
          }}
          location={{
            pathname: route,
            search: '',
            hash: '',
          }}
        />
      </Router>
    );

    return render(component);
  };

  it('should render error page', () => {
    renderCheckOut();

    expect(screen.getByTestId(testIds.noMatch)).toBeInTheDocument();
  });

  it('should render on component route', () => {
    window.history.pushState({}, '', route);

    renderCheckOut();

    expect(screen.getByTestId(testIds.checkOutComponent)).toBeInTheDocument();
  });
});
