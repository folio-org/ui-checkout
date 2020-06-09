export default (server) => {
  const user = server.create('user', {
    id: 'user1',
    barcode: '12345',
    personal: {
      firstName: 'John',
      lastName: 'Doe',
    },
  });

  server.get(`/automated-patron-blocks/user1`, {
    automatedPatronBlocks: [{
      patronBlockConditionId: 'cf7a0d5f-a327-4ca1-aa9e-dc55ec006b8a',
      blockBorrowing: true,
      blockRenewals: false,
      blockRequests: false,
      message: 'Patron has reached maximum allowed number of items charged out'
    }]
  });
};
