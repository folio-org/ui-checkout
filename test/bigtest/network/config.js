import CQLParser from './cql';

// typical mirage config export
export default function config() {
  this.get('/configurations/entries', {
    configs: []
  });

  this.get('/circulation/loans');

  this.get('/proxiesfor', {
    proxiesFor: [],
    totalRecords: 0,
  });

  this.get('/manualblocks', {
    manualblocks: [],
    totalRecords: 0,
  });

  this.get('/groups', { 'usergroups': [{
    'group': 'graduate',
    'desc': 'Graduate Student',
    'id': 'ad0bc554-d5bc-463c-85d1-5562127ae91b'
  }] });

  // requests
  this.get('/circulation/requests', ({ requests }, request) => {
    if (request.queryParams.query) {
      return requests.all();
    } else {
      return [];
    }
  });

  // users
  this.get('/users', ({ users }, request) => {
    if (request.queryParams.query) {
      const cqlParser = new CQLParser();
      cqlParser.parse(request.queryParams.query);
      return users.where({
        barcode: cqlParser.tree.term
      });
    } else {
      return [];
    }
  });

  this.get('/inventory/items', ({ items }, request) => {
    if (request.queryParams.query) {
      const cqlParser = new CQLParser();
      cqlParser.parse(request.queryParams.query);
      return items.where({
        barcode: cqlParser.tree.term
      });
    } else {
      return [];
    }
  });

  this.get('/inventory/instances', ({ instances }, request) => {
    if (request.queryParams.query) {
      const cqlParser = new CQLParser();
      cqlParser.parse(request.queryParams.query);
      return instances.where({
        barcode: cqlParser.tree.term
      });
    } else {
      return [];
    }
  });

  this.get('/accounts');
  this.get('/alternative-title-types');
  this.get('/loan-policy-storage/loan-policies');
  this.get('/classification-types');
  this.get('/contributor-types');
  this.get('/contributor-name-types');
  this.get('/statistical-codes');
  this.get('/statistical-code-types');
  this.get('/instance-formats');
  this.get('/instance-types');
  this.get('/instance-relationship-types');
  this.get('/instance-statuses');
  this.get('/locations');


  this.post('/circulation/check-out-by-barcode', (schema, request) => {
    const parsedRequest = JSON.parse(request.requestBody);
    const patron = schema.users.findBy({ barcode: parsedRequest.userBarcode });
    const item = schema.items.findBy({ barcode: parsedRequest.itemBarcode });
    return (
      {
        'id': '1',
        'userId': patron.id,
        'itemId': item.id,
        'status': {
          'name': 'Open'
        },
        'loanDate': '2017-03-05T18:32:31Z',
        'dueDate': '2017-03-19T18:32:31.000+0000',
        'action': 'checkedout',
        'renewalCount': 0,
        item,
        'loanPolicyId': 'policy1',
      }
    );
  });
}
