import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  embed: true,
  include: ['item'],

  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);
    const { loan } = json;

    return loan;
  }
});
