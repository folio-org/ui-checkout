import { RestSerializer } from '@bigtest/mirage';

export default RestSerializer.extend({
  serialize(...args) {
    const json = RestSerializer.prototype.serialize.apply(this, args);
    const {
      request,
      requests,
    } = json;

    if (request) {
      return request;
    }

    return {
      requests,
      totalRecords: requests.length,
    };
  }
});
