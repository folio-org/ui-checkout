import { RestSerializer } from 'miragejs';

export default RestSerializer.extend({
  embed: true,

  serialize(...args) {
    return RestSerializer.prototype.serialize.apply(this, args);
  }
});
