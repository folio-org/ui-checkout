import { Response } from 'miragejs';

export default (server) => {
  server.post('circulation/check-out-by-barcode', () => {
    return new Response(422, { 'Content-Type': 'application/json' }, {
      'errors': [{
        'message': 'Item is not loanable',
        'code': 'ITEM_NOT_LOANABLE',
        'parameters': [{
          'key': 'itemBarcode',
          'value': '123'
        }]
      }]
    });
  });
};
