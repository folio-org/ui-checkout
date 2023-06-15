import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';

import '../../../test/jest/__mock__';

import PatronForm, {
  getIdentifier,
} from './PatronForm';

jest.mock('react-final-form', () => ({
  ...jest.requireActual('react-final-form'),
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
  Field: jest.fn(({ onChange, ...rest }) => <div onClick={onChange} {...rest} />),
}));
jest.mock('@folio/stripes/final-form', () => () => jest.fn((component) => component));

const testIds = {
  patronForm: 'patronForm',
  patronIdentifier: 'patronIdentifier',
  clickableFindPatronButton: 'clickableFindPatronButton',
  clickableFindPatronPluggable: 'clickableFindPatronPluggable',
};

describe('PatronForm', () => {
  const mockedHandleSubmit = jest.fn();
  const mockedInitialValues = {};
  const mockedForm = {
    change: jest.fn(),
    reset: jest.fn(),
    getState: jest.fn(() => ({ values: mockedInitialValues })),
  };
  const props = {
    handleSubmit: mockedHandleSubmit,
    userIdentifiers: [],
    submitting: false,
    submitFailed: false,
    patron: {},
    forwardedRef: {},
    formRef: {},
    form: mockedForm,
  };
  describe('without error', () => {
    beforeEach(() => {
      render(
        <PatronForm
          {...props}
        />
      );
    });

    afterEach(() => {
      mockedHandleSubmit.mockClear();
    });

    it('should render patron form', () => {
      expect(screen.getByTestId(testIds.patronForm)).toBeInTheDocument();
    });

    it('should render patron identifier', () => {
      expect(screen.getByTestId(testIds.patronIdentifier)).toBeInTheDocument();
    });

    it('should render clickable find patron button', () => {
      expect(screen.getByTestId(testIds.clickableFindPatronButton)).toBeInTheDocument();
    });

    it('should render clickable find patron pluggable', () => {
      expect(screen.getByTestId(testIds.clickableFindPatronPluggable)).toBeInTheDocument();
    });

    it('should call "handleSubmit" on form submit', () => {
      fireEvent.submit(screen.getByTestId(testIds.patronForm));

      expect(mockedHandleSubmit).toHaveBeenCalled();
    });
  });

  describe('with error', () => {
    const error = 'submitErrors patron identifier';
    const customProps = {
      ...props,
      form: {
        ...mockedForm,
        getState: jest.fn(() => ({
          hasSubmitErrors: true,
          submitErrors: {
            patron: {
              identifier: error,
            },
          },
        })),
      },
    };

    beforeEach(() => {
      render(
        <PatronForm
          {...customProps}
        />
      );
    });

    it('should call "handleSubmit" on form submit', () => {
      fireEvent.submit(screen.getByTestId(testIds.patronForm));

      expect(mockedHandleSubmit).toHaveBeenCalled();
    });

    it('should render submit errors', () => {
      expect(screen.getByText(error)).toBeInTheDocument();
    });
  });

  describe('selectUser', () => {
    it('should submit', () => {
      const customProps = {
        ...props,
        userIdentifiers: ['1'],
        user: {
          1: {},
        },
      };

      jest.useFakeTimers();

      render(
        <PatronForm
          {...customProps}
        />
      );

      fireEvent.click(screen.getByTestId(testIds.clickableFindPatronPluggable));

      jest.runAllTimers();

      expect(mockedHandleSubmit).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should set error', () => {
      const username = 'user name';
      const identifier = '2';
      const customProps = {
        ...props,
        userIdentifiers: [identifier],
        user: {
          username,
        },
      };
      const assignToObject = jest.fn();

      jest.spyOn(Object, 'assign').mockImplementationOnce(assignToObject);

      render(
        <PatronForm
          {...customProps}
        />
      );

      fireEvent.click(screen.getByTestId(testIds.clickableFindPatronPluggable));

      expect(assignToObject).toHaveBeenCalledWith(
        {
          username : 'user name',
        }, {
          error: expect.any(Object),
        }
      );
    });
  });

  describe('getIdentifier', () => {
    const firstIdentifier = '1';
    const secondIdentifier = '2';
    const identifier = [
      firstIdentifier,
      secondIdentifier,
    ];

    it('should return first identifier', () => {
      expect(getIdentifier([firstIdentifier])).toEqual(firstIdentifier);
    });

    it('should return id', () => {
      expect(getIdentifier(identifier)).toEqual('id');
    });
  });
});
