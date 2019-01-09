import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  userId: () => faker.random.uuid(),
  itemId: () => faker.random.uuid(),
  status: () => ({ name: 'Open' }),
  loanDate: () => faker.date.recent().toISOString(),
  dueDate: () => faker.date.recent().toISOString(),
  action: () => 'checkout',
  loanPolicyId: () => faker.random.uuid(),
});
