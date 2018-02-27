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
import { getPatronIdentifiers, buildIdentifierQuery, toParams } from './util';

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
      loanRules: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      fixedDueDateSchedules: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      settings: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      proxiesFor: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      sponsorOf: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      userIdentifierPref: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      selPatron: PropTypes.object,
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
      sponsorOf: PropTypes.shape({
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
      fixedDueDateSchedules: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      loanRules: PropTypes.shape({
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
    sponsorOf: {
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
    fixedDueDateSchedules: {
      type: 'okapi',
      records: 'fixedDueDateSchedules',
      path: 'fixed-due-date-schedule-storage/fixed-due-date-schedules',
      accumulate: 'true',
      fetch: false,
    },
    loanRules: {
      type: 'okapi',
      path: 'circulation/loan-rules/apply',
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
    }).then((patrons) => {
      this.fetchProxies(patrons[0]);
      this.fetchSponsors(patrons[0]);
    });
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
      .then(item => this.checkForLoan(item))
      .then(item => this.validateLoanPolicy(item))
      .then(item => this.postLoan(item, userId, proxyUserId))
      .then(loan => this.addScannedItem(loan))
      .then(() => this.clearField('itemForm', 'item.barcode'));
  }

  validateLoanPolicy(data) {
    return this.fetchLoanPolicyId(data)
      .then(item => this.fetchLoanPolicy(item))
      .then(item => this.fetchFixedDueDateSchedules(item))
      // TODO validate loan policy
      .then(item => item);
  }

  addScannedItem(loan) {
    const scannedItems = [loan].concat(this.props.resources.scannedItems);
    return this.props.mutator.scannedItems.replace(scannedItems);
  }

  fetchItemByBarcode(barcode) {
    const query = `(barcode="${barcode}")`;
    this.props.mutator.items.reset();
    return this.props.mutator.items.GET({ params: { query } }).then((items) => {
      if (!items.length) {
        throw new SubmissionError({ item: { barcode: 'Item with this barcode does not exist', _error: 'Scan failed' } });
      }
      return items[0];
    });
  }

  fetchProxies(patron) {
    const query = `(proxyUserId="${patron.id}")`;
    this.props.mutator.proxiesFor.reset();
    return this.props.mutator.proxiesFor.GET({ params: { query } });
  }

  fetchSponsors(patron) {
    const query = `(userId="${patron.id}")`;
    this.props.mutator.sponsorOf.reset();
    return this.props.mutator.sponsorOf.GET({ params: { query } });
  }

  // Before trying to create a new loan, check to see if one exists for the
  // requested item. If so, this function will generate an error that results
  // in a validation error message appearing beneath the barcode input field.
  // If no loan is found, the items array is returned as a pass-through value.
  checkForLoan(item) {
    const itemId = item.id;
    const query = `(itemId="${itemId}" and status.name<>"Closed")`;

    return this.props.mutator.loans.GET({ params: { query } }).then((loans) => {
      if (loans.length) {
        throw new SubmissionError({ item: { barcode: 'Item is not available for checkout', _error: 'Item is checked out' } });
      }
      return item;
    });
  }

  fetchLoanPolicyId(item) {
    const { materialType, permanentLoanType, permanentLocation } = item;
    const { selPatron } = this.props.resources;
    const params = toParams({
      shelving_location_id: permanentLocation.id,
      item_type_id: materialType.id,
      loan_type_id: permanentLoanType.id,
      patron_type_id: selPatron.patronGroup,
    });

    this.props.mutator.loanRules.reset();
    return this.props.mutator.loanRules.GET({ params }).then((rule) => {
      item.loanPolicyId = rule.loanPolicyId;
      return item;
    });
  }

  fetchLoanPolicy(item) {
    const query = `(id=="${item.loanPolicyId}")`;
    this.props.mutator.loanPolicies.reset();
    return this.props.mutator.loanPolicies.GET({ params: { query } }).then((policies) => {
      const loanPolicy = policies.find(p => p.id === item.loanPolicyId);
      item.loanPolicy = loanPolicy;
      return item;
    });
  }

  fetchFixedDueDateSchedules(item) {
    if (!item || !item.loanPolicy || !item.loanPolicy.loansPolicy.fixedDueDateSchedule) {
      return item;
    }

    const query = `(id=="${item.loanPolicy.loansPolicy.fixedDueDateSchedule}")`;
    this.props.mutator.fixedDueDateSchedules.reset();
    return this.props.mutator.fixedDueDateSchedules.GET({ params: { query } }).then((fixedDueDateSchedules) => {
      item.loanPolicy.fixedDueDateSchedule = fixedDueDateSchedules[0];
      return item;
    });
  }

  postLoan(item, userId, proxyUserId) {
    const loanDate = new Date();
    const dueDate = new Date();
    const itemId = item.id;
    dueDate.setDate(loanDate.getDate() + 14);

    const loanData = {
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
      loanData.proxyUserId = proxyUserId;
    }

    return this.props.mutator.loans.POST(loanData).then((loan) => {
      loan.loanPolicy = item.loanPolicy;
      return loan;
    });
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
    const sponsorOf = resources.sponsorOf || {};

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
            {patrons.length > 0 && proxiesFor.hasLoaded && sponsorOf.hasLoaded &&
              <this.connectedViewPatron
                onSelectPatron={this.selectPatron}
                onClearPatron={this.clearResources}
                patron={patron}
                proxiesFor={proxiesFor.records}
                sponsorOf={sponsorOf.records}
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
