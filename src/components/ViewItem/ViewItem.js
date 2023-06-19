import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import _ from 'lodash';
import moment from 'moment';

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

import AddInfoDialog from './AddInfoDialog';

import css from './ViewItem.css';

const COLUMNS_NAME = {
  NO: 'no',
  BARCODE: 'barcode',
  TITLE: 'title',
  LOAN_POLICY: 'loanPolicy',
  DUE_DATE: 'dueDate',
  TIME: 'time',
  ACTION: 'action',
};

export const sortMap = {
  [COLUMNS_NAME.NO]: loan => loan.no,
  [COLUMNS_NAME.TITLE]: loan => _.get(loan, ['item', 'title']),
  [COLUMNS_NAME.LOAN_POLICY]: () => '-',
  [COLUMNS_NAME.BARCODE]: loan => _.get(loan, ['item', 'barcode']),
  [COLUMNS_NAME.DUE_DATE]: loan => loan.dueDate.substr(0, 10),
  [COLUMNS_NAME.TIME]: loan => moment(loan.dueDate).format('hh:mm a'),
};

export const visibleColumns = [
  COLUMNS_NAME.NO,
  COLUMNS_NAME.BARCODE,
  COLUMNS_NAME.TITLE,
  COLUMNS_NAME.LOAN_POLICY,
  COLUMNS_NAME.DUE_DATE,
  COLUMNS_NAME.TIME,
  COLUMNS_NAME.ACTION
];

export const columnWidths = {
  [COLUMNS_NAME.BARCODE]: '10%',
  [COLUMNS_NAME.TITLE]: '27%',
  [COLUMNS_NAME.LOAN_POLICY]: '20%',
  [COLUMNS_NAME.DUE_DATE]: '13%',
  [COLUMNS_NAME.TIME]: '10%',
  [COLUMNS_NAME.ACTION]: '10%',
  [COLUMNS_NAME.NO]: '8%'
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
    overriddenItemLimitData: PropTypes.shape({
      itemLimitOverridden: PropTypes.bool.isRequired,
      overriddenItemsList: PropTypes.arrayOf(PropTypes.object).isRequired,
    }).isRequired,
    addPatronOrStaffInfo: PropTypes.func.isRequired,
    intl: PropTypes.object,
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
      infoType: undefined, // may be set to 'patronInfo' or 'staffInfo' to display modal
      loanForInfo: undefined, // significant only when infoType is defined
    };

    this.columnMapping = {
      [COLUMNS_NAME.BARCODE]: <FormattedMessage id="ui-checkout.barcode" />,
      [COLUMNS_NAME.DUE_DATE]: <FormattedMessage id="ui-checkout.due.date" />,
      [COLUMNS_NAME.LOAN_POLICY]: <FormattedMessage id="ui-checkout.loanPolicy" />,
      [COLUMNS_NAME.NO]: <FormattedMessage id="ui-checkout.numberAbbreviation" />,
      [COLUMNS_NAME.TIME]: <FormattedMessage id="ui-checkout.time" />,
      [COLUMNS_NAME.TITLE]: <FormattedMessage id="ui-checkout.title" />,
      [COLUMNS_NAME.ACTION]: <FormattedMessage id="ui-checkout.action" />,
    };
  }

  onSort(e, meta) {
    if (!sortMap[meta.name]) return;

    let {
      sortOrder,
      sortDirection,
    } = this.state;

    if (sortOrder[0] !== meta.name) {
      sortOrder = [meta.name, sortOrder[0]];
      sortDirection = ['asc', sortDirection[0]];
    } else {
      const direction = (sortDirection[0] === 'desc') ? 'asc' : 'desc';
      sortDirection = [direction, sortDirection[1]];
    }

    this.setState({ sortOrder, sortDirection });
  }

  renderOverriddenLabel = (barcode) => {
    const {
      overriddenItemLimitData: {
        itemLimitOverridden,
        overriddenItemsList,
      }
    } = this.props;

    return itemLimitOverridden && overriddenItemsList.includes(barcode)
      ?
      (
        <span data-test-overrided-item-block>
          <br />
          <FormattedMessage id="ui-checkout.item.block.overrided" />
        </span>
      )
      : null;
  }

  getItemFormatter() {
    const { intl: { formatNumber, formatMessage } } = this.props;

    return {
      [COLUMNS_NAME.NO]: loan => formatNumber(loan.no),
      [COLUMNS_NAME.TITLE]: loan => (<div data-test-item-title>{_.get(loan, ['item', 'title'])}</div>),
      [COLUMNS_NAME.LOAN_POLICY]: loan => {
        const barcode = _.get(loan, ['item', 'barcode']);

        return (
          <div data-test-item-loan-policy>
            {_.get(loan, ['loanPolicy', 'name'])}
            {this.renderOverriddenLabel(barcode)}
          </div>
        );
      },
      [COLUMNS_NAME.BARCODE]: loan => (<div data-test-item-barcode>{_.get(loan, ['item', 'barcode'])}</div>),
      [COLUMNS_NAME.DUE_DATE]: loan => {
        return (
          <div data-test-item-due-date className={css.loanDueDate}>
            <div><FormattedDate value={loan.dueDate} /></div>
            {
              (loan.dueDateChangedByRecall || loan.dueDateChangedByHold || loan.dueDateChangedByNearExpireUser) && (
                <Tooltip
                  id={loan.id}
                  text={<FormattedMessage id="ui-checkout.due.date.change" />}
                >
                  { ({ ref, ariaIds }) => (
                    <div
                      ref={ref} /* can't pass ref directly to Icon without issues */
                      aria-labelledby={ariaIds.text}
                    >
                      <Icon
                        icon="flag"
                        size="small"
                        iconClassName={css.tooltipIcon}
                        aria-label={formatMessage({ id: 'ui-checkout.due.date.change' })}
                      />
                    </div>
                  )}
                </Tooltip>
              )
            }
          </div>
        );
      },
      [COLUMNS_NAME.TIME]: loan => (<div data-test-item-time><FormattedTime value={loan.dueDate} /></div>),
      [COLUMNS_NAME.ACTION]: loan => (<div data-test-item-actions>{this.renderActions(loan)}</div>),
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
      loan.item.circulationNotes = _.get(loanMap, `${loan.id}.item.circulationNotes`);
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
    if (e) {
      e.preventDefault();
    }

    this.props.parentMutator.query.update({
      _path: `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`,
    });
  }

  showLoanDetails(loan, e) {
    if (e) {
      e.preventDefault();
    }

    this.props.parentMutator.query.update({
      _path: `/users/view/${loan.userId}?layer=loan&loan=${loan.id}`,
    });
  }

  showLoanPolicy(loan, e) {
    if (e) {
      e.preventDefault();
    }

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
          { stripes.hasPerm('ui-users.loans.change-due-date') &&
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
          { stripes.hasPerm('ui-users.loans.add-patron-info') &&
            <Button
              data-test-add-patron-info
              buttonStyle="dropdownItem"
              onClick={() => this.setState({ infoType: 'patronInfo', loanForInfo: loan })}
            >
              <FormattedMessage id="ui-checkout.checkout.addInfo.patronInfo.button" />
            </Button>}
          { stripes.hasPerm('ui-users.loans.add-staff-info') &&
            <Button
              data-test-add-staff-info
              buttonStyle="dropdownItem"
              onClick={() => this.setState({ infoType: 'staffInfo', loanForInfo: loan })}
            >
              <FormattedMessage id="ui-checkout.checkout.addInfo.staffInfo.button" />
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

  renderAddInfoDialog() {
    const {
      infoType,
      loanForInfo,
    } = this.state;

    if (!infoType) {
      return undefined;
    }

    return (
      <AddInfoDialog
        loan={loanForInfo}
        infoType={infoType}
        addPatronOrStaffInfo={this.props.addPatronOrStaffInfo}
        onClose={() => this.setState({ infoType: undefined })}
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
    } = this.state;

    const size = scannedItems.length;
    const items = scannedItems.map((it, index) => ({ ...it, no: size - index }));
    const contentData = _.orderBy(items, [sortMap[sortOrder[0]], sortMap[sortOrder[1]]], sortDirection);
    const emptyMessage = !loading ? <FormattedMessage id="ui-checkout.noItemsEntered" /> : null;

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
        {this.renderAddInfoDialog()}
      </>
    );
  }
}

export default injectIntl(ViewItem);
