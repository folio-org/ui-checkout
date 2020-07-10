import { Response } from 'miragejs';

export default (server) => {
  server.post('circulation/check-out-by-barcode', () => {
    return new Response(422, { 'Content-Type': 'application/json' }, {
      'errors': [{
        'message': 'Item is not loanable',
        'parameters': [{
          'key': 'itemBarcode',
          'value': '123'
        }]
      }]
    });
  });
};
