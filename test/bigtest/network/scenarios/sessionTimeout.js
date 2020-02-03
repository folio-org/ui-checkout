export default (server) => {
  server.get('/configurations/entries', {
    'configs': [
      {
        'id': 'c95381cd-d35c-4d31-a363-11cd3bcd01ac',
        'module': 'CHECKOUT',
        'configName': 'other_settings',
        'enabled': true,
        'value': '{"checkoutTimeout":true,"checkoutTimeoutDuration":"0.1"}',
      }
    ],
    'totalRecords': 1,
    'resultInfo': {
      'totalRecords': 1,
      'facets': [
      ],
      'diagnostics': [
      ]
    }
  });
};
