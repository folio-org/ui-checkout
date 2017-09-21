import _ from 'lodash';
import React, { PropTypes } from 'react';
import fetch from 'isomorphic-fetch';
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
  static contextTypes = {
    stripes: PropTypes.object,
  };

  static propTypes = {
    stripes: PropTypes.object,
    resources: PropTypes.shape({
      scannedItems: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
        }),
      ),
      patrons: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
        }),
      ),
      proxy: PropTypes.object,
      userIdentifierPref: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      patrons: PropTypes.shape({
        replace: PropTypes.func,
      }),
      proxy: PropTypes.shape({
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
    patrons: { initialValue: [] },
    proxy: { initialValue: null },
    scannedItems: { initialValue: [] },
    userIdentifierPref: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries?query=(module=CHECKOUT and configName=pref_patron_identifier)',
    },
  });

  constructor(props, context) {
    super(props);
    this.okapiUrl = context.stripes.okapi.url;
    this.store = context.stripes.store;
    this.httpHeaders = Object.assign({}, {
      'X-Okapi-Tenant': context.stripes.okapi.tenant,
      'X-Okapi-Token': this.store.getState().okapi.token,
      'Content-Type': 'application/json',
    });

    this.connectedViewPatron = props.stripes.connect(ViewPatron);
    this.findPatron = this.findPatron.bind(this);
    this.checkout = this.checkout.bind(this);
    this.selectProxy = this.selectProxy.bind(this);
  }

  onClickDone() {
    this.clearResources();
    this.clearForm('itemForm');
    this.clearForm('patronForm');
  }

  clearResources() {
    this.props.mutator.scannedItems.replace([]);
    this.props.mutator.patrons.replace([]);
    this.props.mutator.proxy.replace({});
  }

  selectProxy(proxy) {
    this.props.mutator.proxy.replace(proxy);
  }

  findPatron(data) {
    const patron = data.patron;

    if (!patron) {
      throw new SubmissionError({ patron: { identifier: 'Please fill this out to continue' } });
    }

    const patronIdentifier = this.userIdentifierPref();
    this.clearResources();

    return fetch(`${this.okapiUrl}/users?query=(${patronIdentifier.queryKey}="${patron.identifier}")`, { headers: this.httpHeaders })
      .then((response) => {
        if (response.status >= 400) {
          throw new SubmissionError({ patron: { identifier: `Error ${response.status} retrieving patron by ${patronIdentifier.label}`, _error: 'Scan failed' } });
        } else {
          return response.json();
        }
      })
      .then((json) => {
        if (json.users.length === 0) {
          throw new SubmissionError({ patron: { identifier: `User with this ${patronIdentifier.label} does not exist`, _error: 'Scan failed' } });
        }
        return this.props.mutator.patrons.replace(json.users);
      });
  }

  // Return either the currently set user identifier preference or a default value
  // (see constants.js for values)
  userIdentifierPref() {
    const pref = (this.props.resources.userIdentifierPref || {}).records || [];

    return (pref.length > 0 && pref[0].value != null) ?
      _.find(patronIdentifierTypes, { key: pref[0].value }) :
      defaultPatronIdentifier;
  }

  checkout(data) {
    if (!data.item) {
      throw new SubmissionError({ item: { barcode: 'Please fill this out to continue' } });
    }

    if (this.props.resources.patrons.length === 0) {
      return this.dispatchError('patronForm', 'patron.identifier', { patron: { identifier: 'Please fill this out to continue' } });
    }

    const userId = this.props.resources.proxy.id || this.props.resources.patrons[0].id;
    return this.fetchItemByBarcode(data.item.barcode)
      .then(item => this.postLoan(userId, item.id))
      .then(() => this.clearField('itemForm', 'item.barcode'));
  }

  fetchItemByBarcode(barcode) {
    // fetch item by barcode to get item id
    return fetch(`${this.okapiUrl}/item-storage/items?query=(barcode="${barcode}")`, { headers: this.httpHeaders })
      .then((itemsResponse) => {
        if (itemsResponse.status >= 400) {
          throw new SubmissionError({ item: { barcode: `Error ${itemsResponse.status} retrieving item by barcode ${barcode}`, _error: 'Scan failed' } });
        } else {
          return itemsResponse.json();
        }
      })
      .then((itemsJson) => {
        if (itemsJson.items.length === 0) {
          throw new SubmissionError({ item: { barcode: 'Item with this barcode does not exist', _error: 'Scan failed' } });
        } else {
          const item = JSON.parse(JSON.stringify(itemsJson.items[0]));
          return item;
        }
      });
  }

  postLoan(userId, itemId) {
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
    return fetch(`${this.okapiUrl}/circulation/loans`, {
      method: 'POST',
      headers: this.httpHeaders,
      body: JSON.stringify(loan),
    }).then((response) => {
      if (response.status >= 400) {
        throw new SubmissionError({ item: { barcode: `Okapi Error ${response.status} storing loan ${itemId} for patron ${userId}`, _error: 'Scan failed' } });
      } else {
        return response.json();
      }
    }).then((loanresponse) => {
      const scannedItems = [loanresponse].concat(this.props.resources.scannedItems);
      return this.props.mutator.scannedItems.replace(scannedItems);
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
    const scannedItems = resources.scannedItems || [];
    const patrons = resources.patrons || [];
    const proxy = resources.proxy;

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
                onSelectProxy={this.selectProxy}
                patron={patrons[0]}
                proxy={proxy}
                {...this.props}
              />
            }
          </Pane>
          <Pane defaultWidth="50%" paneTitle="Scanned Items">
            <ItemForm onSubmit={this.checkout} patron={patrons[0]} />
            <ViewItem scannedItems={scannedItems} />
          </Pane>
        </Paneset>
        {scannedItems.length && patrons.length &&
          <Button id="clickable-done" buttonStyle="primary mega" onClick={() => this.onClickDone()}>Done</Button>
        }
      </div>
    );
  }
}

export default Scan;
