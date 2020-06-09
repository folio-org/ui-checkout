import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  patronBlockConditionId: () => faker.random.uuid(),
  blockBorrowing: () => faker.random.boolean(),
  blockRenewals: () => faker.random.boolean(),
  blockRequests: () => faker.random.boolean(),
  message: () => faker.lorem.text(),
});
