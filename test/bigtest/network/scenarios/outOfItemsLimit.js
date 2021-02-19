import { Response } from 'miragejs';
import { barcodeWithLimitLoanPolicy } from '../../constants';

export default (server) => {
  server.post('circulation/check-out-by-barcode', () => {
    return new Response(422, { 'Content-Type': 'application/json' }, {
      'errors': [{
        'message': 'Patron has reached maximum limit of 1 items for material type',
        'parameters': [{
          'key': 'itemBarcode',
          'value': barcodeWithLimitLoanPolicy
        }]
      }]
    });
  });
};
