import React from 'react';

export function getRowURL(data) {
  return ((data.username) ?
    `/users/view/${data.id}/${data.username}` :
    `/items/view/${data.itemId}`);
}

export function getAnchoredRowFormatter(row) {
  return (
    <a
      href={getRowURL(row.rowData)} key={`row-${row.rowIndex}`}
      aria-label={row.labelStrings && row.labelStrings.join('...')}
      role="listitem"
      className={`${row.rowClass}`}
      {...row.rowProps}
    >
      {row.cells}
    </a>
  );
}
