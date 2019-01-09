import { isEmpty, get } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { SubmissionError, reset } from 'redux-form';
import createInactivityTimer from 'inactivity-timer';
import { Icon, Pane, Paneset } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
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
  getCheckoutSettings,
  getRequestQuery,
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
    patronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path: 'manualblocks?query=userId=%{activeRecord.patronId}',
      DELETE: {
        path: 'manualblocks/%{activeRecord.blockId}',
      },
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
    activeRecord: {},
  });

  static propTypes = {
    stripes: PropTypes.object.isRequired,
    resources: PropTypes.shape({
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
      patronBlocks: PropTypes.shape({
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
    }),
  };

  constructor(props) {
    super(props);
    this.store = props.stripes.store;
    this.connectedScanItems = props.stripes.connect(ScanItems);

    this.onPatronLookup = this.onPatronLookup.bind(this);
    this.selectPatron = this.selectPatron.bind(this);
    this.clearResources = this.clearResources.bind(this);
    this.state = { loading: false, blocked: false };
    this.patronFormRef = React.createRef();
    this.timer = undefined;
    this.state = { submitting: false };
  }

  componentDidUpdate(prevProps) {
    const patronBlocks = get(this.props.resources, ['patronBlocks', 'records'], []);
    const prevBlocks = get(prevProps.resources, ['patronBlocks', 'records'], []);
    const { submitting } = this.state;
    const prevExpirated = prevBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrBefore(moment().format()) && p.expirationDate) || [];
    const expirated = patronBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrBefore(moment().format()) && p.expirationDate) || [];

    if (prevExpirated.length > 0 && expirated.length === 0) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ submitting: false });
    }

    if (expirated.length > 0 && !submitting) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ submitting: true });
      expirated.forEach(p => {
        this.props.mutator.activeRecord.update({ blockId: p.id });
        this.props.mutator.patronBlocks.DELETE({ id: p.id });
      });
    }

    if (this.timer !== undefined) return;

    const settings = this.props.resources.checkoutSettings;
    if (!settings || !settings.records || settings.records.length === 0) return;

    const parsed = getCheckoutSettings(settings.records);

    if (!parsed.checkoutTimeout) {
      this.timer = null; // so we don't keep trying
      return;
    }

    this.timer = createInactivityTimer(`${parsed.checkoutTimeoutDuration}m`, () => {
      this.onSessionEnd();
    });
    ['keydown', 'mousedown'].forEach((event) => {
      document.addEventListener(event, () => this.timer.signal());
    });
  }

  onSessionEnd() {
    this.clearResources();
    this.clearForm('itemForm');
    this.clearForm('patronForm');
    const current = this.patronFormRef.current;
    // This is not defined when the timeout fires while another app is active: which is fine
    if (current) {
      setTimeout(() => current.focus());
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
    const { mutator } = this.props;
    mutator.requests.reset();
    const patron = await this.findPatron(data);
    if (!patron) return;
    const proxies = await this.findProxies(patron);
    // patron can act as a proxy
    // so wait with finding requests
    // until proxy is selected. Part of UICHKOUT-475
    if (proxies.length) return;
    this.findRequests(patron);
  }

  async findPatron(data) {
    const patron = data.patron;

    if (!patron) {
      throw new SubmissionError({
        patron: {
          identifier: <FormattedMessage id="ui-checkout.missingDataError" />,
        },
      });
    }

    this.clearResources();
    const idents = this.getPatronIdentifiers();
    const query = buildIdentifierQuery(patron, idents);
    this.setState({ loading: true });

    try {
      const patrons = await this.props.mutator.patrons.GET({ params: { query } });

      if (!patrons.length) {
        const identifier = (idents.length > 1) ? 'id' : patronIdentifierMap[idents[0]];

        throw new SubmissionError({
          patron: {
            identifier: <FormattedMessage id="ui-checkout.userNotFoundError" values={{ identifier }} />,
            _error: errorTypes.SCAN_FAILED,
          },
        });
      }

      const selPatronBlocks = get(this.props.resources, ['patronBlocks', 'records'], []);
      const patronBlocks = selPatronBlocks.filter(p => p.borrowing === true);
      const selPatron = patrons[0];
      this.props.mutator.activeRecord.update({ patronId: get(selPatron, 'id') });
      if (patronBlocks.length > 0 && patronBlocks[0].userId === selPatron.id) {
        this.openBlockedModal();
      }
      return selPatron;
    } finally {
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
    const { stripes, mutator } = this.props;
    const servicePointId = get(stripes, ['user', 'user', 'curServicePoint', 'id'], '');
    const query = getRequestQuery(patron.id, servicePointId);
    mutator.requests.reset();
    const requests = await mutator.requests.GET({ params: { query } });
    this.setState({ requestsCount: requests.length });
  }

  clearForm(formName) {
    this.store.dispatch(reset(formName));
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
    } = this.props;

    const checkoutSettings = get(resources, ['checkoutSettings', 'records'], []);
    const patrons = get(resources, ['patrons', 'records'], []);
    const settings = get(resources, ['settings', 'records'], []);
    const selPatronBlocks = get(resources, ['patronBlocks', 'records'], []);
    const patronBlocks = selPatronBlocks.filter(p => p.borrowing === true) || [];
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
              forwardedRef={this.patronFormRef}
              {...this.props}
            />
            {loading &&
              <Icon
                icon="spinner-ellipsis"
                width="10px"
              />
            }
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
              />
            }
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
            />
          </Pane>
        </Paneset>
        {patrons.length > 0 &&
          <ScanFooter
            buttonId="clickable-done-footer"
            total={scannedTotal}
            onSessionEnd={() => this.onSessionEnd()}
          />
        }
        <PatronBlockModal
          open={blocked}
          onClose={this.onCloseBlockedModal}
          viewUserPath={() => { this.onViewUserPath(patron); }}
          patronBlocks={patronBlocks[0] || {}}
        />
        <NotificationModal
          id="awaiting-pickup-modal"
          open={!!requestsCount}
          onClose={this.onCloseAwaitingPickupModal}
          message={
            <SafeHTMLMessage
              id="ui-checkout.awaitingPickupMessage"
              values={{ count: requestsCount }}
            />}
          label={
            <FormattedMessage
              id="ui-checkout.awaitingPickupLabel"
            />}
        />
      </div>
    );
  }
}

export default CheckOut;
