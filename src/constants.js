export const errorTypes = {
  INVALID_SCHEDULE: 1,
  INVALID_ITEM: 2,
  SCAN_FAILED: 3,
  ITEM_CHECKED_OUT: 4,
};

export const MAX_RECORDS = 40;

export const INVALID_DATE_MESSAGE = 'Invalid date';

export const defaultPatronIdentifier = 'barcode';

export const ITEM_NOT_LOANABLE = 'Item is not loanable';

export const USER_HAS_NO_BARCODE = 'Could not find user with matching barcode';

export const MAX_ITEM_BLOCK_LIMIT = 'Patron has reached maximum limit of';

export const OVERRIDABLE_ERROR_MESSAGES = [
  ITEM_NOT_LOANABLE,
  MAX_ITEM_BLOCK_LIMIT,
];

export const ERRORS_TO_HIDE = [
  'Cannot check out item that already has an open loan',
];

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

export const refundClaimReturned = {
  PAYMENT_STATUS: 'Suspended claim returned',
};

export default '';
