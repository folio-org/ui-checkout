import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  status: () => ({ name: 'Checked out' }),
  title: () => faker.company.catchPhrase(),
  barcode: () => '' + Math.floor(Math.random() * 9000000000000) + 1000000000000,
  instanceId: () => faker.random.uuid(),
  callNumber: () => Math.floor(Math.random() * 90000000) + 10000000,
  holdingsRecordId: () => faker.random.uuid(),
  materialType: () => ({ name: faker.random.word() }),
  location: () => ({ name: faker.random.word() }),
  numberOfMissingPieces: () => 0,
  descriptionOfPieces: () => '',
  missingPieces: () => '',
  numberOfPieces: () => 1,

  withLoan: {
    extension: {
      afterCreate(item, server) {
        server.create('loan', {
          item
        });
      }
    },
    __isTrait__: true
  }
});
