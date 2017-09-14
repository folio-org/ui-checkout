import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import TextField from '@folio/stripes-components/lib/TextField';
import { Row, Col } from 'react-bootstrap';

import { getAnchoredRowFormatter } from './util';

const propTypes = {
  patrons: React.PropTypes.arrayOf(React.PropTypes.object),
};

const contextTypes = {
  history: PropTypes.object,
};

const patronsListFormatter = {
  Active: user => user.active,
  Name: user => `${_.get(user, ['personal', 'lastName'], '')}, ${_.get(user, ['personal', 'firstName'], '')}`,
  Username: user => user.username,
  Email: user => _.get(user, ['personal', 'email']),
};

class PatronView extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.onSelectRow = this.onSelectRow.bind(this);
  }

  onSelectRow(e, patron) {
    const userId = patron.id;
    const username = patron.username;
    this.context.history.push(`/users/view/${userId}/${username}`);
  }

  render() {
    const patrons = this.props.patrons;

    return (
      <MultiColumnList
        id="list-patrons"
        contentData={patrons}
        rowMetadata={['id', 'username']}
        formatter={patronsListFormatter}
        visibleColumns={['Active', 'Name', 'Username', 'Email']}
        autosize
        virtualize
        isEmptyMessage={'No patron selected'}
        rowFormatter={getAnchoredRowFormatter}
        onRowClick={this.onSelectRow}
      />
    );
  }
}

PatronView.propTypes = propTypes;
PatronView.contextTypes = contextTypes;

export default PatronView;
