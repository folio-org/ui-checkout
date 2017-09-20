import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';

import { getAnchoredRowFormatter } from '../../util';

const itemListFormatter = {
  title: loan => `${_.get(loan, ['item', 'title'])}`,
  barcode: loan => `${_.get(loan, ['item', 'barcode'])}`,
  'Date loaned': loan => loan.loanDate.substr(0, 10),
  'Date due': loan => loan.dueDate.substr(0, 10),
};

class ViewItem extends React.Component {

  static propTypes = {
    scannedItems: React.PropTypes.arrayOf(React.PropTypes.object),
  };

  static contextTypes = {
    history: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.onSelectRow = this.onSelectRow.bind(this);
  }

  onSelectRow(e, item) {
    this.context.history.push(`/items/view/${item.itemId}`);
  }

  render() {
    const scannedItems = this.props.scannedItems;

    return (
      <MultiColumnList
        id="list-items-checked-out"
        visibleColumns={['title', 'barcode', 'Date loaned', 'Date due']}
        rowMetadata={['id']}
        contentData={scannedItems}
        formatter={itemListFormatter}
        isEmptyMessage="No items have been entered yet."
        fullwidth
        rowFormatter={getAnchoredRowFormatter}
        onRowClick={this.onSelectRow}
      />
    );
  }
}

export default ViewItem;
