import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Modal,
  Paneset,
  Pane,
  MultiColumnList,
} from '@folio/stripes/components';

import css from './SelectItemModal.css';

const COLUMN_NAMES = [
  'barcode',
  'title',
  'callNumber',
  'itemStatus',
  'location',
  'materialType',
  'loanType',
];

const COLUMN_WIDTHS = {
  barcode: '14%',
  title: '14%',
  callNumber: '14%',
  itemStatus: '14%',
  location: '14%',
  materialType: '14%',
  loanType: '14%',
};

const COLUMN_MAP = {
  barcode: <FormattedMessage id="ui-checkout.selectItemModal.barcode" />,
  title: <FormattedMessage id="ui-checkout.selectItemModal.title" />,
  callNumber: <FormattedMessage id="ui-checkout.selectItemModal.callNumber" />,
  itemStatus: <FormattedMessage id="ui-checkout.selectItemModal.itemStatus" />,
  location: <FormattedMessage id="ui-checkout.selectItemModal.location" />,
  materialType: <FormattedMessage id="ui-checkout.selectItemModal.materialType" />,
  loanType: <FormattedMessage id="ui-checkout.selectItemModal.loanType" />,
};

const formatter = {
  itemStatus: item => item.status.name,
  location: item => item.effectiveLocation?.name ?? '',
  materialType: item => item.materialType.name,
  loanType: item => (item.temporaryLoanType?.name || item.permanentLoanType?.name || ''),
};

const MAX_HEIGHT = 500;

const propTypes = {
  checkoutItems: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func.isRequired,
  onSelectItem: PropTypes.func.isRequired,
};

const SelectItemModal = ({
  checkoutItems,
  onClose,
  onSelectItem,
}) => {
  return (
    <Modal
      data-test-select-item-modal
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
          paneTitle={<FormattedMessage id="ui-checkout.selectItemModal.itemListHeader" />}
          paneSub={<FormattedMessage id="ui-checkout.selectItemModal.resultCount" values={{ count: checkoutItems.length }} />}
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
          />
        </Pane>
      </Paneset>
    </Modal>
  );
};

SelectItemModal.propTypes = propTypes;

export default SelectItemModal;
