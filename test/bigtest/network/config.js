import CQLParser from './cql';
import {
  loanPolicyId,
  loanPolicyName,
  blockedUserId1,
  blockedUserId2,
  blockedMessage,
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

  this.get('/note-links/domain/users/type/user/id/:id', {
    notes: [],
    totalRecords: 0,
  });

  this.get('/proxiesfor', {
    proxiesFor: [],
    totalRecords: 0,
  });

  this.get('/manualblocks', {
    manualblocks: [],
    totalRecords: 0,
  });

  this.get('/automated-patron-blocks/:id', {
    automatedPatronBlocks: []
  });

  this.get(`/automated-patron-blocks/${blockedUserId1}`, {
    automatedPatronBlocks: [{
      patronBlockConditionId: 'cf7a0d5f-a327-4ca1-aa9e-dc55ec006b8a',
      blockBorrowing: true,
      blockRenewals: false,
      blockRequests: false,
      message: blockedMessage
    }]
  });

  this.get(`/automated-patron-blocks/${blockedUserId2}`, {
    automatedPatronBlocks: [{
      patronBlockConditionId: 'cf7a0d5f-a327-4ca1-aa9e-dc55ec006b8a',
      blockBorrowing: true,
      blockRenewals: false,
      blockRequests: false
    }]
  });

  this.post('/circulation/end-patron-action-session', {});

  this.get('/groups', {
    usergroups: [{
      group: 'faculty',
      desc: 'Faculty Member',
      id: 'cb5c73ae-092f-4c28-8a52-4c7396937e09',
      metadata: {
        createdDate: '2019-03-10T11:02:41.298+0000',
        createdByUserId: '1582c806-9824-51c0-abff-d98432283103',
        updatedDate: '2019-03-10T11:02:41.298+0000',
        updatedByUserId: '1582c806-9824-51c0-abff-d98432283103'
      }
    }, {
      group: 'staff',
      desc: 'Staff Member',
      id: 'e4554dc5-bd88-4076-905e-73f99ce49101',
      metadata: {
        createdDate: '2019-03-10T11:02:42.481+0000',
        createdByUserId: '1582c806-9824-51c0-abff-d98432283103',
        updatedDate: '2019-03-10T11:02:42.481+0000',
        updatedByUserId: '1582c806-9824-51c0-abff-d98432283103'
      }
    }, {
      group: 'graduate',
      desc: 'Graduate Student',
      id: '66a0affc-b060-466b-bc39-edbd0ae6221d',
      metadata: {
        createdDate: '2019-03-10T11:02:43.644+0000',
        createdByUserId: '1582c806-9824-51c0-abff-d98432283103',
        updatedDate: '2019-03-10T11:02:43.644+0000',
        updatedByUserId: '1582c806-9824-51c0-abff-d98432283103'
      }
    }, {
      group: 'undergrad',
      desc: 'Undergraduate Student',
      id: '69b07fe4-32b5-4780-83c3-e99a168f0e08',
      metadata: {
        createdDate: '2019-03-10T11:02:44.814+0000',
        createdByUserId: '1582c806-9824-51c0-abff-d98432283103',
        updatedDate: '2019-03-10T11:02:44.814+0000',
        updatedByUserId: '1582c806-9824-51c0-abff-d98432283103'
      }
    }],
    totalRecords: 4
  });

  // requests
  this.get('/circulation/requests', ({ requests }, request) => {
    if (request.queryParams.query) {
      return requests.all();
    } else {
      return {
        requests: [],
        totalRecords: 0
      };
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
    loanPolicies: [{
      id: loanPolicyId,
      name: loanPolicyName,
      description: 'An example loan policy',
      loanable: true,
      loansPolicy: {
        profileId: 'Rolling',
        period: {
          duration: 1,
          intervalId: 'Months'
        },
        closedLibraryDueDateManagementId: 'CURRENT_DUE_DATE',
        gracePeriod: {
          duration: 7,
          intervalId: 'Days'
        }
      },
      renewable: true,
      renewalsPolicy: {
        unlimited: true,
        renewFromId: 'CURRENT_DUE_DATE',
        differentPeriod: true,
        period: {
          duration: 30,
          intervalId: 'Days'
        }
      }
    }],
    totalRecords: 1
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

  this.get('/accounts', {
    accounts: [{
      id: '11111',
      remaining: 15.31,
      paymentStatus: {
        name: 'placeholder non-null string'
      }
    }],
    totalRecords: 1,
    resultInfo: {
      totalRecords: 1,
      facets: [],
      diagnostics: []
    }
  });

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
        id: item.id,
        userId: patron.id,
        itemId: item.id,
        status: {
          name: 'Open'
        },
        loanDate: '2017-03-05T18:32:31Z',
        dueDate: '2017-03-19T18:32:31.000+0000',
        action: 'checkedout',
        renewalCount: 0,
        item,
        loanPolicyId,
      }
    );
  });
}
