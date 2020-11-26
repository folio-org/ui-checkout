import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { ChangeDueDateDialog } from '@folio/stripes/smart-components';
import {
  Button,
  Dropdown,
  DropdownMenu,
  Icon,
  MultiColumnList,
  Tooltip,
  FormattedDate,
  FormattedTime,
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
  'Barcode': { max: 140 },
  'title': { max: 180 },
  'loanPolicy': { max: 150 },
  'dueDate': { max: 90 },
  'Time': { max: 75 },
  ' ': { max: 75 },
};

class ViewItem extends React.Component {
  static propTypes = {
    scannedItems: PropTypes.arrayOf(PropTypes.object),
    stripes: PropTypes.object,
    patron: PropTypes.shape({
      id: PropTypes.string,
    }),
    parentMutator: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    showCheckoutNotes: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.connectedChangeDueDateDialog = props.stripes.connect(ChangeDueDateDialog);
    this.onSort = this.onSort.bind(this);
    this.hideChangeDueDateDialog = this.hideChangeDueDateDialog.bind(this);

    this.state = {
      sortOrder: ['no', 'title'],
      sortDirection: ['desc', 'asc'],
      activeLoan: {},
      changeDueDateDialogOpen: false,
    };

    this.columnMapping = {
      no: <FormattedMessage id="ui-checkout.numberAbbreviation" />,
      title: <FormattedMessage id="ui-checkout.title" />,
      loanPolicy: <FormattedMessage id="ui-checkout.loanPolicy" />,
      dueDate: <FormattedMessage id="ui-checkout.due.date" />,
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

  getItemFormatter() {
    return {
      'title': loan => (<div data-test-item-title>{_.get(loan, ['item', 'title'])}</div>),
      'loanPolicy': loan => (<div data-test-item-loan-policy>{_.get(loan, ['loanPolicy', 'name'])}</div>),
      'Barcode': loan => (<div data-test-item-barcode>{_.get(loan, ['item', 'barcode'])}</div>),
      'dueDate': loan => (<div data-test-item-due-date><FormattedDate value={loan.dueDate} /></div>),
      'Time': loan => (<div data-test-item-time><FormattedTime value={loan.dueDate} /></div>),
      ' ': loan => (<div data-test-item-actions>{this.renderActions(loan)}</div>),
    };
  }

  changeDueDate(loan) {
    this.setState({
      changeDueDateDialogOpen: true,
      activeLoan: loan.id
    });
  }

  hideChangeDueDateDialog() {
    this.refreshLoans();
    this.setState({
      changeDueDateDialogOpen: false,
    });
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
    const { loans } = response;
    const loanMap = {};

    scannedItems.forEach(loan => {
      loanMap[loan.id] = loan;
    });

    const newLoans = loans.map(loan => {
      loan.loanPolicy = _.get(loanMap, `${loan.id}.loanPolicy`);
      return loan;
    });

    parentMutator.scannedItems.replace(newLoans);
  };

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

  showCheckoutNotes(loan) {
    this.props.showCheckoutNotes(loan);
  }

  renderActions(loan) {
    const { stripes } = this.props;
    const isCheckOutNote = element => element.noteType === 'Check out';
    const checkoutNotePresent = _.get(loan.item, ['circulationNotes'], []).some(isCheckOutNote);

    const trigger = ({ getTriggerProps, triggerRef }) => {
      return (
        <>
          <Button
            {...getTriggerProps()}
            buttonStyle="hover dropdownActive"
            aria-labelledby="checkout-actions-tooltip-text"
            id="available-item-actions-button"
          >
            <Icon icon="ellipsis" size="large" />
          </Button>
          <Tooltip
            id="checkout-actions-tooltip"
            text={<FormattedMessage id="ui-checkout.actions.moreDetails" />}
            triggerRef={triggerRef}
          />
        </>
      );
    };

    const menu = ({ onToggle }) => {
      return (
        <DropdownMenu
          role="menu"
          aria-label="available actions"
          onToggle={onToggle}
        >
          <Button
            data-test-show-item-details
            buttonStyle="dropdownItem"
            href={`/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}?query=`}
            onClick={(e) => this.handleOptionsChange({ loan, action: 'showItemDetails' }, e)}
          >
            <FormattedMessage id="ui-checkout.itemDetails" />
          </Button>
          <Button
            data-test-show-loan-details
            buttonStyle="dropdownItem"
            href={`/users/view/${loan.userId}?layer=loan&loan=${loan.id}&query=`}
            onClick={(e) => this.handleOptionsChange({ loan, action: 'showLoanDetails' }, e)}
          >
            <FormattedMessage id="ui-checkout.loanDetails" />
          </Button>
          { stripes.hasPerm('ui-circulation.settings.loan-policies') &&
            <Button
              data-test-show-loan-policy
              buttonStyle="dropdownItem"
              href={`/settings/circulation/loan-policies/${loan.loanPolicyId}`}
              onClick={(e) => this.handleOptionsChange({ loan, action: 'showLoanPolicy' }, e)}
            >
              <FormattedMessage id="ui-checkout.loanPolicy" />
            </Button>}
          { stripes.hasPerm('ui-users.loans.edit') &&
            <Button
              data-test-date-picker
              buttonStyle="dropdownItem"
              onClick={(e) => this.handleOptionsChange({ loan, action: 'changeDueDate' }, e)}
            >
              <FormattedMessage id="stripes-smart-components.cddd.changeDueDate" />
            </Button>}
          { checkoutNotePresent &&
            <Button
              data-test-checkout-notes
              buttonStyle="dropdownItem"
              onClick={(e) => this.handleOptionsChange({ loan, action: 'showCheckoutNotes' }, e)}
            >
              <FormattedMessage id="ui-checkout.checkout.notes" />
            </Button>}
        </DropdownMenu>
      );
    };

    return (
      <div data-test-elipse-select>
        <Dropdown
          data-test-item-menu
          renderTrigger={trigger}
          renderMenu={menu}
        />
      </div>
    );
  }

  renderChangeDueDateDialog() {
    const {
      scannedItems,
      stripes,
      patron,
    } = this.props;

    // no sense rendering if we don't have a patron whose loans
    // we are updating.
    if (!patron) {
      return null;
    }

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
      loading,
    } = this.props;

    const {
      sortOrder,
      sortDirection,
      changeDueDateDialogOpen,
    } = this.state;

    const size = scannedItems.length;
    const items = scannedItems.map((it, index) => ({ ...it, no: size - index }));
    const contentData = _.orderBy(items,
      [sortMap[sortOrder[0]], sortMap[sortOrder[1]]], sortDirection);
    const emptyMessage = !loading ? <FormattedMessage id="ui-checkout.noItemsEntered" /> : null;
    console.log('changeDueDateDialogOpen', changeDueDateDialogOpen)
    return (
      <>
        <MultiColumnList
          key={contentData.length}
          id="list-items-checked-out"
          visibleColumns={visibleColumns}
          columnMapping={this.columnMapping}
          contentData={contentData}
          rowMetadata={['id']}
          formatter={this.getItemFormatter()}
          columnWidths={columnWidths}
          isEmptyMessage={emptyMessage}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
          interactive={false}
          onHeaderClick={this.onSort}
        />
        {this.renderChangeDueDateDialog()}
      </>
    );
  }
}

export default ViewItem;
