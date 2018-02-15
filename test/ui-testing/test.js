const errorMessages = require('./error_messages.js');

module.exports.test = function uiTest(uiTestCtx) {
  errorMessages.test(uiTestCtx);
};
