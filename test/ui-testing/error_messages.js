module.exports.test = function(uiTestCtx) {

  const { config, helpers: { login, openApp, logout }, meta: { testVersion } } = uiTestCtx;

  describe('Module test: checkout:error_messages.', function() {
    const nightmare = new Nightmare(config.nightmare);
    this.timeout(Number(config.test_timeout));

    describe('Open app > Trigger error messages > Logout', () => {
      before( done => {
        login(nightmare, config, done);
      })
      after( done => {
        logout(nightmare, config, done);
      })
      it('should open app and find module version tag', done => {
        nightmare
        .use(openApp(nightmare, config, done, 'checkout', testVersion))
        .then(result => result )
      })
      it('should show error when scanning item before patron card', done => {
        nightmare
        .wait('#input-item-barcode')
        .wait(222)
        .click('#input-item-barcode')
        .insert('#input-item-barcode',"item-before-patron")
        .wait('#clickable-add-item')
        .click('#clickable-add-item')
        .wait('#section-patron div[class*="Error"]')
        .evaluate(function() {
          var errorText = document.querySelector('#section-patron div[class*="Error"]').innerText;
          if (!errorText.startsWith("Please fill")) {
            throw new Error("Error message not found for item entered before patron found");
          }
         })
        .then(result => {
	  done()
	})
        .catch(done)
      })
      it('should show error when entering wrong patron ID', done => {
        nightmare
        .wait('#input-patron-identifier')
        .insert('#input-patron-identifier',"wrong-patron-id")
        .click('#clickable-find-patron')
	.wait(function() {
	  var eNode = document.querySelector('#section-patron div[class*="Error"]');
	  if (eNode !== null && eNode.innerText.startsWith("User")) {
	    return true;
	  }
	  return false;
	})
        .evaluate(function() {
          var errorText =  document.querySelector('#section-patron div[class*="Error"]').innerText;
          if (!errorText.startsWith("User")) {
            throw new Error("Error message not found for invalid user input");
          }
         })
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => {
	  done();
	})
        .catch(done)
      })
      it('should set patron scan ID to "User"', done => {
        nightmare
        .wait(config.select.settings)
        .click(config.select.settings)
        .wait('#clickable-settings')
        .click('a[href="/settings/circulation"]')
        .wait('a[href="/settings/circulation/checkout"]')
        .click('a[href="/settings/circulation/checkout"]')
        .wait('#username-checkbox')
        .wait(1000)
        .evaluate(() => {
          const list = document.querySelectorAll('[data-checked="true"]');
          list.forEach(el => (el.click()));
        })
        .wait(222)
        .click('#username-checkbox')
        .wait(222)
        .then(result => { done() })
        .catch(done)
      })
      it('should find existing patron', done => {
        nightmare
        .wait('#clickable-checkout-module')
        .click('#clickable-checkout-module')
        .wait('#input-item-barcode')
        .insert('#input-item-barcode', null)
        .insert('#input-patron-identifier', null)
        .insert('#input-patron-identifier',"diku_admin")
        .click('#clickable-find-patron')
        .wait('#patron-form ~ div a > strong')
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
      it('should show error when entering wrong item ID', done => {
        nightmare
        .insert('#input-item-barcode',"wrong-item-barcode")
        .click('#clickable-add-item')
        .wait('#section-item div[class*="Error"]')
        .evaluate(function() {
          var errorText =  document.querySelector('#section-item div[class*="Error"]').innerText;
          if (!errorText.startsWith("Item")) {
            throw new Error("Error message not found for wrong item barcode");
          }
         })
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
    })
  })
}
