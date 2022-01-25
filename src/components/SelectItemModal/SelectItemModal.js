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
  'itemStatus',
  'location',
  'materialType',
  'loanType',
];

const COLUMN_WIDTHS = {
  barcode: '20%',
  itemStatus: '20%',
  location: '20%',
  materialType: '20%',
  loanType: '20%',
};

const COLUMN_MAP = {
  barcode: <FormattedMessage id="ui-checkout.selectItemModal.barcode" />,
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
          paneTitle={<FormattedMessage id="ui-checkout.selectItemModal.itemsList" />}
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