import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import '../../../test/jest/__mock__';

import PatronBlock from './PatronBlock';

describe('PatronBlock', () => {
  const testIds = {
    patronBlock: 'patronBlock',
    patronBlockLink: 'patronBlockLink',
    patronBlockLabel: 'patronBlockLabel',
    warnIcon: 'warnIcon',
  };
  const labelIds = {
    label: 'ui-checkout.patronBlocks',
    patronMessage: 'ui-checkout.patronBlocksCount',
  };
  const renderComponent = (props) => {
    const combined = {
      patronBlocksCount: 1,
      user: {
        id: 0,
      },
      ...props,
    };

    render(<PatronBlock {...combined} />);
  };

  describe('when patronBlocks > 0', () => {
    beforeEach(() => renderComponent());

    it('should render patronBlock container', () => {
      expect(screen.getByTestId(testIds.patronBlock)).toBeInTheDocument();
    });

    it('should render label container', () => {
      expect(screen.getByTestId(testIds.patronBlockLabel)).toBeInTheDocument();
    });

    it('should render label FormattedMessage', () => {
      expect(screen.getByText(labelIds.label)).toBeInTheDocument();
    });

    it('should render warning icons', () => {
      expect(screen.getByTestId(testIds.warnIcon)).toBeInTheDocument();
    });

    it('should render user link', () => {
      expect(screen.getByTestId(testIds.patronBlockLink)).toBeInTheDocument();
    });
  });

  describe('when patronBlocks <= 0', () => {
    beforeEach(() => renderComponent({
      patronBlocksCount: 0,
    }));

    it('should not render warning icons', () => {
      expect(screen.queryByTestId(testIds.warnIcon)).not.toBeInTheDocument();
    });

    it('should not render user link', () => {
      expect(screen.queryByTestId(testIds.patronBlockLink)).not.toBeInTheDocument();
    });
  });
});
