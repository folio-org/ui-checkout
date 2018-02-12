import _ from 'lodash';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedDate, FormattedTime } from 'react-intl';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Button from '@folio/stripes-components/lib/Button';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import MenuItem from '@folio/stripes-components/lib/MenuItem';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';

import { getDueDate } from '../../util';

const sortMap = {
  'No.': loan => loan.no,
  Title: loan => _.get(loan, ['item', 'title']),
  'Loan Policy': () => '-',
  barcode: loan => _.get(loan, ['item', 'barcode']),
  'Due date': loan => loan.dueDate.substr(0, 10),
  Time: loan => moment(loan.dueDate).format('hh:mm a'),
};

const columnMapping = {
  no: 'No.',
  title: 'Title',
  loanPolicy: 'Loan Policy',
  dueDate: 'Due date',
  loanDate: 'Time',
};

const visibleColumns = ['no', 'barcode', 'Title', 'Loan Policy', 'Due date', 'Time', ' '];

class ViewItem extends React.Component {
  static propTypes = {
    scannedItems: PropTypes.arrayOf(PropTypes.object),
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }),
  };

  static contextTypes = {
    history: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    this.context = context;

    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.onMenuToggle = this.onMenuToggle.bind(this);
    this.onSort = this.onSort.bind(this);

    this.state = {
      sortOrder: ['no', 'title'],
      sortDirection: ['asc', 'asc'],
    };
  }

  onSort(e, meta) {
    if (!sortMap[meta.alias]) return;

    let { sortOrder, sortDirection } = this.state;

    if (sortOrder[0] !== meta.alias) {
      sortOrder = [meta.alias, sortOrder[0]];
      sortDirection = ['asc', sortDirection[0]];
    } else {
      const direction = (sortDirection[0] === 'desc') ? 'asc' : 'desc';
      sortDirection = [direction, sortDirection[1]];
    }

    this.setState({ ...this.state, sortOrder, sortDirection });
  }

  // eslint-disable-next-line class-methods-use-this
  onMenuToggle(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  getItemFormatter() {
    return {
      Title: loan => (<Link to={`/inventory/view/${_.get(loan, ['item', 'instanceId'])}/${_.get(loan, ['item', 'holdingsRecordId'])}/${_.get(loan, ['itemId'])}`}>{_.get(loan, ['item', 'title'])}</Link>),
      'Loan Policy': loan => ((this.props.stripes.hasPerm('ui-circulation.settings.loan-policies')) ?
        (<Link to={`/settings/circulation/loan-policies/${loan.loanPolicy.id}`}>{_.get(loan, ['loanPolicy', 'name'])}</Link>) :
        (_.get(loan, ['loanPolicy', 'name']))),
      barcode: loan => (<Link to={`/inventory/view/${_.get(loan, ['item', 'instanceId'])}/${_.get(loan, ['item', 'holdingsRecordId'])}/${_.get(loan, ['itemId'])}`}>{_.get(loan, ['item', 'barcode'])}</Link>),
      'Due date': loan => (<FormattedDate value={getDueDate(loan)} />),
      Time: loan => (<FormattedTime value={getDueDate(loan)} />),
      ' ': loan => this.renderActions(loan),
    };
  }

  handleOptionsChange(key, e) {
    e.preventDefault();
    e.stopPropagation();
    if (key.action && this[key.action]) {
      this[key.action](key.loan);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  changeDueDate() {
    // TODO
  }

  showLoanDetails(loan) {
    this.context.history.push(`/users/view/${loan.userId}?layer=loan&loan=${loan.id}`);
  }

  renderActions(loan) {
    return (
      <UncontrolledDropdown
        onSelectItem={this.handleOptionsChange}
        onToggle={this.onMenuToggle}
      >
        <Button data-role="toggle" buttonStyle="hover dropdownActive"><strong>•••</strong></Button>
        <DropdownMenu data-role="menu" overrideStyle={{ padding: '6px 0' }}>
          <MenuItem itemMeta={{ loan, action: 'showLoanDetails' }}>
            <Button buttonStyle="dropdownItem">Loan details</Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'changeDueDate' }}>
            <Button buttonStyle="dropdownItem">Change due date</Button>
          </MenuItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  render() {
    const { sortOrder, sortDirection } = this.state;
    const scannedItems = this.props.scannedItems;
    const size = scannedItems.length;
    const items = scannedItems.map((it, index) => ({ ...it, no: size - index }));
    const contentData = _.orderBy(items,
      [sortMap[sortOrder[0]], sortMap[sortOrder[1]]], sortDirection);

    return (
      <MultiColumnList
        id="list-items-checked-out"
        visibleColumns={visibleColumns}
        columnMapping={columnMapping}
        contentData={contentData}
        rowMetadata={['id']}
        formatter={this.getItemFormatter()}
        columnWidths={{ no: 28, barcode: 120, Title: 320, 'Due date': 70, Time: 70, ' ': 40 }}
        isEmptyMessage="No items have been entered yet."
        onHeaderClick={this.onSort}
        sortOrder={sortOrder[0]}
        sortDirection={`${sortDirection[0]}ending`}
      />
    );
  }
}

export default ViewItem;
