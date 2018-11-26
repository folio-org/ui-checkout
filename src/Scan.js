import { isEmpty, get } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { SubmissionError, reset } from 'redux-form';
import createInactivityTimer from 'inactivity-timer';
import { Icon, Pane, Paneset } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';

import PatronForm from './components/PatronForm';
import ViewPatron from './components/ViewPatron';
import ScanFooter from './components/ScanFooter';
import ScanItems from './ScanItems';
import { patronIdentifierMap, errorTypes } from './constants';
import { getPatronIdentifiers, buildIdentifierQuery, getCheckoutSettings } from './util';
import css from './Scan.css';

class Scan extends React.Component {
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
      loans: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
    }),
  };

  constructor(props) {
    super(props);
    this.store = props.stripes.store;
    this.connectedScanItems = props.stripes.connect(ScanItems);

    this.findPatron = this.findPatron.bind(this);
    this.selectPatron = this.selectPatron.bind(this);
    this.clearResources = this.clearResources.bind(this);
    this.state = { loading: false };
    this.patronFormRef = React.createRef();
    this.timer = undefined;
  }

  componentDidUpdate() {
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
      const patronFormInst = current.getRenderedComponent();
      setTimeout(() => patronFormInst.focusInput());
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
    this.props.mutator.selPatron.replace(patron);
  }

  findPatron = async (data) => {
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

      return patrons;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  clearForm(formName) {
    this.store.dispatch(reset(formName));
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
    const scannedTotal = get(resources, ['scannedItems', 'length'], []);
    const selPatron = resources.selPatron;
    const { loading } = this.state;
    let patron = patrons[0];
    let proxy = selPatron;

    if (!isEmpty(selPatron)) {
      patron = selPatron;
      proxy = patrons[0];
    }

    return (
      <div className={css.container}>
        <Paneset static>
          <Pane
            defaultWidth="35%"
            paneTitle={<FormattedMessage id="ui-checkout.scanPatronCard" />}
          >
            <PatronForm
              onSubmit={this.findPatron}
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
      </div>
    );
  }
}

export default Scan;
