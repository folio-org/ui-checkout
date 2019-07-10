import CQLParser from './cql';
import {
  loanPolicyId,
  loanPolicyName,
} from '../constants';

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

  this.get('/accounts', {
    accounts : [],
    totalRecords : 0,
    resultInfo : {
      totalRecords : 0,
      facets : [],
      diagnostics : []
    }
  });

  // this.get('/manualblocks', {
  //   manualblocks: [],
  //   totalRecords: 0,
  // });

  this.del('/manualblocks/:id');

  this.get('/manualblocks',
    { 'manualblocks': [
      { 'type': 'Manual',
        'desc': 'Invalid email and mailing addresses.',
        'staffInformation': 'Last 3 have bounced back and the letter we sent was returned to us.',
        'patronMessage': 'Please contact the Main Library to update your contact information.',
        'expirationDate': '2018-10-23T00:00:00Z',
        'borrowing': true,
        'renewals': true,
        'requests': true,
        'metadata': {
          'createdDate': '2018-10-16T23:07:02Z',
          'createdByUserId': '1ad737b0-d847-11e6-bf26-cec0c932ce02',
          'createdByUsername': 'Doe',
          'updatedDate': '2018-10-16T23:07:02Z',
          'updatedByUserId': '695540df-cf63-4c67-91c1-d8746920d1dd',
          'updatedByUsername': 'robertjones'
        },
        'userId': '123456',
        'id': '46399627-08a9-414f-b91c-a8a7ec850d03' }
    ],
    'totalRecords': 1 });

  this.get('/groups', {
    'usergroups' : [{
      'group' : 'faculty',
      'desc' : 'Faculty Member',
      'id' : 'cb5c73ae-092f-4c28-8a52-4c7396937e09',
      'metadata' : {
        'createdDate' : '2019-03-10T11:02:41.298+0000',
        'createdByUserId' : '1582c806-9824-51c0-abff-d98432283103',
        'updatedDate' : '2019-03-10T11:02:41.298+0000',
        'updatedByUserId' : '1582c806-9824-51c0-abff-d98432283103'
      }
    }, {
      'group' : 'staff',
      'desc' : 'Staff Member',
      'id' : 'e4554dc5-bd88-4076-905e-73f99ce49101',
      'metadata' : {
        'createdDate' : '2019-03-10T11:02:42.481+0000',
        'createdByUserId' : '1582c806-9824-51c0-abff-d98432283103',
        'updatedDate' : '2019-03-10T11:02:42.481+0000',
        'updatedByUserId' : '1582c806-9824-51c0-abff-d98432283103'
      }
    }, {
      'group' : 'graduate',
      'desc' : 'Graduate Student',
      'id' : '66a0affc-b060-466b-bc39-edbd0ae6221d',
      'metadata' : {
        'createdDate' : '2019-03-10T11:02:43.644+0000',
        'createdByUserId' : '1582c806-9824-51c0-abff-d98432283103',
        'updatedDate' : '2019-03-10T11:02:43.644+0000',
        'updatedByUserId' : '1582c806-9824-51c0-abff-d98432283103'
      }
    }, {
      'group' : 'undergrad',
      'desc' : 'Undergraduate Student',
      'id' : '69b07fe4-32b5-4780-83c3-e99a168f0e08',
      'metadata' : {
        'createdDate' : '2019-03-10T11:02:44.814+0000',
        'createdByUserId' : '1582c806-9824-51c0-abff-d98432283103',
        'updatedDate' : '2019-03-10T11:02:44.814+0000',
        'updatedByUserId' : '1582c806-9824-51c0-abff-d98432283103'
      }
    }],
    'totalRecords' : 4
  });

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

  this.get('/users/:id', (schema, request) => schema.users.find(request.params.id));

  this.get('/groups', {
    usergroups: [],
    totalRecords: 0
  });

  this.get('/loan-policy-storage/loan-policies', {
    'loanPolicies' : [{
      'id' : loanPolicyId,
      'name' : loanPolicyName,
      'description' : 'An example loan policy',
      'loanable' : true,
      'loansPolicy' : {
        'profileId' : 'Rolling',
        'period' : {
          'duration' : 1,
          'intervalId' : 'Months'
        },
        'closedLibraryDueDateManagementId' : 'CURRENT_DUE_DATE',
        'gracePeriod' : {
          'duration' : 7,
          'intervalId' : 'Days'
        }
      },
      'renewable' : true,
      'renewalsPolicy' : {
        'unlimited' : true,
        'renewFromId' : 'CURRENT_DUE_DATE',
        'differentPeriod' : true,
        'period' : {
          'duration' : 30,
          'intervalId' : 'Days'
        }
      }
    }],
    'totalRecords' : 1
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
  this.get('/classification-types');
  this.get('/contributor-types');
  this.get('/contributor-name-types');
  this.get('/electronic-access-relationships');
  this.get('/modes-of-issuance');
  this.get('/statistical-codes');
  this.get('/statistical-code-types', {
    statisticalCodeTypes: [],
    totalRecords: 0,
  });
  this.get('/identifier-types', {
    identifierTypes: [],
    totalRecords: 0,
  });
  this.get('/instance-formats', {
    instanceFormats: [],
    totalRecords: 0,
  });
  this.get('/instance-types', {
    instanceTypes: [],
    totalRecords: 0,
  });
  this.get('/instance-relationship-types', {
    instanceRelationshipTypes: [],
    totalRecords: 0,
  });
  this.get('/instance-statuses', {
    instanceStatuses: [],
    totalRecords: 0,
  });
  this.get('/locations');

  this.post('/circulation/check-out-by-barcode', (schema, request) => {
    const parsedRequest = JSON.parse(request.requestBody);
    const patron = schema.users.findBy({ barcode: parsedRequest.userBarcode });
    const item = schema.items.findBy({ barcode: parsedRequest.itemBarcode });
    return (
      {
        'id': item.id,
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
        'loanPolicyId': loanPolicyId,
      }
    );
  });

  this.post('/circulation/override-check-out-by-barcode', (schema, request) => {
    const parsedRequest = JSON.parse(request.requestBody);
    const patron = schema.users.findBy({ barcode: parsedRequest.userBarcode });
    const item = schema.items.findBy({ barcode: parsedRequest.itemBarcode });
    return (
      {
        'id': item.id,
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
        'loanPolicyId': loanPolicyId,
      }
    );
  });

  // this.post('/circulation/check-out-by-barcode', ({ items }, request) => {
  //   const { itemBarcode } = JSON.parse(request.requestBody);

  //   return items.findBy({ barcode: itemBarcode });
  // });

  // this.post('/circulation/override-check-out-by-barcode', ({ items }, request) => {
  //   const {
  //     itemBarcode,
  //     dueDate,
  //     comment,
  //   } = JSON.parse(request.requestBody);
  //   const { attrs: item } = items.findBy({ barcode: itemBarcode });

  //   return {
  //     loanPolicyId,
  //     comment,
  //     dueDate,
  //     item,
  //   };
  // });
}
