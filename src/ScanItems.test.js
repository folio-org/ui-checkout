import { get } from 'lodash';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import ScanItems, {
  playSound,
} from './ScanItems';
import ItemForm from './components/ItemForm';
import { MAX_RECORDS_FOR_CHUNK } from './constants';

const basicProps = {
  stripes: {
    store: {},
    user: {
      user: {
        curServicePoint: {
          id: 'servicePointId',
        },
      },
    },
  },
  mutator: {
    items: {
      reset: jest.fn(),
      GET: jest.fn(),
    },
    checkout: {
      POST: jest.fn().mockResolvedValue({}),
    },
    addInfo: {
      POST: jest.fn().mockResolvedValue({}),
    },
    loanId: {
      replace: jest.fn(),
      POST: jest.fn().mockResolvedValue({}),
    },
  },
  settings: {
    wildcardLookupEnabled: false,
    audioAlertsEnabled: true,
    audioTheme: '',
  },
  parentResources: {
    scannedItems: [
      {
        id: 'scannedItemId',
      }
    ],
  },
  parentMutator: {
    automatedPatronBlocks: {
      reset: jest.fn(),
      GET: jest.fn().mockResolvedValue({}),
    },
    scannedItems: {
      replace: jest.fn(),
    },
  },
  patron: {},
  proxy: {},
  patronBlocks: [],
  openBlockedModal: jest.fn(),
  patronBlockOverriddenInfo: {},
  onSessionEnd: jest.fn(),
  shouldSubmitAutomatically: false,
  initialValues: {},
  formRef: {
    current: {
      change: jest.fn(),
    },
  },
};
const testIds = {
  itemForm: 'itemForm',
  modalManager: 'modalManager',
  audioPlayer: 'audioPlayer',
  doneButton: 'doneButton',
  cancelButton: 'cancelButton',
  showNotesButton: 'showNotesButton',
  addPatronInfoButton: 'addPatronInfoButton',
  selectItemButton: 'selectItemButton',
  closeSelectModalButton: 'closeSelectModalButton',
  clearErrorsButton: 'clearErrorsButton',
  overrideButton: 'overrideButton',
};
const labelIds = {
  missingDataError: 'ui-checkout.missingDataError',
  blockModal: 'ui-checkout.blockModal',
};
const mockedLoan = {
  item: {},
  id: 'loanId',
};
const action = 'action';
const actionComment = 'actionComment';

jest.mock('react-audio-player', () => jest.fn(() => <div data-testid={testIds.audioPlayer} />));
jest.mock('@folio/stripes/util', () => ({
  escapeCqlValue: jest.fn(value => value),
}));
jest.mock('./components/ItemForm', () => jest.fn(() => <form data-testid={testIds.itemForm} />));
jest.mock('./components/ViewItem', () => jest.fn(({
  showCheckoutNotes,
  addPatronOrStaffInfo,
}) => {
  const showNotes = () => {
    showCheckoutNotes(mockedLoan);
  };
  const addPatronInfo = () => {
    addPatronOrStaffInfo(mockedLoan, action, actionComment);
  };

  return (
    <div>
      <button
        type="button"
        data-testid={testIds.showNotesButton}
        onClick={showNotes}
      >
        Show checkout notes
      </button>
      <button
        type="button"
        data-testid={testIds.addPatronInfoButton}
        onClick={addPatronInfo}
      >
        Add patron info
      </button>
    </div>
  );
}));
jest.mock('./ModalManager', () => jest.fn(({
  checkedoutItem,
  onDone,
  onCancel,
}) => (
  <div data-testid={testIds.modalManager}>
    <span>{checkedoutItem.title}</span>
    <button
      type="button"
      data-testid={testIds.doneButton}
      onClick={onDone}
    >
      Confirm
    </button>
    <button
      type="button"
      data-testid={testIds.cancelButton}
      onClick={onCancel}
    >
      Cancel
    </button>
  </div>
)));

const renderScanItems = (props = basicProps, submitData = {}, errorPath = '', overrideData = {}) => {
  ItemForm.mockImplementation(({
    checkoutError,
    onSubmit,
    onItemSelection,
    onCloseSelectItemModal,
    onClearCheckoutErrors,
    onOverride,
  }) => {
    const handleSubmit = () => {
      onSubmit(submitData);
    };
    const handleOverride = () => {
      onOverride(overrideData);
    };
    const selectItem = () => {
      onItemSelection({}, {});
    };

    return (
      <>
        <span>{get(checkoutError[0], errorPath, '')}</span>
        <form
          data-testid={testIds.itemForm}
          onSubmit={handleSubmit}
        />
        <button
          type="button"
          data-testid={testIds.selectItemButton}
          onClick={selectItem}
        >
          Select Item
        </button>
        <button
          type="button"
          data-testid={testIds.closeSelectModalButton}
          onClick={onCloseSelectItemModal}
        >
          Close Select Item Modal
        </button>
        <button
          type="button"
          data-testid={testIds.clearErrorsButton}
          onClick={onClearCheckoutErrors}
        >
          Clear Errors
        </button>
        <button
          type="button"
          data-testid={testIds.overrideButton}
          onClick={handleOverride}
        >
          Override
        </button>
      </>
    );
  });

  render(
    <ScanItems {...props} />
  );
};

describe('ScanItems', () => {
  describe('Component', () => {
    const dispatchEvent = jest.fn();
    const querySelector = jest.fn(() => ({
      dispatchEvent,
    }));
    const dataWithoutItem = {
      item: {
        barcode: '',
      },
    };
    const dataWithItem = {
      item: {
        barcode: 'itemBarcode',
      },
    };
    const propsWithPatronBlock = {
      ...basicProps,
      patronBlocks: [
        {
          id: 'patronBlocksId',
        }
      ],
      patronBlockOverriddenInfo: {},
    };

    jest.spyOn(document, 'querySelector').mockImplementation(querySelector);

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should render "ItemForm"', () => {
      renderScanItems();

      const itemForm = screen.getByTestId(testIds.itemForm);

      expect(itemForm).toBeInTheDocument();
    });

    it('should render error if there is no item barcode', () => {
      renderScanItems(basicProps, dataWithoutItem, 'item.barcode');

      const itemForm = screen.getByTestId(testIds.itemForm);

      fireEvent.submit(itemForm);

      const errorMessage = screen.getByText(labelIds.missingDataError);

      expect(errorMessage).toBeVisible();
    });

    it('should render error if there is no patron', () => {
      const props = {
        ...basicProps,
        patron: null,
      };

      renderScanItems(props, dataWithItem, 'patron.identifier');

      const itemForm = screen.getByTestId(testIds.itemForm);

      fireEvent.submit(itemForm);

      const errorMessage = screen.getByText(labelIds.missingDataError);

      expect(errorMessage).toBeVisible();
    });

    it('should render error if there is patronBlocks', () => {
      renderScanItems(propsWithPatronBlock, dataWithItem, 'patron.blocked');

      const itemForm = screen.getByTestId(testIds.itemForm);

      fireEvent.submit(itemForm);

      const errorMessage = screen.getByText(labelIds.blockModal);

      expect(errorMessage).toBeVisible();
    });

    it('should not render errors after clicking on Clear Errors button', async () => {
      renderScanItems(basicProps, dataWithoutItem, 'item.barcode');

      const itemForm = screen.getByTestId(testIds.itemForm);
      const clearErrorsButton = screen.getByTestId(testIds.clearErrorsButton);

      fireEvent.submit(itemForm);
      fireEvent.click(clearErrorsButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(labelIds.missingDataError);

        expect(errorMessage).not.toBeInTheDocument();
      });
    });

    it('should trigger openBlockedModal', () => {
      renderScanItems(propsWithPatronBlock, dataWithItem, 'patron.blocked');

      const itemForm = screen.getByTestId(testIds.itemForm);

      fireEvent.submit(itemForm);

      expect(propsWithPatronBlock.openBlockedModal).toHaveBeenCalled();
    });

    it('should dispatch event', () => {
      const props = {
        ...basicProps,
        patron: null,
      };

      renderScanItems(props, dataWithItem, 'patron.identifier');

      const itemForm = screen.getByTestId(testIds.itemForm);

      fireEvent.submit(itemForm);

      expect(dispatchEvent).toHaveBeenCalled();
    });

    it('should render "ModalManager" after selecting an item', async () => {
      renderScanItems();

      const selectItemButton = screen.getByTestId(testIds.selectItemButton);

      fireEvent.click(selectItemButton);

      await waitFor(() => {
        const modalManager = screen.getByTestId(testIds.modalManager);

        expect(modalManager).toBeInTheDocument();
      });
    });

    it('should render "ModalManager" after clicking of Show notes button', async () => {
      renderScanItems();

      const showNotesButton = screen.getByTestId(testIds.showNotesButton);

      fireEvent.click(showNotesButton);

      await waitFor(() => {
        const modalManager = screen.getByTestId(testIds.modalManager);

        expect(modalManager).toBeInTheDocument();
      });
    });

    it('should replace loanId after clicking of Add patron info button', () => {
      renderScanItems();

      const addPatronInfoButton = screen.getByTestId(testIds.addPatronInfoButton);

      fireEvent.click(addPatronInfoButton);

      expect(basicProps.mutator.loanId.replace).toHaveBeenCalledWith(mockedLoan.id);
    });

    it('should send patron info after clicking of Add patron info button', () => {
      renderScanItems();

      const expectedArg = {
        action: `${action}Added`,
        actionComment,
      };
      const addPatronInfoButton = screen.getByTestId(testIds.addPatronInfoButton);

      fireEvent.click(addPatronInfoButton);

      expect(basicProps.mutator.addInfo.POST).toHaveBeenCalledWith(expectedArg);
    });

    describe('When "totalRecords" of items is less than "MAX_RECORDS_FOR_CHUNK"', () => {
      beforeEach(() => {
        basicProps.mutator.items.GET.mockResolvedValueOnce({
          totalRecords: 2,
          items: [
            {
              id: 1,
            },
            {
              id: 2,
            }
          ],
        });
      });

      it('should reset items', async () => {
        renderScanItems(basicProps, dataWithItem);

        const itemForm = screen.getByTestId(testIds.itemForm);

        fireEvent.submit(itemForm);

        await waitFor(() => {
          expect(basicProps.mutator.items.reset).toHaveBeenCalled();
        });
      });

      it('should retrieve items if "wildcardLookupEnabled" is false', async () => {
        const expectedArg = {
          params: {
            query: `barcode=="${dataWithItem.item.barcode}"`,
            limit: MAX_RECORDS_FOR_CHUNK,
          },
        };

        renderScanItems(basicProps, dataWithItem);

        const itemForm = screen.getByTestId(testIds.itemForm);

        fireEvent.submit(itemForm);

        await waitFor(() => {
          expect(basicProps.mutator.items.GET).toHaveBeenCalledWith(expectedArg);
        });
      });

      it('should retrieve items if "wildcardLookupEnabled" is true', async () => {
        const expectedArg = {
          params: {
            query: `barcode=="${dataWithItem.item.barcode}*"`,
            limit: MAX_RECORDS_FOR_CHUNK,
          },
        };
        const props = {
          ...basicProps,
          settings: {
            ...basicProps.settings,
            wildcardLookupEnabled: true,
          },
          patronBlocks: [
            {
              id: 'patronBlocksId',
            }
          ],
          patronBlockOverriddenInfo: {
            patronId: 'patronId',
          },
        };

        renderScanItems(props, dataWithItem);

        const itemForm = screen.getByTestId(testIds.itemForm);

        fireEvent.submit(itemForm);

        await waitFor(() => {
          expect(basicProps.mutator.items.GET).toHaveBeenCalledWith(expectedArg);
        });
      });

      it('should trigger "ItemForm" with empty "items" after clicking on Close select Modal button', async () => {
        renderScanItems(basicProps, dataWithItem);

        const itemForm = screen.getByTestId(testIds.itemForm);

        fireEvent.submit(itemForm);

        await waitFor(() => {
          const expectedProps = {
            items: null,
          };
          const closeSelectModalButton = screen.getByTestId(testIds.closeSelectModalButton);

          fireEvent.click(closeSelectModalButton);

          expect(ItemForm).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
        });
      });
    });

    describe('When "totalRecords" of items is more than "MAX_RECORDS_FOR_CHUNK"', () => {
      it('should get items twice', async () => {
        const totalRecords = MAX_RECORDS_FOR_CHUNK + 1;
        basicProps.mutator.items.GET
          .mockResolvedValueOnce({
            totalRecords,
            items: new Array(totalRecords).fill({}),
          })
          .mockResolvedValueOnce({
            items: [{}],
          });

        renderScanItems(basicProps, dataWithItem);

        const itemForm = screen.getByTestId(testIds.itemForm);

        fireEvent.submit(itemForm);

        await waitFor(() => {
          expect(basicProps.mutator.items.GET).toHaveBeenCalledTimes(2);
        });
      });
    });

    describe('When "totalRecords" of items is 0', () => {
      const loan = {
        item: {
          circulationNotes: [],
        },
      };

      beforeEach(() => {
        basicProps.mutator.items.GET.mockResolvedValueOnce({
          totalRecords: 0,
          items: [],
        });
        basicProps.mutator.checkout.POST.mockResolvedValueOnce(loan);
        jest.doMock('../sound/checkout_success.m4a', () => jest.fn(() => 'sound'));

        renderScanItems(basicProps, dataWithItem);
      });

      it('should replace scannedItems', async () => {
        const itemForm = screen.getByTestId(testIds.itemForm);

        fireEvent.submit(itemForm);

        await waitFor(() => {
          expect(basicProps.parentMutator.scannedItems.replace).toHaveBeenCalled();
        });
      });

      it('should reset automatedPatronBlocks', async () => {
        const itemForm = screen.getByTestId(testIds.itemForm);

        fireEvent.submit(itemForm);

        await waitFor(() => {
          expect(basicProps.parentMutator.automatedPatronBlocks.reset).toHaveBeenCalled();
        });
      });

      it('should get automatedPatronBlocks', async () => {
        const itemForm = screen.getByTestId(testIds.itemForm);

        fireEvent.submit(itemForm);

        await waitFor(() => {
          expect(basicProps.parentMutator.automatedPatronBlocks.GET).toHaveBeenCalled();
        });
      });

      it('should render "ReactAudioPlayer"', async () => {
        const itemForm = screen.getByTestId(testIds.itemForm);

        fireEvent.submit(itemForm);

        await waitFor(() => {
          const reactAudioPlayer = screen.getByTestId(testIds.audioPlayer);

          expect(reactAudioPlayer).toBeInTheDocument();
        });
      });

      it('should hide "ReactAudioPlayer"', async () => {
        const itemForm = screen.getByTestId(testIds.itemForm);

        fireEvent.submit(itemForm);

        await waitFor(() => {
          const reactAudioPlayer = screen.queryByTestId(testIds.audioPlayer);

          expect(reactAudioPlayer).toBeInTheDocument();
        });
      });
    });

    describe('When "totalRecords" of items is one', () => {
      const loan = {
        item: {
          circulationNotes: [],
        },
      };
      const itemTitle = 'itemTitle';
      const itemBarcode = 'itemBarcode';
      const props = {
        ...basicProps,
        patronBlockOverriddenInfo: {
          patronId: 'patronId',
        },
        proxy: {
          barcode: 'proxyBarcode',
        },
        patron: {
          barcode: 'patronBarcode',
        },
      };

      beforeEach(() => {
        props.mutator.items.GET.mockResolvedValueOnce({
          totalRecords: 1,
          items: [
            {
              id: 1,
              title: itemTitle,
              barcode: itemBarcode,
            }
          ],
        });
        props.mutator.checkout.POST.mockResolvedValueOnce(loan);
        jest.doMock('../sound/checkout_success.m4a', () => jest.fn(() => 'sound'));

        renderScanItems(props, dataWithItem);
      });

      it('should render item title', async () => {
        const itemForm = screen.getByTestId(testIds.itemForm);

        fireEvent.submit(itemForm);

        await waitFor(() => {
          const title = screen.getByText(itemTitle);

          expect(title).toBeVisible();
        });
      });

      it('should checkout item after clicking on confirmation button', async () => {
        const itemForm = screen.getByTestId(testIds.itemForm);

        fireEvent.submit(itemForm);

        await waitFor(() => {
          const doneButton = screen.getByTestId(testIds.doneButton);
          const expectedArg = {
            itemBarcode,
            userBarcode: props.patron.barcode,
            servicePointId: props.stripes.user.user.curServicePoint.id,
            proxyUserBarcode: props.proxy.barcode,
            overrideBlocks: {
              ...props.patronBlockOverriddenInfo,
            },
            loanDate: expect.any(String),
          };

          fireEvent.click(doneButton);

          expect(props.mutator.checkout.POST).toHaveBeenCalledWith(expectedArg);
        });
      });

      it('should clear item barcode field after clicking on cancel button', async () => {
        const itemForm = screen.getByTestId(testIds.itemForm);

        fireEvent.submit(itemForm);

        await waitFor(() => {
          const cancelButton = screen.getByTestId(testIds.cancelButton);

          fireEvent.click(cancelButton);

          expect(props.formRef.current.change).toHaveBeenCalled();
        });
      });
    });

    describe('Error handling', () => {
      const loan = {
        item: {
          circulationNotes: [],
        },
      };

      beforeEach(() => {
        const props = {
          ...basicProps,
          settings: {
            ...basicProps.settings,
            audioAlertsEnabled: false,
          },
        };

        props.mutator.items.GET.mockResolvedValueOnce({
          totalRecords: 0,
          items: [],
        });
        props.mutator.checkout.POST.mockResolvedValueOnce(loan);
        jest.doMock('../sound/checkout_success.m4a', () => jest.fn(() => 'sound'));

        renderScanItems(props, dataWithItem);
      });

      it('should handle error if response type is "application/json"', async () => {
        const itemForm = screen.getByTestId(testIds.itemForm);
        const response = {
          status: 500,
          headers: {
            get: () => 'application/json',
          },
          json: jest.fn().mockResolvedValueOnce({
            errors: ['error'],
          })
        };

        basicProps.parentMutator.automatedPatronBlocks.GET.mockImplementationOnce(() => {
          throw response;
        });
        fireEvent.submit(itemForm);

        await waitFor(() => {
          expect(response.json).toHaveBeenCalled();
        });
      });

      it('should handle error if response type is "text/html"', async () => {
        const itemForm = screen.getByTestId(testIds.itemForm);
        const response = {
          status: 500,
          headers: {
            get: () => 'text/html',
          },
          text: jest.fn().mockResolvedValueOnce('error')
        };

        basicProps.parentMutator.automatedPatronBlocks.GET.mockImplementationOnce(() => {
          throw response;
        });
        fireEvent.submit(itemForm);

        await waitFor(() => {
          expect(response.text).toHaveBeenCalled();
        });
      });
    });

    describe('Override handling', () => {
      const basicData = {
        barcode: 'barcode',
        comment: 'comment',
      };
      const loan = {
        item: {
          circulationNotes: [],
        },
      };

      beforeEach(() => {
        basicProps.mutator.checkout.POST.mockResolvedValueOnce(loan);
      });

      describe('When "dueDate" is presented', () => {
        const data = {
          ...basicData,
          dueDate: 'some date',
        };

        it('should checkout item with correct information', () => {
          renderScanItems(basicProps, {}, '', data);

          const expectedArg = {
            itemBarcode: basicData.barcode,
            servicePointId: basicProps.stripes.user.user.curServicePoint.id,
            overrideBlocks: {
              comment: basicData.comment,
              itemNotLoanableBlock: {
                dueDate: data.dueDate,
              },
            },
          };
          const overrideButton = screen.getByTestId(testIds.overrideButton);

          fireEvent.click(overrideButton);

          expect(basicProps.mutator.checkout.POST).toHaveBeenCalledWith(expectedArg);
        });
      });

      describe('When "dueDate" is not presented', () => {
        it('should checkout item with correct information', () => {
          renderScanItems(basicProps, {}, '', basicData);

          const expectedArg = {
            itemBarcode: basicData.barcode,
            servicePointId: basicProps.stripes.user.user.curServicePoint.id,
            overrideBlocks: {
              comment: basicData.comment,
              itemLimitBlock: {},
            },
          };
          const overrideButton = screen.getByTestId(testIds.overrideButton);

          fireEvent.click(overrideButton);

          expect(basicProps.mutator.checkout.POST).toHaveBeenCalledWith(expectedArg);
        });
      });

      describe('When "patronBlockOverriddenInfo" is not empty', () => {
        it('should checkout item with correct information', () => {
          const props = {
            ...basicProps,
            patronBlockOverriddenInfo: {
              patronId: 'patronId',
            },
          };
          const expectedArg = {
            itemBarcode: basicData.barcode,
            servicePointId: props.stripes.user.user.curServicePoint.id,
            overrideBlocks: {
              comment: basicData.comment,
              itemLimitBlock: {},
              patronBlock: {},
            },
          };

          renderScanItems(props, {}, '', basicData);

          const overrideButton = screen.getByTestId(testIds.overrideButton);

          fireEvent.click(overrideButton);

          expect(basicProps.mutator.checkout.POST).toHaveBeenCalledWith(expectedArg);
        });
      });
    });
  });

  describe('playSound', () => {
    const checkoutSoundMock = 'checkoutSoundMock';

    describe('When audioTheme is presented', () => {
      const checkoutStatus = 'success';
      const audioTheme = 'future';
      const onFinishedPlaying = jest.fn();

      it('should render "ReactAudioPlayer" if sound is found', () => {
        jest.doMock(`@folio/circulation/sound/${audioTheme}/checkout_${checkoutStatus}.m4a`, () => jest.fn(() => checkoutSoundMock));

        render(playSound(checkoutStatus, audioTheme, onFinishedPlaying));

        const reactAudioPlayer = screen.getByTestId(testIds.audioPlayer);

        expect(reactAudioPlayer).toBeInTheDocument();
      });

      it('should not render "ReactAudioPlayer" if error happens', () => {
        try {
          render(playSound(checkoutStatus, 'wrongAudioThemeName', onFinishedPlaying));
        } catch (e) {
          const reactAudioPlayer = screen.queryByTestId(testIds.audioPlayer);

          expect(reactAudioPlayer).not.toBeInTheDocument();
        }
      });
    });

    describe('When audioTheme is not presented', () => {
      const checkoutStatus = 'error';
      const audioTheme = '';
      const onFinishedPlaying = jest.fn();

      afterEach(() => {
        jest.resetAllMocks();
      });

      it('should render "ReactAudioPlayer" if sound is found', () => {
        jest.doMock(`../sound/checkout_${checkoutStatus}.m4a`, () => jest.fn(() => checkoutSoundMock));

        render(playSound(checkoutStatus, audioTheme, onFinishedPlaying));

        const reactAudioPlayer = screen.getByTestId(testIds.audioPlayer);

        expect(reactAudioPlayer).toBeInTheDocument();
      });

      it('should not render "ReactAudioPlayer" if sound is not found', () => {
        jest.doMock(`../sound/checkout_${checkoutStatus}.m4a`, () => undefined);

        render(playSound(checkoutStatus, audioTheme, onFinishedPlaying));

        const reactAudioPlayer = screen.queryByTestId(testIds.audioPlayer);

        expect(reactAudioPlayer).not.toBeInTheDocument();
      });
    });
  });
});
