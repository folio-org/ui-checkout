import CQLParser from '../cql';

export default function proxies(server) {
  server.post('/circulation/check-out-by-barcode', ({ loans, items }, request) => {
    const params = JSON.parse(request.requestBody);
    const item = items.findBy({ barcode: params.itemBarcode });

    return loans.findBy({ itemId: item.id });
  });

  server.create('user', {
    barcode: 'deadbeef',
    personal: {
      firstName: 'The',
      lastName: 'Patron'
    }
  });
  server.create('user', {
    barcode: 'c0ffee',
    personal: {
      firstName: 'The',
      lastName: 'Sponsor'
    }
  });

  server.get('users', ({ users }, request) => {
    let user = {};
    const url = new URL(request.url);
    const cqlQuery = url.searchParams.get('query');

    if (cqlQuery != null) {
      const cqlParser = new CQLParser();
      cqlParser.parse(cqlQuery);
      if (cqlParser.tree.term) {
        user = users.where({ barcode: cqlParser.tree.term });
      }
    }

    return user;
  });

  server.get('/proxiesfor', {
    'proxiesFor' : [{
      'userId' : 'c0ffee',
      'proxyUserId' : 'deadbeef',
      'id' : '0ccf4867-a5bd-4ffd-89eb-f080a82ff864',
      'requestForSponsor' : 'Yes',
      'notificationsTo' : 'Sponsor',
      'accrueTo' : 'Sponsor',
      'status' : 'Active',
      'metadata' : {
        'createdDate' : '2020-05-17T11:13:05.788+0000',
        'createdByUserId' : '1477c52a-fa25-56b4-92bd-b6dfde924695',
        'updatedDate' : '2020-05-17T11:13:05.788+0000',
        'updatedByUserId' : '1477c52a-fa25-56b4-92bd-b6dfde924695'
      }
    }],
    'totalRecords' : 1
  });
}
