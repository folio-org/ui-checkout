import { isEmpty } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { SubmissionError, reset } from 'redux-form';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import Icon from '@folio/stripes-components/lib/Icon';

import PatronForm from './lib/PatronForm';
import ViewPatron from './lib/ViewPatron';
import ScanFooter from './lib/ScanFooter';
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
    }),
  };

  static contextTypes = {
    translate: PropTypes.func,
  };

  constructor(props, context) {
    super(props);

    this.context = context;
    this.store = props.stripes.store;
    this.connectedScanItems = props.stripes.connect(ScanItems);

    this.findPatron = this.findPatron.bind(this);
    this.selectPatron = this.selectPatron.bind(this);
    this.clearResources = this.clearResources.bind(this);
    this.state = { loading: false };
  }

  onSessionEnd() {
    this.clearResources();
    this.clearForm('itemForm');
    this.clearForm('patronForm');
  }

  getPatronIdentifiers() {
    const checkoutSettings = (this.props.resources.checkoutSettings || {}).records || [];
    return getPatronIdentifiers(checkoutSettings);
  }

  clearResources() {
    this.props.mutator.scannedItems.replace([]);
    this.props.mutator.patrons.reset();
    this.props.mutator.selPatron.replace({});
  }

  selectPatron(patron) {
    this.props.mutator.selPatron.replace(patron);
  }

  findPatron(data) {
    const patron = data.patron;

    if (!patron) {
      throw new SubmissionError({
        patron: {
          identifier: this.context.translate('missingDataError'),
        },
      });
    }

    this.clearResources();
    const idents = this.getPatronIdentifiers();
    const query = buildIdentifierQuery(patron, idents);
    this.setState({ loading: true });

    return this.props.mutator.patrons.GET({ params: { query } }).then((patrons) => {
      if (!patrons.length) {
        const identifier = (idents.length > 1) ? 'id' : patronIdentifierMap[idents[0]];
        throw new SubmissionError({
          patron: {
            identifier: this.context.translate('userNotFoundError', { identifier }),
            _error: errorTypes.SCAN_FAILED,
          },
        });
      }
      return patrons;
    }).finally(() => this.setState({ loading: false }));
  }

  clearForm(formName) {
    this.store.dispatch(reset(formName));
  }

  render() {
    const resources = this.props.resources;
    const checkoutSettings = getCheckoutSettings((resources.checkoutSettings || {}).records || []);
    const patrons = (resources.patrons || {}).records || [];
    const settings = (resources.settings || {}).records || [];
    const scannedItems = resources.scannedItems || [];
    const selPatron = resources.selPatron;
    const scannedTotal = scannedItems.length;

    const { translate } = this.context;

    if (!checkoutSettings) return <div />;

    let patron = patrons[0];
    let proxy = selPatron;

    if (!isEmpty(selPatron)) {
      patron = selPatron;
      proxy = patrons[0];
    }

    return (
      <div className={css.container}>
        <Paneset static>
          <Pane defaultWidth="35%" paneTitle={translate('scanPatronCard')}>
            <PatronForm
              onSubmit={this.findPatron}
              userIdentifiers={this.getPatronIdentifiers()}
              patron={selPatron}
              {...this.props}
            />
            {this.state.loading && <Icon icon="spinner-ellipsis" width="10px" />}
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
          <Pane defaultWidth="65%" paneTitle={translate('scanItems')}>
            <this.connectedScanItems
              {...this.props}
              parentMutator={this.props.mutator}
              parentResources={this.props.resources}
              stripes={this.props.stripes}
              patron={patron}
              proxy={proxy}
              settings={checkoutSettings}
              onSessionEnd={() => this.onSessionEnd()}
            />
          </Pane>
        </Paneset>
        {patrons.length > 0 &&
          <ScanFooter buttonId="clickable-done-footer" total={scannedTotal} onSessionEnd={() => this.onSessionEnd()} />}
      </div>
    );
  }
}

export default Scan;
