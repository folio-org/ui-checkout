import React from 'react';
import { noop } from 'lodash';

import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import {
  Icon,
  Pane,
  Paneset,
  Button,
} from '@folio/stripes/components';
import { NotePopupModal } from '@folio/stripes/smart-components';
import { Pluggable } from '@folio/stripes/core';

import CheckOut from './CheckOut';
import PatronForm from './components/PatronForm';
import ViewPatron from './components/ViewPatron';
import ScanFooter from './components/ScanFooter';
import ScanItems from './ScanItems';
import PatronBlockModal from './components/PatronBlock/PatronBlockModal';
import OverrideModal from './components/OverrideModal';
import NotificationModal from './components/NotificationModal';
import {
  getPatronIdentifiers,
  buildIdentifierQuery,
  buildRequestQuery,
  getCheckoutSettings,
  getPatronBlocks,
} from './util';

const basicProps = {
  stripes: {
    store: {},
    connect: jest.fn(component => component),
  },
  resources: {
    activeRecord: {},
    scannedItems: [],
    patronBlockOverriddenInfo: {
      patronBlock: {},
      comment: '',
    },
    patrons: {
      records: [],
    },
    settings: {
      records: [],
    },
    checkoutSettings: {
      records: [],
    },
    manualPatronBlocks: {
      records: [],
    },
    automatedPatronBlocks: {
      records: [],
    },
    requests: {
      records: [],
    },
    proxiesFor: {
      records: [],
    },
    selPatron: {},
  },
  mutator: {
    patrons: {
      GET: jest.fn(),
      reset: jest.fn(),
    },
    selPatron: {
      replace: jest.fn(),
    },
    scannedItems: {
      replace: jest.fn(),
    },
    patronBlockOverriddenInfo: {
      replace: jest.fn(),
    },
    activeRecord: {
      update: jest.fn(),
    },
    requests: {
      GET: jest.fn(),
      reset: jest.fn(),
    },
    loans: {
      GET: jest.fn(),
      reset: jest.fn(),
    },
    proxy: {
      GET: jest.fn(),
      reset: jest.fn(),
    },
    automatedPatronBlocks: {
      GET: jest.fn(),
      reset: jest.fn(),
    },
    manualPatronBlocks: {
      GET: jest.fn(),
      DELETE: jest.fn(),
      reset: jest.fn(),
    },
    endSession: {
      POST: jest.fn(),
    },
  },
  history: {
    push: jest.fn(),
  },
  location: {
    state: {},
  },
};
const labelIds = {
  scanPatronCard: 'ui-checkout.scanPatronCard',
  scanItems: 'ui-checkout.scanItems',
  fastAddLabel: 'ui-checkout.fastAddLabel',
  awaitingPickupMessage: 'ui-checkout.awaitingPickupMessage',
  awaitingPickupLabel: 'ui-checkout.awaitingPickupLabel',
};
const testIds = {
  patronForm: 'patronForm',
  selectPatron: 'selectPatron',
  clearPatron: 'clearPatron',
};
const createRefMock = {
  current: {
    focus: jest.fn(),
    reset: jest.fn(),
    getState: jest.fn(),
  },
};
const identifierQuery = 'identifierQuery';
const locationWithState = {
  state: {
    patronBarcode: 'patronBarcode',
    itemBarcode: 'itemBarcode',
  },
};

jest.mock('./components/PatronForm', () => jest.fn(({
  onSubmit,
}) => {
  return (
    <form
      data-testid={testIds.patronForm}
      onSubmit={onSubmit}
    />
  );
}));
jest.mock('./components/ViewPatron', () => jest.fn(() => <div />));
jest.mock('./components/ScanFooter', () => jest.fn(() => <div />));
jest.mock('./ScanItems', () => jest.fn(() => <div />));
jest.mock('./components/PatronBlock/PatronBlockModal', () => jest.fn(() => <div />));
jest.mock('./components/OverrideModal', () => jest.fn(() => <div />));
jest.mock('./components/NotificationModal', () => jest.fn(() => <div />));
jest.mock('./util', () => ({
  getPatronIdentifiers: jest.fn(() => 11),
  buildIdentifierQuery: jest.fn(() => identifierQuery),
  buildRequestQuery: jest.fn(),
  getCheckoutSettings: jest.fn(),
  getPatronBlocks: jest.fn(),
}));

jest.spyOn(React, 'createRef').mockReturnValue(createRefMock);

describe('CheckOut', () => {
  const userIdentifiers = 'userIdentifiers';
  const patronBlocks = 'patronBlocks';
  const settings = {};

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial render', () => {
    beforeEach(() => {
      getPatronIdentifiers.mockReturnValueOnce(userIdentifiers);
      getPatronBlocks.mockReturnValueOnce(patronBlocks);
      getCheckoutSettings.mockReturnValueOnce(settings);

      render(<CheckOut {...basicProps} />);
    });

    it('should render scan patron card label', () => {
      const scanPatronCardLabel = screen.getByText(labelIds.scanPatronCard);

      expect(scanPatronCardLabel).toBeInTheDocument();
    });

    it('should render scan items label', () => {
      const scanItemsLabel = screen.getByText(labelIds.scanItems);

      expect(scanItemsLabel).toBeInTheDocument();
    });

    it('should render fast add button label', () => {
      const fastAddLabel = screen.getByText(labelIds.fastAddLabel);

      expect(fastAddLabel).toBeInTheDocument();
    });

    it('should trigger focus', () => {
      expect(createRefMock.current.focus).toHaveBeenCalled();
    });

    it('should trigger "PatronForm" with correct props', () => {
      const expectedProps = {
        onSubmit: expect.any(Function),
        userIdentifiers,
        patron: basicProps.resources.selPatron,
        forwardedRef: createRefMock,
        formRef: createRefMock,
        initialValues: {},
      };

      expect(PatronForm).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger "ScanItems" with correct props', () => {
      const expectedProps = {
        parentMutator: basicProps.mutator,
        parentResources: basicProps.resources,
        stripes: basicProps.stripes,
        openBlockedModal: expect.any(Function),
        onSessionEnd: expect.any(Function),
        patronBlocks,
        patronBlockOverriddenInfo: basicProps.resources.patronBlockOverriddenInfo,
        proxy: {},
        settings,
        shouldSubmitAutomatically: false,
        formRef: createRefMock,
        initialValues: {},
      };

      expect(ScanItems).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger "PatronBlockModal" with correct props', () => {
      const expectedProps = {
        open: false,
        openOverrideModal: expect.any(Function),
        onClose: expect.any(Function),
        viewUserPath: expect.any(Function),
        patronBlocks,
      };

      expect(PatronBlockModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger "NotificationModal" with correct props', () => {
      const expectedProps = {
        id: 'awaiting-pickup-modal',
        open: false,
        onClose: expect.any(Function),
      };

      expect(NotificationModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger "NotePopupModal" with correct props', () => {
      const expectedProps = {
        id: 'user-popup-note-modal',
        domainName: 'users',
        entityType: 'user',
        popUpPropertyName: 'popUpOnCheckOut',
        entityId: undefined,
      };

      expect(NotePopupModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger "Pluggable" with correct props', () => {
      const expectedProps = {
        id: 'clickable-create-inventory-records',
        type: 'create-inventory-records',
        open: undefined,
        onClose: expect.any(Function),
        renderTrigger: noop,
      };

      expect(Pluggable).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should not trigger "Icon"', () => {
      expect(Icon).not.toHaveBeenCalled();
    });

    it('should not trigger "ViewPatron"', () => {
      expect(ViewPatron).not.toHaveBeenCalled();
    });

    it('should not trigger "ScanFooter"', () => {
      expect(ScanFooter).not.toHaveBeenCalled();
    });

    it('should not trigger "OverrideModal"', () => {
      expect(OverrideModal).not.toHaveBeenCalled();
    });
  });

  describe('When location contains patron and item information', () => {
    const props = {
      ...basicProps,
      location: locationWithState,
    };

    beforeEach(() => {
      render(<CheckOut {...props} />);
    });

    it('should not trigger focus', () => {
      expect(createRefMock.current.focus).not.toHaveBeenCalled();
    });

    it('should trigger "PatronForm" with correct "initialValues" prop', () => {
      const expectedProps = {
        initialValues: {
          patron: {
            identifier: props.location.state.patronBarcode,
          },
        },
      };

      expect(PatronForm).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger "ScanItems" with correct "initialValues" prop', () => {
      const expectedProps = {
        initialValues: {
          item: {
            barcode: props.location.state.itemBarcode,
          },
        },
      };

      expect(ScanItems).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });
  });

  describe('Form submitting', () => {
    describe('When patron information is provided', () => {
      const patronData = {
        patron: {},
      };
      const patrons = [
        {
          id: 'id',
        }
      ];
      const proxies = [{}];

      beforeEach(() => {
        PatronForm.mockImplementationOnce(({ onSubmit }) => {
          const handleSubmit = () => {
            onSubmit(patronData);
          }

          return (
            <form
              data-testid={testIds.patronForm}
              onSubmit={handleSubmit}
            />
          );
        });
        basicProps.mutator.proxy.GET.mockResolvedValueOnce(proxies);
      });

      describe('When "patrons.GET" returns data', () => {
        beforeEach(() => {
          basicProps.mutator.patrons.GET.mockResolvedValueOnce(patrons);

          render(<CheckOut {...basicProps} />);

          const patronForm = screen.getByTestId(testIds.patronForm);

          fireEvent.submit(patronForm);
        });

        it('should trigger "scannedItems.replace" with correct argument', () => {
          expect(basicProps.mutator.scannedItems.replace).toHaveBeenCalledWith([]);
        });

        it('should trigger "patrons.reset"', () => {
          expect(basicProps.mutator.patrons.reset).toHaveBeenCalled();
        });

        it('should trigger "selPatron.replace" with correct argument', () => {
          expect(basicProps.mutator.selPatron.replace).toHaveBeenCalledWith({});
        });

        it('should trigger "patronBlockOverriddenInfo.replace" with correct argument',  () => {
          expect(basicProps.mutator.patronBlockOverriddenInfo.replace).toHaveBeenCalledWith({});
        });

        it('should trigger "patrons.GET" with correct argument',  () => {
          expect(basicProps.mutator.patrons.GET).toHaveBeenCalledWith({
            params: {
              query: identifierQuery,
            },
          });
        });

        it('should trigger "activeRecord.update" with correct argument',  () => {
          expect(basicProps.mutator.activeRecord.update).toHaveBeenCalledWith({
            patronId: patrons[0].id,
          });
        });

        it('should trigger "manualPatronBlocks.reset"',  () => {
          expect(basicProps.mutator.manualPatronBlocks.reset).toHaveBeenCalled();
        });

        it('should trigger "manualPatronBlocks.GET"',  () => {
          expect(basicProps.mutator.manualPatronBlocks.GET).toHaveBeenCalled();
        });

        it('should trigger "automatedPatronBlocks.reset"',  () => {
          expect(basicProps.mutator.automatedPatronBlocks.reset).toHaveBeenCalled();
        });

        it('should trigger "automatedPatronBlocks.GET"',  () => {
          expect(basicProps.mutator.automatedPatronBlocks.GET).toHaveBeenCalled();
        });

        it('should trigger "proxy.reset"',  () => {
          expect(basicProps.mutator.proxy.reset).toHaveBeenCalled();
        });

        it('should trigger "proxy.GET" with correct argument',  () => {
          const query = `query=(proxyUserId==${patrons[0].id})`;

          expect(basicProps.mutator.proxy.GET).toHaveBeenCalledWith({
            params: {
              query,
            },
          });
        });

        it('should trigger "Icon" with correct props', async () => {
          const expectedProps = {
            icon: 'spinner-ellipsis',
            width: '10px',
          };

          await waitFor(() => {
            expect(Icon).toHaveBeenCalledWith(expectedProps, {});
          });
        });

        // it('should trigger "PatronBlockModal" with correct "open" property', () => {
        //   const expectedProps = {
        //     open: false,
        //   };
        //
        //   expect(PatronBlockModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
        // });
      });

      describe('When "patrons.GET" returns empty array', () => {
        beforeEach(() => {
          basicProps.mutator.patrons.GET.mockResolvedValueOnce([]);

          render(<CheckOut {...basicProps} />);

          const patronForm = screen.getByTestId(testIds.patronForm);

          fireEvent.submit(patronForm);
        });

        it('should not trigger "activeRecord.update"',  () => {
          expect(basicProps.mutator.activeRecord.update).not.toHaveBeenCalled();
        });

        it('should trigger "manualPatronBlocks.reset"',  () => {
          expect(basicProps.mutator.manualPatronBlocks.reset).not.toHaveBeenCalled();
        });

        it('should trigger "manualPatronBlocks.GET"',  () => {
          expect(basicProps.mutator.manualPatronBlocks.GET).not.toHaveBeenCalled();
        });

        it('should trigger "automatedPatronBlocks.reset"',  () => {
          expect(basicProps.mutator.automatedPatronBlocks.reset).not.toHaveBeenCalled();
        });

        it('should trigger "automatedPatronBlocks.GET"',  () => {
          expect(basicProps.mutator.automatedPatronBlocks.GET).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('When patron records are not empty', () => {
    const props = {
      ...basicProps,
      resources: {
        ...basicProps.resources,
        patrons: {
          records: [
            {
              id: 'recordId',
            }
          ],
        },
      },
    };
    const selectedPatron = {
      id: 'selectedPatronId',
    };

    beforeEach(() => {
      getPatronBlocks.mockReturnValueOnce(patronBlocks);
      ViewPatron.mockImplementation(({
        onSelectPatron,
        onClearPatron,
      }) => {
        const selectPatron = () => {
          onSelectPatron(selectedPatron);
        };
        const clearPatron = () => {
          onClearPatron();
        };

        return (
          <>
            <button
              data-testid={testIds.selectPatron}
              onClick={selectPatron}
            >
              Select Patron
            </button>
            <button
              data-testid={testIds.clearPatron}
              onClick={clearPatron}
            >
              Clear Patron
            </button>
          </>
        );
      });

      render(<CheckOut {...props} />);
    });

    it('should trigger "ViewPatron" with correct props', () => {
      const expectedProps = {
        onSelectPatron: expect.any(Function),
        onClearPatron: expect.any(Function),
        patron: props.resources.patrons.records[0],
        patronBlocks,
        proxy: {},
        settings: props.resources.settings.records,
      };

      expect(ViewPatron).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger "selPatron.replace" with correct argument', () => {
      const selectPatronButton = screen.getByTestId(testIds.selectPatron);

      fireEvent.click(selectPatronButton);

      expect(props.mutator.selPatron.replace).toHaveBeenCalledWith(selectedPatron);
    });

    it('should trigger "activeRecord.update" with correct argument', () => {
      const selectPatronButton = screen.getByTestId(testIds.selectPatron);

      fireEvent.click(selectPatronButton);

      expect(props.mutator.activeRecord.update).toHaveBeenCalledWith({
        patronId: selectedPatron.id,
      });
    });

    it('should trigger "requests.reset"', () => {
      const selectPatronButton = screen.getByTestId(testIds.selectPatron);

      fireEvent.click(selectPatronButton);

      expect(props.mutator.requests.reset).toHaveBeenCalled();
    });
  });
});
