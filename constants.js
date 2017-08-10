export const patronIdentifierTypes = [
  { key: 'BARCODE', label: 'Barcode', queryKey: 'barcode' },
  { key: 'EXTERNAL', label: 'External System ID', queryKey: 'externalSystemId' },
  { key: 'FOLIO', label: 'FOLIO Record Number', queryKey: 'id' },
  { key: 'USER', label: 'Username', queryKey: 'username' },
];

export const defaultPatronIdentifier = { key: 'BARCODE', label: 'Barcode', queryKey: 'barcode' };

// These next sets are temporary Select list options for LoanPolicyDetail.js
// The idea is to eventually replace them with small, controlled vocabularies
// on the server side.
export const loanProfileTypes = [
  { label: 'Fixed', id: 1, value: 1 },
  { label: 'Rolling', id: 2, value: 2 },
  { label: 'Indefinite', id: 3, value: 3 },
];

export const intervalPeriods = [
  { label: 'Minutes', id: 1, value: 1 },
  { label: 'Hours', id: 2, value: 2 },
  { label: 'Days', id: 3, value: 3 },
  { label: 'Weeks', id: 4, value: 4 },
  { label: 'Months', id: 5, value: 5 },
];

export const dueDateManagementOptions = [
  { label: 'Keep the current due date', id: 1, value: 1 },
  { label: 'Move to the end of the previous open day', id: 2, value: 2 },
  { label: 'Move to the beginning of the next open day', id: 3, value: 3 },
  { label: 'Move to the end of the next open day', id: 4, value: 4 },
];

export const renewFromOptions = [
  { label: 'Current due date', id: 1, value: 1 },
  { label: 'System date', id: 2, value: 2 },
];

export default '';
