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
    "group": "graduate",
    "desc": "Graduate Student",
    "id": "ad0bc554-d5bc-463c-85d1-5562127ae91b"
  } ] });

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

  this.get('/accounts');
  this.get('/loan-policy-storage/loan-policies');

  this.post('/circulation/check-out-by-barcode', () => {
    return {
      "id": "cf23adf0-61ba-4887-bf82-956c4aae2260",
      "userId": "df7f4993-8c14-4a0f-ab63-93975ab01c76",
      "proxyUserId": "346ad017-dac1-417d-9ed8-0ac7eeb886aa",
      "itemId": "cb20f34f-b773-462f-a091-b233cc96b9e6",
      "item": {
        "title": "The Long Way to a Small, Angry Planet",
        "barcode": "036000291452",
        "status": {
          "name": "Checked Out"
        },
        "location": {
          "name": "Main Library"
        },
        "materialType": {
          "name": "Book"
        },
        "contributors": [
          {
            "name": "Steve Jones"
          }
        ]
      },
      "loanDate": "2017-03-01T23:11:00.000Z",
      "dueDate": "2017-04-01T23:11:00.000Z",
      "checkoutServicePointId": "e9af4ba4-6801-4722-bf45-d7a49d54564d",
      "checkinServicePointId": "e9af4ba4-6801-4722-bf45-d7a49d54564d",
      "status": {
        "name": "Open"
      },
      "action": "checkedout",
      "renewalCount": 0
    }
  })
}
