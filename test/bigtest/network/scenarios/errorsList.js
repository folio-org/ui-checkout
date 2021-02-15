import { Response } from 'miragejs';
import {
  notLoanableItemBarcode,
  notLoanablePolicyId,
  notLoanablePolicyName,
  checkoutErrorMessage,
} from '../../constants';

export default (server) => {
  server.post('circulation/check-out-by-barcode', () => {
    return new Response(422, { 'Content-Type': 'application/json' }, {
      'errors': [
        {
          'message': checkoutErrorMessage,
          'parameters': [{
            'key': 'itemBarcode',
            'value': notLoanableItemBarcode,
          }]
        },
        {
          'message': 'Item is not loanable',
          'parameters': [{
            'key': 'loanPolicyName',
            'value': notLoanablePolicyName
          }, {
            'key': 'itemBarcode',
            'value': notLoanableItemBarcode
          }, {
            'key': 'loanPolicyId',
            'value': notLoanablePolicyId
          }]
        }
      ]
    });
  });
};
