import React from 'react';
import { noop } from 'lodash';
import createInactivityTimer from 'inactivity-timer';

import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from '@folio/jest-config-stripes/testing-library/react';
import { Icon } from '@folio/stripes/components';
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
    patronGroups: {
      records: [
        {
          id: 'groupId',
          group: 'group',
        }
      ],
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
  notePopupModalLabel: 'ui-checkout.notes.popupModal.label',
};
const testIds = {
  patronForm: 'patronForm',
  selectPatron: 'selectPatron',
  clearPatron: 'clearPatron',
  openOverrideModal: 'openOverrideModal',
  overridePatron: 'overridePatron',
  closeOverrideModal: 'closeOverrideModal',
  viewUserPath: 'viewUserPath',
  fastAddButton: 'fastAddButton',
  closePluggable: 'closePluggable',
  closeAwaitingPickupModal: 'closeAwaitingPickupModal',
  endSession: 'endSession',
};
const createRefMock = {
  current: {
    focus: jest.fn(),
    reset: jest.fn(),
    getState: jest.fn(() => ({
      submitting: true,
    })),
  },
};
const identifierQuery = 'identifierQuery';
const userIdentifiers = 'userIdentifiers';
const locationWithState = {
  state: {
    patronBarcode: 'patronBarcode',
    itemBarcode: 'itemBarcode',
  },
};

jest.mock('inactivity-timer', () => jest.fn());
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
jest.mock('./components/NotificationModal', () => jest.fn(({
  message,
  label,
  onClose,
}) => (
  <div>
    <span>{message}</span>
    <span>{label}</span>
    <button
      type="button"
      onClick={onClose}
      data-testid={testIds.closeAwaitingPickupModal}
    >
      Close
    </button>
  </div>
)));
jest.mock('./util', () => ({
  getPatronIdentifiers: jest.fn(() => userIdentifiers),
  buildIdentifierQuery: jest.fn(() => identifierQuery),
  buildRequestQuery: jest.fn(),
  getCheckoutSettings: jest.fn(),
  getPatronBlocks: jest.fn(),
}));

jest.spyOn(React, 'createRef').mockReturnValue(createRefMock);
jest.useFakeTimers();

describe('CheckOut', () => {
  const patronBlocks = 'patronBlocks';
  const settings = {};
  const signal = jest.fn();
  const clear = jest.fn();
  createInactivityTimer.mockImplementation((time, cb) => {
    setTimeout(cb, time);

    return {
      signal,
      clear,
    };
  });

  describe('Initial render', () => {
    const props = {
      ...basicProps,
      resources: {
        ...basicProps.resources,
        selPatron: {
          records: [
            {
              id: 'selPatronId',
            }
          ],
        },
      }
    };

    afterEach(() => {
      jest.clearAllMocks();
      cleanup();
    });

    beforeEach(() => {
      getPatronIdentifiers.mockReturnValueOnce(userIdentifiers);
      getPatronBlocks.mockReturnValueOnce(patronBlocks);
      getCheckoutSettings.mockReturnValueOnce(settings);

      render(<CheckOut {...props} />);
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

    it('should render awaiting pickup message', () => {
      const awaitingPickupMessage = screen.getByText(labelIds.awaitingPickupMessage);

      expect(awaitingPickupMessage).toBeInTheDocument();
    });

    it('should render awaiting pickup label', () => {
      const awaitingPickupLabel = screen.getByText(labelIds.awaitingPickupLabel);

      expect(awaitingPickupLabel).toBeInTheDocument();
    });

    it('should render note popup modal label', () => {
      const notePopupModalLabel = screen.getByText(labelIds.notePopupModalLabel);

      expect(notePopupModalLabel).toBeInTheDocument();
    });

    it('should trigger focus', () => {
      expect(createRefMock.current.focus).toHaveBeenCalled();
    });

    it('should trigger "PatronForm" with correct props', () => {
      const expectedProps = {
        onSubmit: expect.any(Function),
        userIdentifiers,
        patron: props.resources.selPatron,
        forwardedRef: createRefMock,
        formRef: createRefMock,
        initialValues: {},
      };

      expect(PatronForm).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger "ScanItems" with correct props', () => {
      const expectedProps = {
        parentMutator: basicProps.mutator,
        parentResources: props.resources,
        stripes: basicProps.stripes,
        openBlockedModal: expect.any(Function),
        onSessionEnd: expect.any(Function),
        patronBlocks,
        patronBlockOverriddenInfo: basicProps.resources.patronBlockOverriddenInfo,
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

    afterEach(() => {
      jest.clearAllMocks();
      cleanup();
    });

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
    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('When patron and proxies information is provided', () => {
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
          };

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

        it('should trigger "patronBlockOverriddenInfo.replace" with correct argument', () => {
          expect(basicProps.mutator.patronBlockOverriddenInfo.replace).toHaveBeenCalledWith({});
        });

        it('should trigger "patrons.GET" with correct argument', () => {
          const expectedArg = {
            params: {
              query: identifierQuery,
            },
          };

          expect(basicProps.mutator.patrons.GET).toHaveBeenCalledWith(expectedArg);
        });

        it('should trigger "activeRecord.update" with correct argument', () => {
          const expectedArg = {
            patronId: patrons[0].id,
          };

          expect(basicProps.mutator.activeRecord.update).toHaveBeenCalledWith(expectedArg);
        });

        it('should trigger "manualPatronBlocks.reset"', () => {
          expect(basicProps.mutator.manualPatronBlocks.reset).toHaveBeenCalled();
        });

        it('should trigger "manualPatronBlocks.GET"', () => {
          expect(basicProps.mutator.manualPatronBlocks.GET).toHaveBeenCalled();
        });

        it('should trigger "automatedPatronBlocks.reset"', () => {
          expect(basicProps.mutator.automatedPatronBlocks.reset).toHaveBeenCalled();
        });

        it('should trigger "automatedPatronBlocks.GET"', () => {
          expect(basicProps.mutator.automatedPatronBlocks.GET).toHaveBeenCalled();
        });

        it('should trigger "proxy.reset"', () => {
          expect(basicProps.mutator.proxy.reset).toHaveBeenCalled();
        });

        it('should trigger "proxy.GET" with correct argument', () => {
          const query = `query=(proxyUserId==${patrons[0].id})`;
          const expectedArg = {
            params: {
              query,
            },
          };

          expect(basicProps.mutator.proxy.GET).toHaveBeenCalledWith(expectedArg);
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
      });

      describe('When "patrons.GET" returns empty array', () => {
        beforeEach(() => {
          basicProps.mutator.patrons.GET.mockResolvedValueOnce([]);

          render(<CheckOut {...basicProps} />);

          const patronForm = screen.getByTestId(testIds.patronForm);

          fireEvent.submit(patronForm);
        });

        it('should not trigger "activeRecord.update"', () => {
          expect(basicProps.mutator.activeRecord.update).not.toHaveBeenCalled();
        });

        it('should trigger "manualPatronBlocks.reset"', () => {
          expect(basicProps.mutator.manualPatronBlocks.reset).not.toHaveBeenCalled();
        });

        it('should trigger "manualPatronBlocks.GET"', () => {
          expect(basicProps.mutator.manualPatronBlocks.GET).not.toHaveBeenCalled();
        });

        it('should trigger "automatedPatronBlocks.reset"', () => {
          expect(basicProps.mutator.automatedPatronBlocks.reset).not.toHaveBeenCalled();
        });

        it('should trigger "automatedPatronBlocks.GET"', () => {
          expect(basicProps.mutator.automatedPatronBlocks.GET).not.toHaveBeenCalled();
        });
      });

      describe('When location contains patron and item information', () => {
        const props = {
          ...basicProps,
          location: locationWithState,
        };
        const dispatchEvent = jest.fn();
        const querySelector = jest.fn(() => ({
          dispatchEvent,
        }));

        jest.spyOn(document, 'querySelector').mockImplementation(querySelector);

        beforeEach(() => {
          basicProps.mutator.patrons.GET.mockResolvedValueOnce(patrons);

          render(<CheckOut {...props} />);
          querySelector.mockClear();
          dispatchEvent.mockClear();

          const patronForm = screen.getByTestId(testIds.patronForm);

          fireEvent.submit(patronForm);
        });

        it('should trigger "document.querySelector" with correct selector', () => {
          const selector = '#item-form';

          expect(querySelector).toHaveBeenCalledWith(selector);
        });

        it('should trigger "dispatchEvent" with correct argument', () => {
          expect(dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
        });
      });
    });

    describe('When patron information is not provided', () => {
      beforeEach(() => {
        render(<CheckOut {...basicProps} />);

        const patronForm = screen.getByTestId(testIds.patronForm);

        fireEvent.submit(patronForm);
      });

      it('should trigger "requests.reset"', () => {
        expect(basicProps.mutator.requests.reset).toHaveBeenCalled();
      });

      it('should not trigger "scannedItems.replace"', () => {
        expect(basicProps.mutator.scannedItems.replace).not.toHaveBeenCalled();
      });

      it('should not trigger "patrons.reset"', () => {
        expect(basicProps.mutator.patrons.reset).not.toHaveBeenCalled();
      });

      it('should not trigger "selPatron.replace"', () => {
        expect(basicProps.mutator.selPatron.replace).not.toHaveBeenCalled();
      });

      it('should not trigger "patronBlockOverriddenInfo.replace"', () => {
        expect(basicProps.mutator.patronBlockOverriddenInfo.replace).not.toHaveBeenCalled();
      });
    });
  });

  describe('Patron selection', () => {
    const selectedPatron = {
      id: 'selectedPatronId',
    };
    const query = 'query';
    const requests = {
      totalRecords: 2,
    };
    const comment = 'comment';
    const dateAfterTomorrow = (new Date()).getDate() + 2;

    afterEach(() => {
      jest.clearAllMocks();
      cleanup();
    });

    beforeEach(() => {
      buildRequestQuery.mockReturnValueOnce(query);
      getPatronBlocks.mockReturnValueOnce(patronBlocks);
      basicProps.mutator.requests.GET.mockResolvedValueOnce(requests);
      OverrideModal.mockImplementation(({
        onOverride,
        closeOverrideModal,
      }) => (
        <div>
          <button
            type="button"
            onClick={() => onOverride({ comment })}
            data-testid={testIds.overridePatron}
          >
            Override Patron
          </button>
          <button
            type="button"
            data-testid={testIds.closeOverrideModal}
            onClick={closeOverrideModal}
          >
            Close Override Modal
          </button>
        </div>
      ));
      PatronBlockModal.mockImplementationOnce(({
        openOverrideModal,
        viewUserPath,
      }) => (
        <div>
          <button
            type="button"
            onClick={openOverrideModal}
            data-testid={testIds.openOverrideModal}
          >
            Open Override Modal
          </button>
          <button
            type="button"
            onClick={viewUserPath}
            data-testid={testIds.viewUserPath}
          >
            View User Path
          </button>
        </div>
      ));
      ViewPatron.mockImplementationOnce(({
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
              type="button"
              data-testid={testIds.selectPatron}
              onClick={selectPatron}
            >
              Select Patron
            </button>
            <button
              type="button"
              data-testid={testIds.clearPatron}
              onClick={clearPatron}
            >
              Clear Patron
            </button>
          </>
        );
      });
    });

    describe('When patron acts as himself', () => {
      const props = {
        ...basicProps,
        stripes: {
          ...basicProps.stripes,
          user: {
            user: {
              curServicePoint: {
                id: 'curServicePointId',
              },
            },
          },
        },
        resources: {
          ...basicProps.resources,
          patrons: {
            records: [
              {
                id: selectedPatron.id,
                patronGroup: basicProps.resources.patronGroups.records[0].id,
              }
            ],
          },
          patronBlockOverriddenInfo: {},
          automatedPatronBlocks: {
            records: [
              {
                blockBorrowing: true,
              }
            ],
          },
          manualPatronBlocks: {
            records: [
              {
                borrowing: true,
                userId: 'userId',
                expirationDate: dateAfterTomorrow,
              }
            ],
          },
        },
      };

      beforeEach(() => {
        render(<CheckOut {...props} />);

        const selectPatronButton = screen.getByTestId(testIds.selectPatron);

        fireEvent.click(selectPatronButton);
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
        expect(props.mutator.selPatron.replace).toHaveBeenCalledWith(selectedPatron);
      });

      it('should trigger "requests.reset"', () => {
        expect(props.mutator.requests.reset).toHaveBeenCalled();
      });

      it('should trigger "activeRecord.update" with correct argument', () => {
        const expectedArg = {
          patronId: selectedPatron.id,
        };

        expect(props.mutator.activeRecord.update).toHaveBeenCalledWith(expectedArg);
      });

      it('should trigger "buildRequestQuery" with correct arguments', () => {
        expect(buildRequestQuery).toHaveBeenCalledWith(selectedPatron.id, props.stripes.user.user.curServicePoint.id);
      });

      it('should trigger "requests.GET" with correct argument', () => {
        const expectedArg = {
          params: {
            query,
          },
        };

        expect(props.mutator.requests.GET).toHaveBeenCalledWith(expectedArg);
      });

      it('should trigger "NotificationModal" with "open" property equals true', async () => {
        const expectedProps = {
          open: true,
        };

        await waitFor(() => {
          expect(NotificationModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
        });
      });

      it('should trigger "NotificationModal" with "open" property equals false', async () => {
        const expectedProps = {
          open: false,
        };
        const closeAwaitingPickupModalButton = screen.getByTestId(testIds.closeAwaitingPickupModal);

        fireEvent.click(closeAwaitingPickupModalButton);

        await waitFor(() => {
          expect(NotificationModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
        });
      });

      it('should trigger "PatronBlockModal" with "open" property equals true', async () => {
        const expectedProps = {
          open: true,
        };

        await waitFor(() => {
          expect(PatronBlockModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
        });
      });

      it('should trigger "PatronBlockModal" with "open" property equals false', async () => {
        const expectedProps = {
          open: false,
        };
        const openOverrideModalButton = screen.getByTestId(testIds.openOverrideModal);

        fireEvent.click(openOverrideModalButton);

        await waitFor(() => {
          expect(PatronBlockModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
        });
      });

      it('should trigger "history.push" with correct argument', async () => {
        const viewUserPath = `/users/view/${props.resources.patrons.records[0].id}?filters=pg.${basicProps.resources.patronGroups.records[0].group}`;
        const viewUserPathButton = screen.getByTestId(testIds.viewUserPath);

        fireEvent.click(viewUserPathButton);

        await waitFor(() => {
          expect(props.history.push).toHaveBeenCalledWith(viewUserPath);
        });
      });

      it('should trigger "OverrideModal" with correct props', async () => {
        const expectedProps = {
          overridePatronBlock: true,
          stripes: props.stripes,
          onOverride: expect.any(Function),
          overrideModalOpen: true,
          closeOverrideModal: expect.any(Function),
          patronBlocks: [],
          patronBlockOverriddenInfo: props.resources.patronBlockOverriddenInfo,
        };
        const openOverrideModalButton = screen.getByTestId(testIds.openOverrideModal);

        fireEvent.click(openOverrideModalButton);

        await waitFor(() => {
          expect(OverrideModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
        });
      });

      it('should trigger "patronBlockOverriddenInfo.replace" with correct argument', async () => {
        const patronBlockOverriddenInfo = {
          patronBlock: {},
          comment,
        };
        const openOverrideModalButton = screen.getByTestId(testIds.openOverrideModal);

        fireEvent.click(openOverrideModalButton);

        const overridePatronButton = screen.getByTestId(testIds.overridePatron);

        fireEvent.click(overridePatronButton);

        await waitFor(() => {
          expect(props.mutator.patronBlockOverriddenInfo.replace).toHaveBeenCalledWith(patronBlockOverriddenInfo);
        });
      });

      it('should not trigger "OverrideModal"', async () => {
        const openOverrideModalButton = screen.getByTestId(testIds.openOverrideModal);

        fireEvent.click(openOverrideModalButton);
        OverrideModal.mockClear();

        const closeOverrideModalButton = screen.getByTestId(testIds.closeOverrideModal);

        fireEvent.click(closeOverrideModalButton);

        await waitFor(() => {
          expect(OverrideModal).not.toHaveBeenCalled();
        });
      });
    });

    describe('When patron does not act as himself', () => {
      const props = {
        ...basicProps,
        resources: {
          ...basicProps.resources,
          patrons: {
            records: [
              {
                id: 'patronId',
              }
            ],
          },
          manualPatronBlocks: {
            records: [
              {
                borrowing: true,
                userId: 'userId',
                expirationDate: dateAfterTomorrow,
              }
            ],
          },
        },
      };

      beforeEach(() => {
        render(<CheckOut {...props} />);

        const selectPatronButton = screen.getByTestId(testIds.selectPatron);

        fireEvent.click(selectPatronButton);
      });

      it('should trigger "selPatron.replace" with correct argument', () => {
        expect(props.mutator.selPatron.replace).toHaveBeenCalledWith(selectedPatron);
      });

      it('should trigger "activeRecord.update" with correct argument', () => {
        expect(props.mutator.activeRecord.update).toHaveBeenCalledWith({
          patronId: selectedPatron.id,
        });
      });

      it('should trigger "requests.reset"', () => {
        expect(props.mutator.requests.reset).toHaveBeenCalled();
      });
    });
  });

  describe('Pluggable', () => {
    afterEach(() => {
      jest.clearAllMocks();
      cleanup();
    });

    beforeEach(() => {
      Pluggable.mockImplementation(({
        onClose,
      }) => (
        <div>
          <button
            type="button"
            onClick={onClose}
            data-testid={testIds.closePluggable}
          >
            Close
          </button>
        </div>
      ));

      render(<CheckOut {...basicProps} />);
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

    it('should trigger "Pluggable" with "open" property equals true', async () => {
      const expectedProps = {
        open: true,
      };
      const fastAddButton = screen.getByTestId(testIds.fastAddButton);

      fireEvent.click(fastAddButton);

      await waitFor(() => {
        expect(Pluggable).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    it('should trigger "Pluggable" with "open" property equals false', async () => {
      const expectedProps = {
        open: false,
      };
      const fastAddButton = screen.getByTestId(testIds.fastAddButton);
      const closePluggableButton = screen.getByTestId(testIds.closePluggable);

      fireEvent.click(fastAddButton);
      Pluggable.mockClear();
      fireEvent.click(closePluggableButton);

      await waitFor(() => {
        expect(Pluggable).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });
  });

  describe('Session ending', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    beforeEach(() => {
      ScanFooter.mockImplementation(({
        onSessionEnd,
      }) => (
        <div>
          <button
            type="button"
            onClick={onSessionEnd}
            data-testid={testIds.endSession}
          >
            End Session
          </button>
        </div>
      ));
    });

    describe('When no "patronId"', () => {
      const props = {
        ...basicProps,
        resources: {
          ...basicProps.resources,
          patrons: {
            records: [
              {}
            ],
          },
        },
      };

      beforeEach(() => {
        render(<CheckOut {...props} />);

        const endSessionButton = screen.getByTestId(testIds.endSession);

        fireEvent.click(endSessionButton);
      });

      it('should trigger "current.getState"', () => {
        expect(createRefMock.current.getState).toHaveBeenCalled();
      });

      it('should trigger "patronBlockOverriddenInfo.replace" with correct argument', () => {
        expect(basicProps.mutator.patronBlockOverriddenInfo.replace).toHaveBeenCalledWith({});
      });

      it('should trigger "current.reset" once', () => {
        expect(createRefMock.current.reset).toHaveBeenCalledTimes(1);
      });

      it('should not trigger "endSession.POST"', () => {
        expect(basicProps.mutator.endSession.POST).not.toHaveBeenCalled();
      });
    });

    describe('When "patronId" is presented', () => {
      const props = {
        ...basicProps,
        resources: {
          ...basicProps.resources,
          patrons: {
            records: [
              {}
            ],
          },
          activeRecord: {
            patronId: 'patronId',
          },
        },
      };

      beforeEach(() => {
        createRefMock.current.getState.mockResolvedValueOnce({
          submitting: false,
        });

        render(<CheckOut {...props} />);

        const endSessionButton = screen.getByTestId(testIds.endSession);

        fireEvent.click(endSessionButton);
      });

      it('should trigger "current.getState"', () => {
        expect(createRefMock.current.getState).toHaveBeenCalled();
      });

      it('should trigger "patronBlockOverriddenInfo.replace" with correct argument', () => {
        expect(basicProps.mutator.patronBlockOverriddenInfo.replace).toHaveBeenCalledWith({});
      });

      it('should trigger "current.reset" twice', () => {
        expect(createRefMock.current.reset).toHaveBeenCalledTimes(2);
      });

      it('should trigger "endSession.POST" with correct argument', () => {
        const expectedArg = {
          endSessions: [
            {
              actionType: 'Check-out',
              patronId: props.resources.activeRecord.patronId,
            }
          ],
        };

        expect(basicProps.mutator.endSession.POST).toHaveBeenCalledWith(expectedArg);
      });

      it('should trigger "activeRecord.update" with correct argument', () => {
        const expectedArg = {
          patronId: null,
          hasTimer: false,
        };

        expect(basicProps.mutator.activeRecord.update).toHaveBeenCalledWith(expectedArg);
      });
    });

    describe('When location contains patron and barcode information', () => {
      const props = {
        ...basicProps,
        resources: {
          ...basicProps.resources,
          patrons: {
            records: [
              {}
            ],
          },
        },
        location: {
          state: {
            patronBarcode: 'patronBarcode',
            itemBarcode: 'itemBarcode',
          },
        },
      };

      beforeEach(() => {
        createRefMock.current.getState.mockResolvedValueOnce({
          submitting: false,
        });

        render(<CheckOut {...props} />);

        const endSessionButton = screen.getByTestId(testIds.endSession);

        fireEvent.click(endSessionButton);
      });

      it('should trigger "current.reset" once', () => {
        expect(createRefMock.current.reset).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Updating', () => {
    const checkoutSettings = {
      checkoutTimeout: {},
      checkoutTimeoutDuration: 1,
    };
    const newProps = {
      ...basicProps,
      resources: {
        ...basicProps.resources,
        checkoutSettings: {
          records: [
            {}
          ]
        },
        activeRecord: {
          patronId: 'patronId',
        },
      },
    };
    const removeEventListenersSpy = jest.spyOn(document, 'removeEventListener');

    describe('When location equals "/"', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'location', {
          value: {
            pathname: '/',
          }
        });
        getPatronIdentifiers.mockReturnValue(userIdentifiers);
        getPatronBlocks.mockReturnValue(patronBlocks);
        getCheckoutSettings.mockReturnValue(checkoutSettings);

        const { rerender } = render(<CheckOut {...basicProps} />);

        rerender(<CheckOut {...newProps} />);
      });

      it('should trigger "getCheckoutSettings" with correct argument', () => {
        expect(getCheckoutSettings).toHaveBeenCalledWith(newProps.resources.checkoutSettings.records);
      });

      it('should trigger "createInactivityTimer" with correct arguments', () => {
        expect(createInactivityTimer).toHaveBeenCalledWith(`${checkoutSettings.checkoutTimeoutDuration}m`, expect.any(Function));
      });

      it('should trigger "activeRecord.update" with correct argument', () => {
        const expectedArg = {
          hasTimer: true,
        };

        expect(basicProps.mutator.activeRecord.update).toHaveBeenCalledWith(expectedArg);
      });

      it('should trigger timer "clear"', () => {
        jest.runAllTimers();

        expect(clear).toHaveBeenCalled();
      });

      it('should trigger "removeEventListeners"', () => {
        jest.runAllTimers();

        expect(removeEventListenersSpy).toHaveBeenCalled();
      });
    });

    describe('When location does not equal "/"', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'location', {
          value: {
            pathname: '/test',
          }
        });
        getPatronIdentifiers.mockReturnValue(userIdentifiers);
        getPatronBlocks.mockReturnValue(patronBlocks);
        getCheckoutSettings.mockReturnValue(checkoutSettings);

        const { rerender } = render(<CheckOut {...basicProps} />);

        rerender(<CheckOut {...newProps} />);
      });

      it('should trigger "current.getState"', () => {
        jest.runAllTimers();

        expect(createRefMock.current.getState).toHaveBeenCalled();
      });

      it('should trigger "removeEventListeners"', () => {
        jest.runAllTimers();

        expect(removeEventListenersSpy).toHaveBeenCalled();
      });
    });

    describe('When "activeRecord.patronId" is not provided', () => {
      beforeEach(() => {
        jest.clearAllMocks();

        const updatedProps = {
          ...basicProps,
          resources: {
            ...basicProps.resources,
            checkoutSettings: {
              records: [
                {}
              ]
            },
            activeRecord: {},
          },
        };
        getPatronIdentifiers.mockReturnValue(userIdentifiers);
        getPatronBlocks.mockReturnValue(patronBlocks);
        getCheckoutSettings.mockReturnValue(checkoutSettings);

        const { rerender } = render(<CheckOut {...basicProps} />);

        rerender(<CheckOut {...updatedProps} />);
      });

      it('should not trigger "activeRecord.update"', () => {
        expect(basicProps.mutator.activeRecord.update).not.toHaveBeenCalled();
      });

      it('should not trigger "createInactivityTimer"', () => {
        expect(createInactivityTimer).not.toHaveBeenCalled();
      });
    });
  });
});
