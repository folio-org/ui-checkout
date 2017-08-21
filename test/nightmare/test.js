module.exports.test = function(stripesnightmare) {

  describe('Check-out, error messages', function() {
    // Recommended: 5s locally, 10s to remote server, 30s from airplane
    this.timeout('30s')
    const { nightmare, config, utils: { names, auth } } = stripesnightmare;

    describe('Login > Open module "Check Out" > Logout', () => {
      before( done => {
        auth.login(nightmare,config,done);
      })
      it('should open module "Check Out"', done => {
        nightmare
        .wait('#clickable-checkout-module')
        .click('#clickable-checkout-module')
        .then(function(result) {
          done()
        })
        .catch(done)
      })
      it('should show error when scanning item before patron card', done => {
        nightmare
        .wait('#input-item-barcode')
        .insert('#input-item-barcode',"item-before-patron")
        .wait('#clickable-add-item')
        .click('#clickable-add-item')
        .wait('div[class^="textfieldError"]')
        .evaluate(function() {
          var patronInput = document.querySelector('#patron-input');
          var errorText =  patronInput.querySelector('div[class^="textfieldError"]').innerText;
          if (!errorText.startsWith("Please fill")) {
            throw new Error("Error message not found for item entered before patron found");
          }
         })
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
      it('should show error when entering wrong patron ID', done => {
        nightmare
        .wait('#input-patron-identifier')
        .insert('#input-patron-identifier',"wrong-patron-id")
        .click('#clickable-find-patron')
        .wait('div[class^="textfieldError"]')
        .evaluate(function() {
          var patronInput = document.querySelector('#patron-input');
          var errorText =  patronInput.querySelector('div[class^="textfieldError"]').innerText;
          if (!errorText.startsWith("User")) {
            throw new Error("Error message not found for invalid user input");
          }
         })
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
      it('should set patron scan ID to "User"', done => {
        nightmare
        .wait(config.select.settings)
        .click(config.select.settings)
        .wait('a[href="/settings/checkout"]')
        .click('a[href="/settings/checkout"]')
        .wait(2222)
        .wait('a[href="/settings/checkout/checkout"]')
        .click('a[href="/settings/checkout/checkout"]')
        .wait('#patronScanId')
        .wait(222)
        .select('#patronScanId','USER')
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
        .wait('#list-patrons')
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
      it('should show error when entering wrong item ID', done => {
        nightmare
        .insert('#input-item-barcode',"wrong-item-barcode")
        .click('#clickable-add-item')
        .wait('div[class^="textfieldError"]')
        .evaluate(function() {
          var itemInput = document.querySelector('#item-input');
          var errorText =  itemInput.querySelector('div[class^="textfieldError"]').innerText;
          if (!errorText.startsWith("Item")) {
            throw new Error("Error message not found for wrong item barcode");
          }
         })
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
      it('should log out', done => {
          auth.logout(nightmare,config,done);
      })
    })
  })
}
