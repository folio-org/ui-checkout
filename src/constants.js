export const BACKEND_ERROR_CODES = {
  userHasNoBarcode: 'USER_BARCODE_NOT_FOUND',
  itemNotLoanable: 'ITEM_NOT_LOANABLE',
  itemHasOpenLoan: 'ITEM_HAS_OPEN_LOAN',
  itemLimitPatronGroupMaterialTypeLoanType: 'ITEM_LIMIT_PATRON_GROUP_MATERIAL_TYPE_LOAN_TYPE',
  itemLimitPatronGroupMaterialType: 'ITEM_LIMIT_PATRON_GROUP_MATERIAL_TYPE',
  itemLimitPatronGroupLoanType: 'ITEM_LIMIT_PATRON_GROUP_LOAN_TYPE',
  itemLimitMaterialTypeLoanType: 'ITEM_LIMIT_MATERIAL_TYPE_LOAN_TYPE',
  itemLimitMaterialType: 'ITEM_LIMIT_MATERIAL_TYPE',
  itemLimitLoanType: 'ITEM_LIMIT_LOAN_TYPE',
};

export const ITEM_LIMIT_KEY = 'itemLimit';

export const ITEM_LIMIT_BACKEND_ERROR_CODES = [
  BACKEND_ERROR_CODES.itemLimitPatronGroupMaterialTypeLoanType,
  BACKEND_ERROR_CODES.itemLimitPatronGroupMaterialType,
  BACKEND_ERROR_CODES.itemLimitPatronGroupLoanType,
  BACKEND_ERROR_CODES.itemLimitMaterialTypeLoanType,
  BACKEND_ERROR_CODES.itemLimitMaterialType,
  BACKEND_ERROR_CODES.itemLimitLoanType,
];

export const OVERRIDABLE_BACKEND_ERROR_CODES = [
  BACKEND_ERROR_CODES.itemNotLoanable,
  ...ITEM_LIMIT_BACKEND_ERROR_CODES,
];

export const BACKEND_ERRORS_CODES_TO_HIDE = [
  BACKEND_ERROR_CODES.itemHasOpenLoan,
];

export const ERROR_MESSAGE_TRANSLATION_ID_BY_BACKEND_ERROR_CODE = {
  [BACKEND_ERROR_CODES.userHasNoBarcode]: 'ui-checkout.messages.userHasNoBarcode',
  [BACKEND_ERROR_CODES.itemNotLoanable]: 'ui-checkout.messages.itemIsNotLoanable',
  [BACKEND_ERROR_CODES.itemHasOpenLoan]: 'ui-checkout.messages.itemHasOpenLoan',
  [BACKEND_ERROR_CODES.itemLimitPatronGroupMaterialTypeLoanType]: 'ui-checkout.messages.itemLimitPatronGroupMaterialTypeLoanType',
  [BACKEND_ERROR_CODES.itemLimitPatronGroupMaterialType]: 'ui-checkout.messages.itemLimitPatronGroupMaterialType',
  [BACKEND_ERROR_CODES.itemLimitPatronGroupLoanType]: 'ui-checkout.messages.itemLimitPatronGroupLoanType',
  [BACKEND_ERROR_CODES.itemLimitMaterialTypeLoanType]: 'ui-checkout.messages.itemLimitMaterialTypeLoanType',
  [BACKEND_ERROR_CODES.itemLimitMaterialType]: 'ui-checkout.messages.itemLimitMaterialType',
  [BACKEND_ERROR_CODES.itemLimitLoanType]: 'ui-checkout.messages.itemLimitLoanType',
};

export const errorTypes = {
  INVALID_SCHEDULE: 1,
  INVALID_ITEM: 2,
  SCAN_FAILED: 3,
  ITEM_CHECKED_OUT: 4,
};

export const PAGE_AMOUNT = 100;
export const MAX_RECORDS = '10000';

export const INVALID_DATE_MESSAGE = 'Invalid date';

export const defaultPatronIdentifier = 'barcode';

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

export const OPEN_REQUEST_STATUSES = {
  OPEN_NOT_YET_FILLED: 'Open - Not yet filled',
  OPEN_AWAITING_PICKUP: 'Open - Awaiting pickup',
  OPEN_IN_TRANSIT: 'Open - In transit',
  OPEN_AWAITING_DELIVERY: 'Open - Awaiting delivery',
};

export const DCB_INSTANCE_ID = '9d1b77e4-f02e-4b7f-b296-3f2042ddac54';
export const DCB_HOLDINGS_RECORD_ID = '10cd3a5a-d36f-4c7a-bc4f-e1ae3cf820c9';

export const PROFILE_PICTURE_CONFIG_KEY = 'PROFILE_PICTURE_CONFIG';

export default '';

export const MODULE_NAME = 'users';
export const CUSTOM_FIELDS_ENTITY_TYPE = 'user';
