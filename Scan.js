import { isEmpty } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import dateFormat from 'dateformat';
import uuid from 'uuid';
import { SubmissionError, change, reset, stopSubmit, setSubmitFailed } from 'redux-form';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';

import PatronForm from './lib/PatronForm';
import ItemForm from './lib/ItemForm';
import ViewPatron from './lib/ViewPatron';
import ViewItem from './lib/ViewItem';
import ScanFooter from './lib/ScanFooter';

import { patronIdentifierMap } from './constants';
import { getPatronIdentifiers, buildIdentifierQuery } from './util';

class Scan extends React.Component {
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
      items: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      settings: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      proxiesFor: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      selPatron: PropTypes.object,
      userIdentifierPref: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      patrons: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      proxiesFor: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      items: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      loanPolicies: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      loans: PropTypes.shape({
        GET: PropTypes.func,
        POST: PropTypes.func,
      }),
      selPatron: PropTypes.shape({
        replace: PropTypes.func,
      }),
      scannedItems: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }),
  };

  static defaultProps = {
    resources: {},
    mutator: {},
  };

  static manifest = Object.freeze({
    selPatron: { initialValue: null },
    scannedItems: { initialValue: [] },
    userIdentifierPref: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries?query=(module=CHECKOUT and configName=pref_patron_identifier)',
    },
    proxiesFor: {
      type: 'okapi',
      records: 'proxiesFor',
      path: 'proxiesfor',
      accumulate: 'true',
      fetch: false,
    },
    patrons: {
      type: 'okapi',
      records: 'users',
      path: 'users',
      accumulate: 'true',
      fetch: false,
    },
    items: {
      type: 'okapi',
      records: 'items',
      path: 'inventory/items',
      accumulate: 'true',
      fetch: false,
    },
    loans: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans',
      accumulate: 'true',
      fetch: false,
    },
    loanPolicies: {
      type: 'okapi',
      records: 'loanPolicies',
      path: 'loan-policy-storage/loan-policies',
      accumulate: 'true',
      fetch: false,
    },
    settings: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries?query=(module=USERS and configName=profile_pictures)',
    },
  });

  constructor(props) {
    super(props);

    this.store = props.stripes.store;
    this.connectedViewPatron = props.stripes.connect(ViewPatron);
    this.findPatron = this.findPatron.bind(this);
    this.checkout = this.checkout.bind(this);
    this.selectPatron = this.selectPatron.bind(this);
    this.clearResources = this.clearResources.bind(this);
  }

  onClickDone() {
    this.clearResources();
    this.clearForm('itemForm');
    this.clearForm('patronForm');
  }

  getPatronIdentifiers() {
    const idents = (this.props.resources.userIdentifierPref || {}).records || [];
    return getPatronIdentifiers(idents);
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
      throw new SubmissionError({ patron: { identifier: 'Please fill this out to continue' } });
    }

    this.clearResources();
    const idents = this.getPatronIdentifiers();
    const query = buildIdentifierQuery(patron, idents);

    return this.props.mutator.patrons.GET({ params: { query } }).then((patrons) => {
      if (!patrons.length) {
        const identifier = (idents.length > 1) ? 'id' : patronIdentifierMap[idents[0]];
        throw new SubmissionError({ patron: { identifier: `User with this ${identifier} does not exist`, _error: 'Scan failed' } });
      }
      return patrons;
    }).then(patrons => this.fetchProxies(patrons[0]));
  }

  checkout(data) {
    if (!data.item) {
      throw new SubmissionError({ item: { barcode: 'Please fill this out to continue' } });
    }

    const patrons = (this.props.resources.patrons || {}).records || [];

    if (!patrons.length) {
      return this.dispatchError('patronForm', 'patron.identifier', { patron: { identifier: 'Please fill this out to continue' } });
    }

    const proxyUserId = patrons[0].id;
    const userId = this.props.resources.selPatron.id;

    return this.fetchItemByBarcode(data.item.barcode)
      .then(items => this.checkForLoan(items))
      .then(items => this.postLoan(userId, proxyUserId, items[0].id))
      .then(loan => this.fetchLoanPolicy(loan))
      .then(loan => this.addScannedItem(loan))
      .then(() => this.clearField('itemForm', 'item.barcode'));
  }

  addScannedItem(loan) {
    const scannedItems = [loan].concat(this.props.resources.scannedItems);
    return this.props.mutator.scannedItems.replace(scannedItems);
  }

  fetchLoanPolicy(loan) {
    const query = `(id=="${loan.loanPolicyId}")`;
    this.props.mutator.loanPolicies.reset();
    return this.props.mutator.loanPolicies.GET({ params: { query } }).then((policies) => {
      // eslint-disable-next-line no-param-reassign

      if (!policies.length) return loan;
      loan.loanPolicy = policies.find(p => p.id == loan.loanPolicyId);
      return loan;
    });
  }

  fetchItemByBarcode(barcode) {
    const query = `(barcode="${barcode}")`;
    this.props.mutator.items.reset();
    return this.props.mutator.items.GET({ params: { query } }).then((items) => {
      if (!items.length) {
        throw new SubmissionError({ item: { barcode: 'Item with this barcode does not exist', _error: 'Scan failed' } });
      }
      return items;
    });
  }

  fetchProxies(patron) {
    const query = `(proxyUserId="${patron.id}")`;
    this.props.mutator.proxiesFor.reset();
    return this.props.mutator.proxiesFor.GET({ params: { query } });
  }

  // Before trying to create a new loan, check to see if one exists for the
  // requested item. If so, this function will generate an error that results
  // in a validation error message appearing beneath the barcode input field.
  // If no loan is found, the items array is returned as a pass-through value.
  checkForLoan(items) {
    const itemId = items[0].id;
    const query = `(itemId="${itemId}" and status.name<>"Closed")`;

    return this.props.mutator.loans.GET({ params: { query } }).then((loans) => {
      if (loans.length) {
        throw new SubmissionError({ item: { barcode: 'Item is not available for checkout', _error: 'Item is checked out' } });
      }
      return items;
    });
  }

  postLoan(userId, proxyUserId, itemId) {
    const loanDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(loanDate.getDate() + 14);

    const loan = {
      id: uuid(),
      userId,
      itemId,
      loanDate: dateFormat(loanDate, "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      dueDate: dateFormat(dueDate, "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      action: 'checkedout',
      status: {
        name: 'Open',
      },
    };

    if (proxyUserId !== userId) {
      loan.proxyUserId = proxyUserId;
    }

    return this.props.mutator.loans.POST(loan);
  }

  clearField(formName, fieldName) {
    this.store.dispatch(change(formName, fieldName, ''));
  }

  dispatchError(formName, fieldName, errors) {
    this.store.dispatch(stopSubmit(formName, errors));
    this.store.dispatch(setSubmitFailed(formName, [fieldName]));
  }

  clearForm(formName) {
    this.store.dispatch(reset(formName));
  }

  render() {
    const resources = this.props.resources;
    const userIdentifierPref = (resources.userIdentifierPref || {}).records || [];
    const patrons = (resources.patrons || {}).records || [];
    const settings = (resources.settings || {}).records || [];
    const proxiesFor = resources.proxiesFor || {};

    const scannedItems = resources.scannedItems || [];
    const selPatron = resources.selPatron;
    const scannedTotal = scannedItems.length;

    if (!userIdentifierPref) return <div />;

    let patron = patrons[0];
    let proxy = selPatron;

    if (!isEmpty(selPatron)) {
      patron = selPatron;
      proxy = patrons[0];
    }

    const containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      width: '100%',
      position: 'absolute',
    };

    if (patrons.length && scannedTotal) {
      containerStyle.height = '98.6%';
    }

    return (
      <div style={containerStyle}>
        <Paneset static>
          <Pane defaultWidth="35%" paneTitle="Scan patron card">
            <PatronForm
              onSubmit={this.findPatron}
              userIdentifiers={this.getPatronIdentifiers()}
              patron={selPatron}
              {...this.props}
            />
            {patrons.length > 0 && proxiesFor.hasLoaded &&
              <this.connectedViewPatron
                onSelectPatron={this.selectPatron}
                onClearPatron={this.clearResources}
                patron={patron}
                proxiesFor={proxiesFor.records}
                proxy={proxy}
                settings={settings}
                {...this.props}
              />
            }
          </Pane>
          <Pane defaultWidth="65%" paneTitle="Scan items">
            <ItemForm onSubmit={this.checkout} patron={selPatron} total={scannedTotal} onSessionEnd={() => this.onClickDone()} />
            <ViewItem stripes={this.props.stripes} scannedItems={scannedItems} />
          </Pane>
        </Paneset>
        {patrons.length > 0 &&
          <ScanFooter buttonId="clickable-done-footer" total={scannedTotal} onSessionEnd={() => this.onClickDone()} />}
      </div>
    );
  }
}

export default Scan;
