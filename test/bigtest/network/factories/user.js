import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  username: () => faker.internet.userName(),
  barcode: () => Math.floor(Math.random() * 9000000000000) + 1000000000000,
});
