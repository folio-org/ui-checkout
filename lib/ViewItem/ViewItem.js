import _ from 'lodash';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react';
import PropTypes from 'prop-types';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';

import { getAnchoredRowFormatter } from '../../util';

const itemListFormatter = {
  Instance: loan => `${_.get(loan, ['item', 'title'])}`,
  barcode: loan => `${_.get(loan, ['item', 'barcode'])}`,
  'Due date': loan => loan.dueDate.substr(0, 10),
  Time: loan => moment(loan.dueDate).format('hh:mm a'),
};

class ViewItem extends React.Component {

  static propTypes = {
    scannedItems: PropTypes.arrayOf(PropTypes.object),
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
    const size = scannedItems.length;
    const columnMapping = {
      no: 'No.',
      title: 'Instance',
      dueDate: 'Due date',
      loanDate: 'Time',
    };

    const visibleColumns = ['no', 'barcode', 'Instance', 'Due date', 'Time'];
    const items = scannedItems.map((it, index) => ({ ...it, no: size - index }));

    return (
      <MultiColumnList
        id="list-items-checked-out"
        visibleColumns={visibleColumns}
        columnMapping={columnMapping}
        contentData={items}
        rowMetadata={['id']}
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
