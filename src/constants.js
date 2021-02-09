export const errorTypes = {
  INVALID_SCHEDULE: 1,
  INVALID_ITEM: 2,
  SCAN_FAILED: 3,
  ITEM_CHECKED_OUT: 4,
};

export const patronIdentifierMap = {
  BARCODE: 'barcode',
  EXTERNAL: 'externalSystemId',
  FOLIO: 'id',
  USER: 'username',
};

export const patronLabelMap = {
  BARCODE: 'barcode',
  EXTERNAL: 'externalSystemId',
  FOLIO: 'folioRecordNumber',
  USER: 'username',
};

export const DATE_PICKER_DEFAULTS = {
  date: '',
  time: '23:59:00.000Z',
};

export const INVALID_DATE_MESSAGE = 'Invalid date';

export const defaultPatronIdentifier = 'BARCODE';

export const ITEM_NOT_LOANABLE = 'Item is not loanable';
export const OVERRIDABLE_ERROR_MESSAGES = [ITEM_NOT_LOANABLE];

export const statuses = {
  CHECK_OUT: 'Check out',
  IN_PROCESS_NON_REQUESTABLE: 'In process (non-requestable)',
  LONG_MISSING: 'Long missing',
  LOST_AND_PAID: 'Lost and paid',
  MISSING: 'Missing',
  RESTRICTED: 'Restricted',
  UNAVAILABLE: 'Unavailable',
  UNKNOWN: 'Unknown',
  WITHDRAWN: 'Withdrawn',
};

export const statusMessages = {
  'In process (non-requestable)': 'ui-checkout.statuses.inProcessNonRequestable',
  'Long missing': 'ui-checkout.statuses.longMissing',
  'Lost and paid': 'ui-checkout.statuses.lostAndPaid',
  'Missing': 'ui-checkout.statuses.missing',
  'Restricted': 'ui-checkout.statuses.restricted',
  'Unavailable': 'ui-checkout.statuses.unavailable',
  'Unknown': 'ui-checkout.statuses.unknown',
  'Withdrawn': 'ui-checkout.statuses.withdrawn',
};

export default '';
