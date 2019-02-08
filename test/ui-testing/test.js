const errorMessages = require('./error-messages.js');

module.exports.test = function uiTest(uiTestCtx) {
  errorMessages.test(uiTestCtx);
};
