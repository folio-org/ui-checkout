import _ from 'lodash';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import ChangeDueDateDialog from '@folio/stripes-smart-components/lib/ChangeDueDateDialog';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Button from '@folio/stripes-components/lib/Button';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import MenuItem from '@folio/stripes-components/lib/MenuItem';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';

const sortMap = {
  no: loan => loan.no,
  title: loan => _.get(loan, ['item', 'title']),
  loanPolicy: () => '-',
  barcode: loan => _.get(loan, ['item', 'barcode']),
  dueDate: loan => loan.dueDate.substr(0, 10),
  time: loan => moment(loan.dueDate).format('hh:mm a'),
};

const visibleColumns = ['no', 'barcode', 'title', 'loanPolicy', 'dueDate', 'time', ' '];

class ViewItem extends React.Component {
  static propTypes = {
    scannedItems: PropTypes.arrayOf(PropTypes.object),
    stripes: PropTypes.object,
    patron: PropTypes.shape({
      id: PropTypes.string,
    })
  };

  static contextTypes = {
    history: PropTypes.object,
    translate: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.formatTime = this.props.stripes.formatTime;
    this.formatDate = this.props.stripes.formatDate;
    this.connectedChangeDueDateDialog = props.stripes.connect(ChangeDueDateDialog);
    this.navigate = this.navigate.bind(this);
    this.onMenuToggle = this.onMenuToggle.bind(this);
    this.onSort = this.onSort.bind(this);
    this.hideChangeDueDateDialog = this.hideChangeDueDateDialog.bind(this);

    this.state = {
      sortOrder: ['no', 'title'],
      sortDirection: ['asc', 'asc'],
      activeLoan: {},
      changeDueDateDialogOpen: false,
    };

    this.columnMapping = context.translate({
      no: 'numberAbbreviation',
      title: 'title',
      loanPolicy: 'loanPolicy',
      dueDate: 'dueDate',
      loanDate: 'time',
    });
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
      'title': loan => _.get(loan, ['item', 'title']),
      'loanPolicy': loan => _.get(loan, ['loanPolicy', 'name']),
      'barcode': loan => _.get(loan, ['item', 'barcode']),
      'dueDate': loan => (this.formatDate(loan.dueDate)),
      'time': loan => (this.formatTime(loan.dueDate)),
      ' ': loan => this.renderActions(loan),
    };
  }

  navigate(url, e) {
    e.preventDefault();
    e.stopPropagation();
    if (url) this.context.history.push(url);
  }

  changeDueDate(loan) {
    this.setState({
      changeDueDateDialogOpen: true,
      activeLoan: loan.id
    });
  }

  hideChangeDueDateDialog() {
    this.setState({
      changeDueDateDialogOpen: false,
    });
  }

  renderActions(loan) {
    const loanDetailsUrl = `/users/view/${loan.userId}?layer=loan&loan=${loan.id}&query=`;
    const itemDetailsUrl = `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}?query=`;
    const loanPolicyUrl = `/settings/circulation/loan-policies/${loan.loanPolicy.id}`;

    return (
      <UncontrolledDropdown onSelectItem={this.navigate} onToggle={this.onMenuToggle}>
        <Button data-role="toggle" buttonStyle="hover dropdownActive"><strong>•••</strong></Button>
        <DropdownMenu data-role="menu" pullRight width="10em">
          <MenuItem itemMeta={itemDetailsUrl}>
            <Button buttonStyle="dropdownItem" href={itemDetailsUrl}>Item details</Button>
          </MenuItem>
          <MenuItem itemMeta={loanDetailsUrl}>
            <Button buttonStyle="dropdownItem" href={loanDetailsUrl}>{this.context.translate('loanDetails')}</Button>
          </MenuItem>
          {
            this.props.stripes.hasPerm('ui-circulation.settings.loan-policies') &&
            <MenuItem itemMeta={loanPolicyUrl}>
              <Button buttonStyle="dropdownItem" href={loanPolicyUrl}>{this.context.translate('loanPolicy')}</Button>
            </MenuItem>
          }
          <MenuItem itemMeta={{ loan, action: 'changeDueDate' }}>
            <Button buttonStyle="dropdownItem"><FormattedMessage id="stripes-smart-components.cddd.changeDueDate" /></Button>
          </MenuItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  renderChangeDueDateDialog() {
    const loan = this.props.scannedItems.find(item => this.state.activeLoan === item.id) || {};
    const loanIds = [{ id: loan.id }];

    return (
      <this.connectedChangeDueDateDialog
        stripes={this.props.stripes}
        loanIds={loanIds}
        onClose={this.hideChangeDueDateDialog}
        open={this.state.changeDueDateDialogOpen}
        user={this.props.patron}
      />
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
      <React.Fragment>
        <MultiColumnList
          id="list-items-checked-out"
          visibleColumns={visibleColumns}
          columnMapping={this.columnMapping}
          contentData={contentData}
          rowMetadata={['id']}
          formatter={this.getItemFormatter()}
          columnWidths={{ 'no': 28, 'barcode': 120, 'title': 250, 'loanPolicy': 145, 'dueDate': 75, 'time': 70, ' ': 40 }}
          isEmptyMessage={this.context.translate('noItemsEntered')}
          onHeaderClick={this.onSort}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
        />
        { this.renderChangeDueDateDialog() }
      </React.Fragment>
    );
  }
}

export default ViewItem;
