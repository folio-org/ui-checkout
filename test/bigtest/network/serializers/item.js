import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  include: function(request) {
    if (request.method === 'POST') {
      return ['loans'];
    } else {
      return [];
    }
  },
});
