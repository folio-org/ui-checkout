import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  embed: true,

  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);
    return json;
  }
});
