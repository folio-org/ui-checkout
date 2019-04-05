import CQLParser from './cql';

// typical mirage config export
export default function config() {
  this.get('/configurations/entries', {
    configs: []
  });

  this.get('/circulation/loans', {
    loans: [],
    totalRecords: 0,
  });

  this.get('/proxiesfor', {
    proxiesFor: [],
    totalRecords: 0,
  });

  this.get('/accounts', {
    accounts : [],
    totalRecords : 0,
    resultInfo : {
      totalRecords : 0,
      facets : [],
      diagnostics : []
    }
  });

  this.get('/manualblocks', {
    manualblocks: [],
    totalRecords: 0,
  });

  // requests
  this.get('/circulation/requests', ({ requests }, request) => {
    if (request.queryParams.query) {
      return requests.all();
    } else {
      return [];
    }
  });

  this.post('/circulation/check-out-by-barcode', ({ loans, items }, request) => {
    const params = JSON.parse(request.requestBody);
    const item = items.findBy({ barcode: params.itemBarcode });
    return item;
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

  this.get('/groups', {
    usergroups: [],
    totalRecords: 0
  });

  this.get('/groups', {
    usergroups: [],
    totalRecords: 0
  });

  this.get('/loan-policy-storage/loan-policies', {
    loanPolicies: [],
    totalRecords: 0
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
}
