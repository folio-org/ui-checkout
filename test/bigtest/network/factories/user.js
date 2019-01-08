import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  username: () => faker.internet.userName(),
  barcode: () => Math.floor(Math.random() * 9000000000000) + 1000000000000,
});
