import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import dateFormat from 'dateformat';
import uuid from 'uuid';
import { SubmissionError, change, reset, stopSubmit, setSubmitFailed } from 'redux-form';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import Button from '@folio/stripes-components/lib/Button';

import PatronForm from './lib/PatronForm';
import ItemForm from './lib/ItemForm';
import ViewPatron from './lib/ViewPatron';
import ViewItem from './lib/ViewItem';

import { patronIdentifierTypes, defaultPatronIdentifier } from './constants';

class Scan extends React.Component {
  static propTypes = {
    stripes: PropTypes.object,
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
      items: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      loans: PropTypes.shape({
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
      path: 'item-storage/items',
      accumulate: 'true',
      fetch: false,
    },
    loans: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans',
      fetch: false,
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

    const patronIdentifier = this.userIdentifierPref();
    const query = `(${patronIdentifier.queryKey}="${patron.identifier}")`;

    this.clearResources();

    return this.props.mutator.patrons.GET({ params: { query } }).then((patrons) => {
      if (!patrons.length) {
        throw new SubmissionError({ patron: { identifier: `User with this ${patronIdentifier.label} does not exist`, _error: 'Scan failed' } });
      }
    });
  }

  // Return either the currently set user identifier preference or a default value
  // (see constants.js for values)
  userIdentifierPref() {
    const pref = (this.props.resources.userIdentifierPref || {}).records || [];
    return (pref.length && pref[0].value) ?
      _.find(patronIdentifierTypes, { key: pref[0].value }) :
      defaultPatronIdentifier;
  }

  checkout(data) {
    if (!data.item) {
      throw new SubmissionError({ item: { barcode: 'Please fill this out to continue' } });
    }

    if (!this.props.resources.patrons.records.length) {
      return this.dispatchError('patronForm', 'patron.identifier', { patron: { identifier: 'Please fill this out to continue' } });
    }

    const proxyUserId = this.props.resources.patrons.records[0].id;
    const userId = this.props.resources.selPatron.id;

    return this.fetchItemByBarcode(data.item.barcode)
      .then(items => this.postLoan(userId, proxyUserId, items[0].id))
      .then(loan => this.addScannedItem(loan))
      .then(() => this.clearField('itemForm', 'item.barcode'));
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
    const scannedItems = resources.scannedItems || [];
    const selPatron = resources.selPatron;

    if (!userIdentifierPref) return <div />;

    const containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      width: '100%',
      position: 'absolute',
    };

    if (patrons.length && scannedItems.length) {
      containerStyle.height = '98.6%';
    }

    return (
      <div style={containerStyle}>
        <Paneset static>
          <Pane defaultWidth="50%" paneTitle="Patron">
            <PatronForm
              onSubmit={this.findPatron}
              userIdentifierPref={this.userIdentifierPref()}
              {...this.props}
            />
            {patrons.length > 0 &&
              <this.connectedViewPatron
                onSelectPatron={this.selectPatron}
                onClearPatron={this.clearResources}
                patron={patrons[0]}
                proxy={selPatron}
                {...this.props}
              />
            }
          </Pane>
          <Pane defaultWidth="50%" paneTitle="Scanned Items">
            <ItemForm onSubmit={this.checkout} patron={selPatron} />
            <ViewItem scannedItems={scannedItems} />
          </Pane>
        </Paneset>
        {scannedItems.length > 0 && patrons.length > 0 &&
          <Button id="clickable-done" buttonStyle="primary mega" onClick={() => this.onClickDone()}>Done</Button>
        }
      </div>
    );
  }
}

export default Scan;
