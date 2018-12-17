import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { FormattedDate, FormattedMessage, FormattedTime } from 'react-intl';
import PropTypes from 'prop-types';
import { ChangeDueDateDialog } from '@folio/stripes/smart-components';

import {
  Button,
  DropdownMenu,
  MenuItem,
  MultiColumnList,
  UncontrolledDropdown,
} from '@folio/stripes/components';

const sortMap = {
  no: loan => loan.no,
  title: loan => _.get(loan, ['item', 'title']),
  loanPolicy: () => '-',
  barcode: loan => _.get(loan, ['item', 'barcode']),
  dueDate: loan => loan.dueDate.substr(0, 10),
  time: loan => moment(loan.dueDate).format('hh:mm a'),
};

const visibleColumns = ['no', 'Barcode', 'title', 'loanPolicy', 'dueDate', 'Time', ' '];

const columnWidths = {
  'Barcode': 140,
  'title': 180,
  'loanPolicy': 150,
  'dueDate': 90,
  'Time': 75,
  ' ': 55,
};

class ViewItem extends React.Component {
  static propTypes = {
    scannedItems: PropTypes.arrayOf(PropTypes.object),
    stripes: PropTypes.object,
    patron: PropTypes.shape({
      id: PropTypes.string,
    }),
    parentMutator: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.connectedChangeDueDateDialog = props.stripes.connect(ChangeDueDateDialog);
    this.onMenuToggle = this.onMenuToggle.bind(this);
    this.onSort = this.onSort.bind(this);
    this.hideChangeDueDateDialog = this.hideChangeDueDateDialog.bind(this);

    this.state = {
      sortOrder: ['no', 'title'],
      sortDirection: ['asc', 'asc'],
      activeLoan: {},
      changeDueDateDialogOpen: false,
    };

    this.columnMapping = {
      no: <FormattedMessage id="ui-checkout.numberAbbreviation" />,
      title: <FormattedMessage id="ui-checkout.title" />,
      loanPolicy: <FormattedMessage id="ui-checkout.loanPolicy" />,
      dueDate: <FormattedMessage id="ui-checkout.dueDate" />,
      loanDate: <FormattedMessage id="ui-checkout.time" />,
    };
  }

  onSort(e, meta) {
    if (!sortMap[meta.alias]) return;

    let {
      sortOrder,
      sortDirection,
    } = this.state;

    if (sortOrder[0] !== meta.alias) {
      sortOrder = [meta.alias, sortOrder[0]];
      sortDirection = ['asc', sortDirection[0]];
    } else {
      const direction = (sortDirection[0] === 'desc') ? 'asc' : 'desc';
      sortDirection = [direction, sortDirection[1]];
    }

    this.setState({ sortOrder, sortDirection });
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
      'Barcode': loan => _.get(loan, ['item', 'barcode']),
      'dueDate': loan => (<FormattedDate value={loan.dueDate} />),
      'Time': loan => (<FormattedTime value={loan.dueDate} />),
      ' ': loan => this.renderActions(loan),
    };
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

    this.refreshLoans();
  }

  refreshLoans = async () => {
    const {
      scannedItems,
      parentMutator,
    } = this.props;

    const ids = scannedItems.map(it => `id==${it.id}`).join(' or ');
    const query = `(${ids})`;
    parentMutator.loans.reset();

    const response = await parentMutator.loans.GET({ params: { query } });

    parentMutator.scannedItems.replace(response.loans);
  }

  handleOptionsChange(itemMeta, e) {
    e.preventDefault();
    e.stopPropagation();

    const {
      loan,
      action,
    } = itemMeta;

    if (action && this[action]) {
      this[action](loan);
    }
  }

  showItemDetails(loan, e) {
    if (e) e.preventDefault();
    this.props.parentMutator.query.update({
      _path: `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`,
    });
  }

  showLoanDetails(loan, e) {
    if (e) e.preventDefault();
    this.props.parentMutator.query.update({
      _path: `/users/view/${loan.userId}?layer=loan&loan=${loan.id}`,
    });
  }

  showLoanPolicy(loan, e) {
    if (e) e.preventDefault();
    this.props.parentMutator.query.update({
      _path: `/settings/circulation/loan-policies/${loan.loanPolicyId}`,
    });
  }

  renderActions(loan) {
    const { stripes } = this.props;

    return (
      <UncontrolledDropdown
        onSelectItem={this.handleOptionsChange}
        onToggle={this.onMenuToggle}
      >
        <Button
          data-role="toggle"
          buttonStyle="hover dropdownActive"
        >
          <strong>•••</strong>
        </Button>
        <DropdownMenu
          data-role="menu"
          pullRight
          width="10em"
        >
          <MenuItem itemMeta={{ loan, action: 'showItemDetails' }}>
            <Button
              buttonStyle="dropdownItem"
              href={`/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}?query=`}
            >
              <FormattedMessage id="ui-checkout.itemDetails" />
            </Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'showLoanDetails' }}>
            <Button
              buttonStyle="dropdownItem"
              href={`/users/view/${loan.userId}?layer=loan&loan=${loan.id}&query=`}
            >
              <FormattedMessage id="ui-checkout.loanDetails" />
            </Button>
          </MenuItem>
          {
            stripes.hasPerm('ui-circulation.settings.loan-policies') &&
            <MenuItem itemMeta={{ loan, action: 'showLoanPolicy' }}>
              <Button
                buttonStyle="dropdownItem"
                href={`/settings/circulation/loan-policies/${loan.loanPolicyId}`}
              >
                <FormattedMessage id="ui-checkout.loanPolicy" />
              </Button>
            </MenuItem>
          }
          <MenuItem itemMeta={{ loan, action: 'changeDueDate' }}>
            <Button buttonStyle="dropdownItem">
              <FormattedMessage id="stripes-smart-components.cddd.changeDueDate" />
            </Button>
          </MenuItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  renderChangeDueDateDialog() {
    const {
      scannedItems,
      stripes,
      patron,
    } = this.props;

    const {
      changeDueDateDialogOpen,
      activeLoan,
    } = this.state;

    const loan = scannedItems.find(item => activeLoan === item.id) || {};
    const loanIds = [{ id: loan.id }];

    return (
      <this.connectedChangeDueDateDialog
        stripes={stripes}
        loanIds={loanIds}
        onClose={this.hideChangeDueDateDialog}
        open={changeDueDateDialogOpen}
        user={patron}
      />
    );
  }

  render() {
    const {
      scannedItems,
    } = this.props;

    const {
      sortOrder,
      sortDirection,
    } = this.state;

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
          columnWidths={columnWidths}
          isEmptyMessage={<FormattedMessage id="ui-checkout.noItemsEntered" />}
          onHeaderClick={this.onSort}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
        />
        {this.renderChangeDueDateDialog()}
      </React.Fragment>
    );
  }
}

export default ViewItem;
