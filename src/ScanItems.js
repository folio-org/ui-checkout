import React from 'react';
import PropTypes from 'prop-types';
import ReactAudioPlayer from 'react-audio-player';
import { FormattedMessage } from 'react-intl';
import {
  get,
  isEmpty,
} from 'lodash';

import {
  Icon,
  dayjs,
} from '@folio/stripes/components';
import { escapeCqlValue } from '@folio/stripes/util';

import ItemForm from './components/ItemForm';
import ViewItem from './components/ViewItem';
import ModalManager from './ModalManager';
import { PAGE_AMOUNT } from './constants';

export function playSound(checkoutStatus, audioTheme, onFinishedPlaying) {
  const soundName = (checkoutStatus === 'success') ? 'success' : 'error';

  let checkoutSound;
  // We load the sounds from the already-built bundle using `require`,
  // which is synchronous. It may be possible that this causes a
  // delay, though if so I have not seen it. If we become aware of a
  // delay in future, we could switch to using asynchronous `import`.

  if (audioTheme) {
    try {
      // Note that this require explicitly depends on @folio/circulation
      // -- the sounds belong there so that they can be used by both
      // checkout and checkin, the two modules whose settings it
      // handles. If in the future a different circulation-settings
      // module is used, this will need re-thinking.
      //
      // eslint-disable-next-line global-require, import/no-dynamic-require
      checkoutSound = require(`@folio/circulation/sound/${audioTheme}/checkout_${soundName}.m4a`);
    } catch (e) {
      // module @folio/circulation not found
    }
  } else {
    // Fall back to old hardwired sound, before themes were introduced
    // eslint-disable-next-line global-require, import/no-dynamic-require
    checkoutSound = require(`../sound/checkout_${soundName}.m4a`);
  }

  if (!checkoutSound) {
    return null;
  }

  return (
    <ReactAudioPlayer
      src={checkoutSound}
      autoPlay
      onEnded={onFinishedPlaying}
    />
  );
}

class ScanItems extends React.Component {
  static manifest = Object.freeze({
    checkout: {
      type: 'okapi',
      path: 'circulation/check-out-by-barcode',
      fetch: false,
      throwErrors: false,
    },
    checkoutBFF: {
      type: 'okapi',
      path: 'circulation-bff/loans/check-out-by-barcode',
      fetch: false,
      throwErrors: false,
    },
    items: {
      type: 'okapi',
      path: 'inventory/items',
      accumulate: 'true',
      fetch: false,
      abortOnUnmount: true,
    },
    loanId: {},
    addInfo: {
      type: 'okapi',
      path: 'circulation/loans/%{loanId}/add-info',
      fetch: false,
    },
  });

  static propTypes = {
    stripes: PropTypes.shape({
      config: PropTypes.shape({
        enableEcsRequests: PropTypes.bool,
      }),
    }).isRequired,
    shouldSubmitAutomatically: PropTypes.bool.isRequired,
    resources: PropTypes.shape({
      items: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      loanPolicies: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      checkout: PropTypes.shape({
        POST: PropTypes.func,
      }),
      checkoutBFF: PropTypes.shape({
        POST: PropTypes.func,
      }),
      items: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      loanId: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }).isRequired,
      addInfo: PropTypes.shape({
        POST: PropTypes.func,
      }).isRequired,
    }),
    parentResources: PropTypes.shape({
      scannedItems: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
        }),
      ),
    }),
    parentMutator: PropTypes.shape({
      scannedItems: PropTypes.shape({
        replace: PropTypes.func,
      }),
      automatedPatronBlocks: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }).isRequired,
    }),
    patron: PropTypes.shape({
      id: PropTypes.string,
      barcode: PropTypes.string,
    }),
    proxy: PropTypes.shape({
      id: PropTypes.string,
      barcode: PropTypes.string,
    }),
    onSessionEnd: PropTypes.func.isRequired,
    settings: PropTypes.shape({
      wildcardLookupEnabled: PropTypes.bool,
      audioAlertsEnabled: PropTypes.bool,
      audioTheme: PropTypes.string,
    }),
    openBlockedModal: PropTypes.func,
    patronBlocks: PropTypes.arrayOf(PropTypes.object),
    formRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({
        current: PropTypes.instanceOf(Element),
      })
    ]).isRequired,
    initialValues: PropTypes.object,
    patronBlockOverriddenInfo: PropTypes.object.isRequired,
  };

  static defaultProps = {
    settings: {},
    initialValues: {},
  };

  constructor(props) {
    super(props);
    this.store = props.stripes.store;
    this.state = {
      loading: false,
      checkoutStatus: null,
      items: null,
      item: null,
      errors: [],
      itemLimitOverridden: false,
      overriddenItemsList: [],
      totalRecords: 0,
      offset: 0,
      selectedBarcode: null,
    };
  }

  fetchItems = async (barcode, offset = 0) => {
    const {
      mutator,
      settings: {
        wildcardLookupEnabled,
      },
    } = this.props;
    const { selectedBarcode } = this.state;
    const asterisk = wildcardLookupEnabled ? '*' : '';
    const itemBarcode = barcode || selectedBarcode;
    const bcode = `"${escapeCqlValue(itemBarcode)}${asterisk}"`;
    const query = `barcode==${bcode}`;
    this.setState({
      item: null,
    });

    mutator.items.reset();

    const {
      items,
      totalRecords,
    } = await mutator.items.GET({
      params: {
        limit: PAGE_AMOUNT,
        query,
        offset,
      },
    });
    const itemsList = isEmpty(items) || items.length <= 1 ? null : items;

    this.setState({
      selectedBarcode: itemBarcode,
      items: itemsList,
      totalRecords,
      offset,
    });

    return items;
  }

  // https://github.com/final-form/react-final-form/blob/master/docs/faq.md#how-can-i-trigger-a-submit-from-outside-my-form
  triggerPatronFormSubmit = () => {
    const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
    const form = document.querySelector('#patron-form');
    form.dispatchEvent(submitEvent);
  };

  validate(barcode) {
    const {
      patron,
      patronBlocks,
      openBlockedModal,
      patronBlockOverriddenInfo,
    } = this.props;

    const errors = [];

    if (!barcode) {
      errors.push({
        item: {
          barcode: <FormattedMessage id="ui-checkout.missingDataError" />,
        },
      });
    }

    if (!patron) {
      this.triggerPatronFormSubmit();
      errors.push({
        patron: {
          identifier: <FormattedMessage id="ui-checkout.missingDataError" />,
        },
      });
    }

    if (patronBlocks.length > 0 && isEmpty(patronBlockOverriddenInfo)) {
      openBlockedModal();
      errors.push({
        patron: {
          blocked: <FormattedMessage id="ui-checkout.blockModal" />,
        },
      });
    }

    return errors;
  }

  tryCheckout = async (data) => {
    const {
      openBlockedModal,
      patronBlockOverriddenInfo,
      patronBlocks,
    } = this.props;

    const barcode = get(data, 'item.barcode');
    const errors = this.validate(barcode);

    if (!isEmpty(errors)) {
      this.setState({ errors });
      return;
    }

    const shouldShowBlockedModal = !isEmpty(patronBlocks) && isEmpty(patronBlockOverriddenInfo);

    if (shouldShowBlockedModal) {
      openBlockedModal();
      return;
    }

    const checkoutItems = await this.fetchItems(barcode);
    const checkoutItem = checkoutItems[0];

    if (checkoutItems.length > 1) {
      this.setState({ items: checkoutItems });
    } else if (isEmpty(checkoutItems)) {
      this.checkout(barcode);
    } else {
      this.setState({ item: checkoutItem });
    }
  }

  // Called from ViewItem when the 'show checkout notes' item
  // menu option is clicked. This is distinct from whether notes
  // should be shown as part of the checkout workflow (which is
  // determined in ModalManager.)
  showCheckoutNotes = (loan) => {
    const { item } = loan;
    this.setState({
      checkoutNotesMode: true,
      item,
    });
  }

  successfulCheckout = () => {
    this.setState({ checkoutStatus: 'success', item: null });
  };

  getRequestData(barcode) {
    const { stripes, patron, proxy } = this.props;
    const servicePointId = get(stripes, 'user.user.curServicePoint.id', '');
    const data = {
      itemBarcode: barcode,
      userBarcode: patron.barcode,
      servicePointId,
    };

    // only include the proxy barcode if it differs from the patron barcode
    if (proxy?.barcode && proxy.barcode !== patron.barcode) {
      data.proxyUserBarcode = proxy.barcode;
    }
    return data;
  }

  getCheckoutMutator = () => {
    const {
      stripes,
      mutator: {
        checkout,
        checkoutBFF,
      },
    } = this.props;
    const isEnabledEcsRequests = stripes?.config?.enableEcsRequests;

    return isEnabledEcsRequests ? checkoutBFF : checkout;
  }

  checkout = (barcode) => {
    const {
      patronBlockOverriddenInfo,
    } = this.props;
    const checkoutData = {
      ...this.getRequestData(barcode),
      loanDate: dayjs().utc().toISOString(),
    };
    const checkoutMutator = this.getCheckoutMutator();

    if (!isEmpty(patronBlockOverriddenInfo)) {
      checkoutData.overrideBlocks = { ...patronBlockOverriddenInfo };
    }

    return this.performAction(checkoutMutator, checkoutData);
  }

  override = (data) => {
    const {
      patronBlockOverriddenInfo,
    } = this.props;
    const {
      barcode,
      comment,
      dueDate,
    } = data;
    const overrideData = { ...this.getRequestData(barcode) };
    const checkoutMutator = this.getCheckoutMutator();

    if (!dueDate) {
      overrideData.overrideBlocks = {
        itemLimitBlock: {},
        comment,
      };
      this.setState(prevState => ({
        itemLimitOverridden: true,
        overriddenItemsList: [
          ...prevState.overriddenItemsList,
          barcode,
        ],
      }));
    } else {
      overrideData.overrideBlocks = {
        itemNotLoanableBlock: { dueDate },
        comment,
      };
    }

    if (!isEmpty(patronBlockOverriddenInfo)) {
      overrideData.overrideBlocks.patronBlock = {};
    }

    return this.performAction(checkoutMutator, overrideData);
  }

  updateAutomatedPatronBlocks = () => {
    const { parentMutator } = this.props;

    parentMutator.automatedPatronBlocks.reset();

    return parentMutator.automatedPatronBlocks.GET();
  }

  performAction(action, data) {
    this.setState({ loading: true, errors: [] });
    return action.POST(data)
      .then(this.addScannedItem)
      .then(this.successfulCheckout)
      .then(this.updateAutomatedPatronBlocks)
      .catch(this.catchErrors)
      .finally(() => this.setState({ loading: false }));
  }

  catchErrors = (resp) => {
    this.setState({ checkoutStatus: 'error' });
    const contentType = resp.headers.get('Content-Type');
    if (contentType && contentType.startsWith('application/json')) {
      return resp.json().then(this.handleErrors);
    } else {
      return resp.text().then(alert); // eslint-disable-line no-alert
    }
  }

  handleErrors = ({ errors }) => {
    // TODO make error message internationalized
    // (https://github.com/folio-org/ui-checkout/pull/408#pullrequestreview-317759489)

    this.setState({ errors });
  }

  addPatronOrStaffInfo = (loan, action, actionComment) => {
    const { mutator } = this.props;

    mutator.loanId.replace(loan.id);
    return mutator.addInfo.POST({ action: `${action}Added`, actionComment });
  };

  addScannedItem = (loan) => {
    const {
      parentResources,
      parentMutator,
    } = this.props;

    const { item } = this.state;
    loan.item.circulationNotes = (item || {}).circulationNotes || [];
    const scannedItems = [loan].concat(parentResources.scannedItems);

    return parentMutator.scannedItems.replace(scannedItems);
  };

  clearField(fieldName) {
    this.props.formRef.current.change(fieldName, '');
  }

  onFinishedPlaying = () => {
    this.setState({ checkoutStatus: null });
  }

  onClearCheckoutErrors = () => {
    this.setState({ errors: [] });
  }

  onItemSelection = (_, item) => {
    this.setState({
      items: null,
      item,
    });
  };

  onCloseSelectItemModal = () => {
    this.setState({ items: null });
  };

  onCancel = () => {
    // if checkoutNotesMode == true, then this is a post-checkout,
    // user-triggered review of the notes modal. We shouldn't try
    // to clear the form or deal with errors in this case -- only
    // when the mode is false, meaning that notes were shown as
    // part of the item checkout workflow.
    if (!this.state.checkoutNotesMode) {
      this.clearField('item.barcode');
    }
    this.setState({ checkoutNotesMode: false });
  }

  onDone = async () => {
    const barcode = get(this.state, 'item.barcode', '');
    this.checkout(barcode);
  }

  render() {
    const {
      parentResources,
      onSessionEnd,
      patron,
      settings: {
        audioAlertsEnabled,
        audioTheme,
      },
      shouldSubmitAutomatically,
      formRef,
      initialValues,
      patronBlockOverriddenInfo,
    } = this.props;
    const {
      checkoutStatus,
      loading,
      item,
      items,
      errors,
      checkoutNotesMode,
      itemLimitOverridden,
      overriddenItemsList,
      totalRecords,
      selectedBarcode,
      offset,
    } = this.state;

    const overriddenItemLimitData = {
      itemLimitOverridden,
      overriddenItemsList,
    };
    const scannedItems = parentResources.scannedItems || [];
    const scannedTotal = scannedItems.length;

    return (
      <div data-test-scan-items>
        { /* manages pre checkout modals */}
        {item &&
          <ModalManager
            checkedoutItem={item}
            checkoutNotesMode={checkoutNotesMode}
            onDone={this.onDone}
            onCancel={this.onCancel}
          />}
        <ItemForm
          formRef={formRef}
          onSubmit={this.tryCheckout}
          onOverride={this.override}
          patron={patron}
          total={scannedTotal}
          onSessionEnd={onSessionEnd}
          item={item}
          items={items}
          pagingOffset={offset}
          totalRecords={totalRecords}
          barcode={selectedBarcode}
          onNeedMoreData={this.fetchItems}
          shouldSubmitAutomatically={shouldSubmitAutomatically}
          checkoutError={errors}
          onClearCheckoutErrors={this.onClearCheckoutErrors}
          initialValues={initialValues}
          patronBlockOverriddenInfo={patronBlockOverriddenInfo}
          onItemSelection={this.onItemSelection}
          onCloseSelectItemModal={this.onCloseSelectItemModal}
        />
        {loading &&
          <Icon
            icon="spinner-ellipsis"
            width="10px"
          />}
        <ViewItem
          scannedItems={scannedItems}
          loading={loading}
          showCheckoutNotes={this.showCheckoutNotes}
          overriddenItemLimitData={overriddenItemLimitData}
          addPatronOrStaffInfo={this.addPatronOrStaffInfo}
          {...this.props}
        />
        {audioAlertsEnabled && checkoutStatus && playSound(checkoutStatus, audioTheme, this.onFinishedPlaying)}
      </div>
    );
  }
}

export default ScanItems;
