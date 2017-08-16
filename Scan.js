import _ from 'lodash';
import React, { PropTypes } from 'react';
import fetch from 'isomorphic-fetch';
import dateFormat from 'dateformat';
import uuid from 'uuid';
import { SubmissionError, change } from 'redux-form';

import CheckOut from './CheckOut';
import { patronIdentifierTypes, defaultPatronIdentifier } from './constants';

class Scan extends React.Component {
  static contextTypes = {
    stripes: PropTypes.object,
  }

  static propTypes = {
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
      userIdentifierPref: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      mode: PropTypes.shape({
        replace: PropTypes.func,
      }),
      patrons: PropTypes.shape({
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
    scannedItems: { initialValue: [] },
    userIdentifierPref: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries?query=(module=SCAN and configName=pref_patron_identifier)',
    },
  });

  constructor(props, context) {
    super(props);
    this.okapiUrl = context.stripes.okapi.url;
    this.httpHeaders = Object.assign({}, {
      'X-Okapi-Tenant': context.stripes.okapi.tenant,
      'X-Okapi-Token': context.stripes.store.getState().okapi.token,
      'Content-Type': 'application/json',
    });

    this.onSubmitInCheckOutForm = this.onSubmitInCheckOutForm.bind(this);
    this.onClickDone = this.onClickDone.bind(this);
  }

  onClickDone() {
    this.props.mutator.scannedItems.replace([]);
    this.props.mutator.patrons.replace([]);
  }

  onSubmitInCheckOutForm(data) {
    if (data.SubmitMeta.button === 'find_patron') {
      return this.findPatron(data.patron);
    } else if (data.SubmitMeta.button === 'add_item') {
      return this.checkout(data);
    }

    throw new SubmissionError({ item: { barcode: 'Internal UI error. Expected click on "Find patron" or "Add item" but could not determine, which were clicked.' },
      patron: { identifier: 'Internal UI error. Expected click on "Find patron" or "Add item" but could not determine, which were clicked.' } });
  }

  findPatron(patron) {
    if (!patron) {
      throw new SubmissionError({ patron: { identifier: 'Please fill this out to continue' } });
    }

    const patronIdentifier = this.userIdentifierPref();
    this.props.mutator.scannedItems.replace([]);
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
        document.getElementById('barcode').focus();
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
    if (this.props.resources.patrons.length === 0) {
      throw new SubmissionError({ patron: { identifier: 'Please fill this out to continue' } });
    }
    return this.fetchItemByBarcode(data.item.barcode)
      .then(item => this.postLoan(this.props.resources.patrons[0].id, item.id))
      .then(() => this.clearField('CheckOut', 'item.barcode'));
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
      const scannedItems = [];
      scannedItems.push(loanresponse);
      return this.props.mutator.scannedItems.replace(scannedItems.concat(this.props.resources.scannedItems));
    });
  }

  clearField(formName, fieldName) {
    this.context.stripes.store.dispatch(change(formName, fieldName, ''));
  }

  render() {
    const resources = this.props.resources;
    const userIdentifierPref = (resources.userIdentifierPref || {}).records || [];
    const scannedItems = resources.scannedItems || [];
    const patrons = resources.patrons || [];

    if (!userIdentifierPref) return <div />;
    return React.createElement(CheckOut, {
      onClickDone: this.onClickDone,
      submithandler: this.onSubmitInCheckOutForm,
      initialValues: {},
      patrons,
      scannedItems,
      parentProps: this.props,
      userIdentifierPref: this.userIdentifierPref(),
    });
  }
}

export default Scan;
