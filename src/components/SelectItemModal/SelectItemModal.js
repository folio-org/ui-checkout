import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Modal,
  Paneset,
  Pane,
  MultiColumnList,
  MCLPagingTypes,
  NoValue,
} from '@folio/stripes/components';

import { PAGE_AMOUNT } from '../../constants';

import css from './SelectItemModal.css';

export const COLUMN_NAMES = [
  'barcode',
  'title',
  'callNumber',
  'itemStatus',
  'location',
  'materialType',
  'loanType',
];

export const COLUMN_WIDTHS = {
  barcode: '14%',
  title: '14%',
  callNumber: '14%',
  itemStatus: '14%',
  location: '14%',
  materialType: '14%',
  loanType: '14%',
};

export const COLUMN_MAP = {
  barcode: <FormattedMessage id="ui-checkout.selectItemModal.barcode" />,
  title: <FormattedMessage id="ui-checkout.selectItemModal.title" />,
  callNumber: <FormattedMessage id="ui-checkout.selectItemModal.callNumber" />,
  itemStatus: <FormattedMessage id="ui-checkout.selectItemModal.itemStatus" />,
  location: <FormattedMessage id="ui-checkout.selectItemModal.location" />,
  materialType: <FormattedMessage id="ui-checkout.selectItemModal.materialType" />,
  loanType: <FormattedMessage id="ui-checkout.selectItemModal.loanType" />,
};

export const formatter = {
  callNumber: item => item.callNumber || <NoValue />,
  itemStatus: item => item.status.name,
  location: item => item.effectiveLocation?.name ?? <NoValue />,
  materialType: item => item.materialType.name,
  loanType: item => (item.temporaryLoanType?.name || item.permanentLoanType?.name || <NoValue />),
};

export const MAX_HEIGHT = 500;

const propTypes = {
  checkoutItems: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func.isRequired,
  onSelectItem: PropTypes.func.isRequired,
  totalRecords: PropTypes.number.isRequired,
  pagingOffset: PropTypes.number.isRequired,
  onNeedMoreData: PropTypes.func.isRequired,
  barcode: PropTypes.oneOfType([
    PropTypes.oneOf([null, PropTypes.string])
  ]).isRequired,
};

const SelectItemModal = ({
  checkoutItems,
  onClose,
  onSelectItem,
  totalRecords,
  onNeedMoreData,
  barcode,
  pagingOffset,
}) => {
  const getMoreData = (askAmount, index) => {
    onNeedMoreData(barcode, index);
  };
  const pagingCanGoPrevious = pagingOffset > 0;
  const pagingCanGoNext = pagingOffset < totalRecords && totalRecords - pagingOffset > PAGE_AMOUNT;

  return (
    <Modal
      data-test-select-item-modal
      data-testid="selectItemModal"
      label={<FormattedMessage id="ui-checkout.selectItemModal.heading" />}
      open
      contentClass={css.content}
      onClose={onClose}
      dismissible
    >
      <Paneset
        id="itemsDialog"
        isRoot
        static
      >
        <Pane
          id="items-dialog-items-list"
          paneTitle={<FormattedMessage id="ui-checkout.selectItemModal.itemListHeader" />}
          paneSub={<FormattedMessage id="ui-checkout.selectItemModal.resultCount" values={{ count: totalRecords }} />}
          defaultWidth="fill"
        >
          <MultiColumnList
            id="items-list"
            interactive
            contentData={checkoutItems}
            visibleColumns={COLUMN_NAMES}
            columnMapping={COLUMN_MAP}
            columnWidths={COLUMN_WIDTHS}
            formatter={formatter}
            maxHeight={MAX_HEIGHT}
            onRowClick={onSelectItem}
            totalCount={totalRecords}
            onNeedMoreData={getMoreData}
            pageAmount={PAGE_AMOUNT}
            pagingType={MCLPagingTypes.PREV_NEXT}
            pagingCanGoPrevious={pagingCanGoPrevious}
            pagingCanGoNext={pagingCanGoNext}
            pagingOffset={pagingOffset}
          />
        </Pane>
      </Paneset>
    </Modal>
  );
};

SelectItemModal.propTypes = propTypes;

export default SelectItemModal;
