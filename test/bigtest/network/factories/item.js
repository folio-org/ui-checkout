import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: faker.random.uuid(),
  status: () => ({ name: 'Checked out' }),
  title: () => faker.company.catchPhrase(),
  barcode: () => Math.floor(Math.random() * 9000000000000) + 1000000000000,
  instanceId: () => faker.random.uuid(),
  callNumber: () => Math.floor(Math.random() * 90000000) + 10000000,
  holdingsRecordId: () => faker.random.uuid(),
  materialType: () => ({ name: faker.random.word() }),
  location: () => ({ name: faker.random.word() }),
  numberOfMissingPieces: () => 0,
  descriptionOfPieces: () => '',
  missingPieces: () => '',
  numberOfPieces: () => 1
});
