import { RestSerializer } from '@bigtest/mirage';

export default RestSerializer.extend({
  embed: true,

  serialize(...args) {
    return RestSerializer.prototype.serialize.apply(this, args);
  }
});
