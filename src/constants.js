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
  time: '11:59:00.000Z',
};

export const INVALIDE_DATE_MESSAGE = 'Invalid date';

export const defaultPatronIdentifier = 'BARCODE';

export default '';

export const OVERRIDABLE_ERROR_MESSAGES = ['Item is not loanable'];
