import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  type: 'Manual',
  desc: 'test',
  staffInformation: 'info',
  patronMessage: 'you have a block',
  expirationDate: () => faker.date.future().toISOString(),
  borrowing: true,
  renewals: true,
  requests: true,
  userId: () => faker.random.uuid(),
});
