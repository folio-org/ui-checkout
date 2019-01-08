import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  requestType: () => 'Hold',
  requestDate: () => faker.date.recent().toISOString(),
  requesterId: () => faker.random.uuid(),
  itemId: () => faker.random.uuid(),
  status: () => 'Closed - Pickup expired',
  position: () => 1
});
