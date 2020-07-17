import { RestSerializer } from 'miragejs';

export default RestSerializer.extend({
  embed: true,
  include: ['item'],

  serialize(...args) {
    const json = RestSerializer.prototype.serialize.apply(this, args);
    const { loan } = json;

    return loan;
  }
});
