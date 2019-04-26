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

  this.get('/accounts', {
    'accounts' : [],
    'totalRecords' : 0,
    'resultInfo' : {
      'totalRecords' : 0,
      'facets' : [],
      'diagnostics' : []
    }
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

  this.get('/groups', {
    usergroups: [],
    totalRecords: 0
  });

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

  this.post('/circulation/check-out-by-barcode', ({ items }, request) => {
    const { itemBarcode } = JSON.parse(request.requestBody);

    return items.findBy({ barcode: itemBarcode });
  });

  this.post('/circulation/override-check-out-by-barcode', ({ items }, request) => {
    const {
      itemBarcode,
      dueDate,
      comment,
    } = JSON.parse(request.requestBody);
    const { attrs: item } = items.findBy({ barcode: itemBarcode });

    return {
      loanPolicyId,
      comment,
      dueDate,
      item,
    };
  });
}
