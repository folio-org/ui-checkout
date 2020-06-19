import React from 'react';
import PropTypes from 'prop-types';
import createInactivityTimer from 'inactivity-timer';
import { FormattedMessage } from 'react-intl';

import {
  isEmpty,
  get,
  hasIn,
  concat,
} from 'lodash';

import {
  Icon,
  Pane,
  Paneset,
} from '@folio/stripes/components';

import SafeHTMLMessage from '@folio/react-intl-safe-html';

import moment from 'moment';
import PatronForm from './components/PatronForm';
import ViewPatron from './components/ViewPatron';
import ScanFooter from './components/ScanFooter';
import ScanItems from './ScanItems';
import PatronBlockModal from './components/PatronBlock/PatronBlockModal';
import NotificationModal from './components/NotificationModal';

import { patronIdentifierMap, errorTypes } from './constants';
import {
  getPatronIdentifiers,
  buildIdentifierQuery,
  buildRequestQuery,
  getCheckoutSettings,
} from './util';
import css from './CheckOut.css';

class CheckOut extends React.Component {
  static manifest = Object.freeze({
    selPatron: { initialValue: {} },
    query: { initialValue: {} },
    scannedItems: { initialValue: [] },
    checkoutSettings: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries?query=(module=CHECKOUT and configName=other_settings)',
    },
    patrons: {
      type: 'okapi',
      records: 'users',
      path: 'users',
      accumulate: 'true',
      fetch: false,
    },
    settings: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries?query=(module=USERS and configName=profile_pictures)',
    },
    loans: {
      type: 'okapi',
      path: 'circulation/loans',
      accumulate: 'true',
      fetch: false,
    },
    manualPatronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path: 'manualblocks?query=userId=%{activeRecord.patronId}',
      DELETE: {
        path: 'manualblocks/%{activeRecord.blockId}',
      },
    },
    automatedPatronBlocks: {
      type: 'okapi',
      records: 'automatedPatronBlocks',
      path: 'automated-patron-blocks/%{activeRecord.patronId}',
      params: { limit: '100' },
      permissionsRequired: 'automated-patron-blocks.collection.get',
    },
    patronGroups: {
      type: 'okapi',
      records: 'usergroups',
      path: 'groups',
    },
    requests: {
      type: 'okapi',
      records: 'requests',
      accumulate: 'true',
      path: 'circulation/requests',
      fetch: false,
    },
    proxy: {
      type: 'okapi',
      records: 'proxiesFor',
      path: 'proxiesfor',
      accumulate: 'true',
      fetch: false,
    },
    endSession: {
      type: 'okapi',
      path: 'circulation/end-patron-action-session',
      fetch: false,
    },
    activeRecord: {},
  });

  static propTypes = {
    stripes: PropTypes.object.isRequired,
    resources: PropTypes.shape({
      activeRecord: PropTypes.object,
      scannedItems: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
        }),
      ),
      patrons: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      settings: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      checkoutSettings: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      manualPatronBlocks: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      automatedPatronBlocks: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      requests: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      proxiesFor: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      selPatron: PropTypes.object,
    }),
    mutator: PropTypes.shape({
      patrons: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      selPatron: PropTypes.shape({
        replace: PropTypes.func,
      }),
      scannedItems: PropTypes.shape({
        replace: PropTypes.func,
      }),
      activeRecord: PropTypes.shape({
        update: PropTypes.func
      }),
      requests: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      loans: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      proxy: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      manualPatronBlocks: PropTypes.shape({
        DELETE: PropTypes.func,
      }),
      endSession: PropTypes.shape({
        POST: PropTypes.func,
      }),
    }),
    history: PropTypes.shape({
      push: PropTypes.func,
    }),
    location: PropTypes.shape({
      state: PropTypes.shape({
        patronBarcode: PropTypes.string.isRequired,
        itemBarcode: PropTypes.string.isRequired,
      })
    }),
  };

  constructor(props) {
    super(props);

    const {
      location,
      stripes,
    } = props;

    this.store = stripes.store;
    this.connectedScanItems = stripes.connect(ScanItems);

    this.onPatronLookup = this.onPatronLookup.bind(this);
    this.selectPatron = this.selectPatron.bind(this);
    this.clearResources = this.clearResources.bind(this);
    this.state = { loading: false, blocked: false };
    this.patronFormInputRef = React.createRef();
    this.patronFormRef = React.createRef();
    this.itemFormRef = React.createRef();
    this.timer = undefined;
    this.shouldSubmitAutomatically = hasIn(location, 'state.patronBarcode') && hasIn(location, 'state.itemBarcode');
    this.state = {
      submitting: false,
    };
  }

  componentDidMount() {
    if (!this.shouldSubmitAutomatically) {
      this.patronFormInputRef.current.focus();
    }
  }

  componentDidUpdate(prevProps) {
    const {
      mutator,
      resources,
    } = this.props;

    const {
      resources: prevResources,
    } = prevProps;

    const { submitting } = this.state;

    if (this.shouldSubmitAutomatically) {
      this.submitForm('patron-form');
    }

    const manualPatronBlocks = get(resources, ['manualPatronBlocks', 'records'], []);
    const automatedPatronBlocks = get(resources, ['automatedPatronBlocks', 'records'], []);
    const prevManualBlocks = get(prevResources, ['manualPatronBlocks', 'records'], []);
    const prevExpirated = prevManualBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrBefore(moment().format()) && p.expirationDate) || [];
    const expirated = manualPatronBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrBefore(moment().format()) && p.expirationDate) || [];

    if ((prevExpirated.length > 0 && expirated.length === 0) || !isEmpty(automatedPatronBlocks)) {
      if (submitting) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ submitting: false });
      }
    }

    if ((expirated.length > 0 && !submitting) && isEmpty(automatedPatronBlocks)) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ submitting: true });

      expirated.forEach(p => {
        mutator.activeRecord.update({ blockId: p.id });
        mutator.manualPatronBlocks.DELETE({ id: p.id });
      });
    }

    if (this.timer) {
      return;
    }

    const settings = resources.checkoutSettings;
    if (!settings || !settings.records || settings.records.length === 0) return;

    const parsed = getCheckoutSettings(settings.records);

    if (!parsed.checkoutTimeout) {
      this.timer = null; // so we don't keep trying
      return;
    }
    if (!resources.activeRecord.hasTimer && resources.activeRecord.patronId) {
      mutator.activeRecord.update({ hasTimer: true });
      this.timer = createInactivityTimer(`${parsed.checkoutTimeoutDuration}m`, () => {
        this.onSessionEnd();
      });
      ['keydown', 'mousedown'].forEach((event) => {
        document.addEventListener(event, () => {
          if (this.timer) {
            this.timer.signal();
          }
        });
      });
    }
  }

  submitForm = (domId) => {
    const submitEvent = new Event('submit', { cancelable: true });
    const form = document.querySelector(`#${domId}`);
    form.dispatchEvent(submitEvent);
  };

  async onSessionEnd() {
    const {
      resources: { activeRecord: { patronId } },
      mutator: {
        endSession: { POST: endSession },
        activeRecord: { update }
      },
    } = this.props;

    const { submitting: patronFormSubmitting = false } = this.patronFormRef.current.getState();

    this.clearResources();

    if (!this.shouldSubmitAutomatically) {
      this.itemFormRef.current.reset();
    }

    if (!patronFormSubmitting) {
      this.patronFormRef.current.reset();
    }

    const current = this.patronFormInputRef.current;
    // This is not defined when the timeout fires while another app is active: which is fine
    if (current) {
      setTimeout(() => current.focus());
    }

    if (patronId) {
      await endSession({ endSessions : [{ actionType: 'Check-out', patronId }] });
      update({ patronId: null, hasTimer: false });
      this.timer = null;
    }
  }

  getPatronIdentifiers() {
    const checkoutSettings = get(this.props.resources, ['checkoutSettings', 'records'], []);
    return getPatronIdentifiers(checkoutSettings);
  }

  clearResources() {
    const {
      scannedItems,
      patrons,
      selPatron,
    } = this.props.mutator;

    scannedItems.replace([]);
    patrons.reset();
    selPatron.replace({});
  }

  selectPatron(patron) {
    const { resources, mutator } = this.props;
    const patrons = get(resources, ['patrons', 'records'], []);
    this.props.mutator.selPatron.replace(patron);
    mutator.requests.reset();
    // only find requests if patron acts as self
    if (patrons[0].id === patron.id) {
      this.findRequests(patron);
    }
  }

  async onPatronLookup(data) {
    const {
      resources: { activeRecord },
      mutator,
    } = this.props;

    if (!isEmpty(activeRecord)) {
      this.onSessionEnd();
    }

    mutator.requests.reset();
    const { error, patron } = await this.findPatron(data);

    if (!patron) return error;

    const proxies = await this.findProxies(patron);
    // patron can act as a proxy
    // so wait with finding requests
    // until proxy is selected. Part of UICHKOUT-475
    if (proxies.length) return {};
    this.findRequests(patron);

    return {};
  }

  async findPatron(data) {
    const patron = data.patron;
    const error = { patron: {} };

    if (!patron) {
      error.patron.identifier = <FormattedMessage id="ui-checkout.missingDataError" />;
      return { error, patron: null };
    }

    this.clearResources();
    const idents = this.getPatronIdentifiers();
    const query = buildIdentifierQuery(patron, idents);
    this.setState({ loading: true });

    try {
      const patrons = await this.props.mutator.patrons.GET({ params: { query } });

      if (!patrons.length) {
        const identifier = (idents.length > 1) ? 'id' : patronIdentifierMap[idents[0]];

        error.patron.identifier = <FormattedMessage id="ui-checkout.userNotFoundError" values={{ identifier }} />;
        error.patron._error = errorTypes.SCAN_FAILED;

        return { error, patron: null };
      }

      const selManualPatronBlocks = get(this.props.resources, ['manualPatronBlocks', 'records'], []);
      const selAutomatedPatronBlocks = get(this.props.resources, ['automatedPatronBlocks', 'records'], []);
      let manualPatronBlocks = selManualPatronBlocks.filter(p => p.borrowing === true);
      manualPatronBlocks = manualPatronBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrAfter(moment().format()));
      const automatedPatronBlocks = selAutomatedPatronBlocks.filter(p => p.blockBorrowing === true);
      const selPatron = patrons[0];
      this.props.mutator.activeRecord.update({ patronId: get(selPatron, 'id') });
      const showBlockModal = (manualPatronBlocks.length > 0 && manualPatronBlocks[0].userId === selPatron.id)
        || !isEmpty(automatedPatronBlocks);

      if (showBlockModal) {
        this.openBlockedModal();
      }

      if (!showBlockModal && this.shouldSubmitAutomatically) {
        this.submitForm('item-form');
      }

      return { error, patron: selPatron };
    } finally {
      this.shouldSubmitAutomatically = false;
      this.setState({ loading: false });
    }
  }

  async findProxies(patron) {
    const { mutator } = this.props;
    const query = `query=(proxyUserId==${patron.id})`;
    mutator.proxy.reset();
    const proxies = await mutator.proxy.GET({ params: { query } });
    return proxies;
  }

  async findRequests(patron) {
    const {
      stripes,
      mutator,
    } = this.props;

    const servicePointId = get(stripes, ['user', 'user', 'curServicePoint', 'id'], '');
    const query = buildRequestQuery(patron.id, servicePointId);
    mutator.requests.reset();
    const requests = await mutator.requests.GET({ params: { query } });
    this.setState({ requestsCount: requests.length });
  }

  onCloseBlockedModal = () => {
    this.setState({
      blocked: false,
    });
  }

  openBlockedModal = () => {
    this.setState({
      blocked: true,
    });
  }

  onCloseAwaitingPickupModal = () => {
    this.setState({
      requestsCount: 0,
    });
  }

  onViewUserPath = (user) => {
    const groups = get(this.props.resources, ['patronGroups', 'records'], []);
    const patronGroup = (groups.find(g => g.id === user.patronGroup) || {}).group;
    const viewUserPath = `/users/view/${(user || {}).id}?filters=pg.${patronGroup}`;
    this.props.history.push(viewUserPath);
  }

  render() {
    const {
      resources,
      mutator,
      stripes,
      location,
    } = this.props;

    const patronInitialValue = this.shouldSubmitAutomatically ? { patron: { identifier: location.state.patronBarcode } } : {};
    const itemInitialValue = this.shouldSubmitAutomatically ? { item: { barcode: location.state.itemBarcode } } : {};
    const checkoutSettings = get(resources, ['checkoutSettings', 'records'], []);
    const patrons = get(resources, ['patrons', 'records'], []);
    const settings = get(resources, ['settings', 'records'], []);
    const selManualPatronBlocks = get(resources, ['manualPatronBlocks', 'records'], []);
    const selAutomatedPatronBlocks = get(resources, ['automatedPatronBlocks', 'records'], []);
    let manualPatronBlocks = selManualPatronBlocks.filter(p => p.borrowing === true) || [];
    manualPatronBlocks = manualPatronBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrAfter(moment().format()));
    const automatedPatronBlocks = selAutomatedPatronBlocks.filter(p => p.blockBorrowing === true) || [];
    const patronBlocks = concat(automatedPatronBlocks, manualPatronBlocks);
    const scannedTotal = get(resources, ['scannedItems', 'length'], []);
    const selPatron = resources.selPatron;
    const { loading, blocked, requestsCount } = this.state;
    let patron = patrons[0];
    let proxy = selPatron;

    if (!isEmpty(selPatron)) {
      patron = selPatron;
      proxy = patrons[0];
    }

    return (
      <div data-test-check-out-scan className={css.container}>
        <Paneset static>
          <Pane
            defaultWidth="35%"
            paneTitle={<FormattedMessage id="ui-checkout.scanPatronCard" />}
          >
            <PatronForm
              onSubmit={this.onPatronLookup}
              userIdentifiers={this.getPatronIdentifiers()}
              patron={selPatron}
              forwardedRef={this.patronFormInputRef}
              formRef={this.patronFormRef}
              initialValues={patronInitialValue}
              {...this.props}
            />
            {loading &&
              <Icon
                icon="spinner-ellipsis"
                width="10px"
              /> }
            {patrons.length > 0 &&
              <ViewPatron
                onSelectPatron={this.selectPatron}
                onClearPatron={this.clearResources}
                patron={patron}
                openBlockedModal={this.openBlockedModal}
                patronBlocks={patronBlocks}
                proxy={proxy}
                settings={settings}
                {...this.props}
              /> }
          </Pane>
          <Pane
            defaultWidth="65%"
            paneTitle={<FormattedMessage id="ui-checkout.scanItems" />}
          >
            <this.connectedScanItems
              {...this.props}
              parentMutator={mutator}
              parentResources={resources}
              stripes={stripes}
              patron={patron}
              openBlockedModal={this.openBlockedModal}
              patronBlocks={patronBlocks}
              proxy={proxy}
              settings={getCheckoutSettings(checkoutSettings)}
              onSessionEnd={() => this.onSessionEnd()}
              shouldSubmitAutomatically={this.shouldSubmitAutomatically}
              formRef={this.itemFormRef}
              initialValues={itemInitialValue}
            />
          </Pane>
        </Paneset>
        {patrons.length > 0 &&
          <ScanFooter
            buttonId="clickable-done-footer"
            total={scannedTotal}
            onSessionEnd={() => this.onSessionEnd()}
          /> }
        <PatronBlockModal
          open={blocked}
          onClose={this.onCloseBlockedModal}
          viewUserPath={() => { this.onViewUserPath(patron); }}
          patronBlocks={patronBlocks || []}
        />
        <NotificationModal
          id="awaiting-pickup-modal"
          open={!!requestsCount}
          onClose={this.onCloseAwaitingPickupModal}
          message={
            <SafeHTMLMessage
              id="ui-checkout.awaitingPickupMessage"
              values={{ count: requestsCount }}
            />
          }
          label={<FormattedMessage id="ui-checkout.awaitingPickupLabel" />}
        />
      </div>
    );
  }
}

export default CheckOut;
