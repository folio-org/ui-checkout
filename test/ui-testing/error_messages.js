/* global it describe Nightmare before after  */
module.exports.test = function uiTest(uiTestCtx) {
  const { config, helpers: { login, openApp, logout }, meta: { testVersion } } = uiTestCtx;

  describe('Module test: checkout:error_messages.', function checkout() {
    const nightmare = new Nightmare(config.nightmare);
    this.timeout(Number(config.test_timeout));

    describe('Open app > Trigger error messages > Logout', () => {
      const uselector = "#list-users div[role='listitem']:nth-of-type(4) > a > div:nth-of-type(3)";
      before((done) => {
        login(nightmare, config, done);
      });
      after((done) => {
        logout(nightmare, config, done);
      });
      it('should open app and find module version tag', (done) => {
        nightmare
          .use(openApp(nightmare, config, done, 'checkout', testVersion))
          .then(result => result);
      });
      /* Why on earth are we clicking into the settings app?!?
       * Clicking out out to a different app and then back into checkin
       * restores checkin to its virgin state with all fields empty.
       * We need empty fields so we can accurately test the error message
       * that appear when bad data, or out of order data, is added to different
       * fields.
       */
      it('should show error when scanning item before patron card', (done) => {
        nightmare
          .wait(config.select.settings)
          .click(config.select.settings)
          .wait('#clickable-checkout-module')
          .click('#clickable-checkout-module')
          .wait('#checkout-module-display')
          .wait('#input-item-barcode')
          .click('#input-item-barcode')
          .insert('#input-item-barcode', 'item-before-patron')
          .click('#clickable-add-item')
          .wait('#section-patron div[class*="Error"]')
          .evaluate(() => {
            const errorText = document.querySelector('#section-patron div[class*="Error"]').innerText;
            if (!errorText.startsWith('Please fill')) {
              throw new Error('Error message not found for item entered before patron found');
            }
          })
          .then(() => {
            done();
          })
          .catch(done);
      });
      it('should show error when entering wrong patron ID', (done) => {
        nightmare
          .wait(config.select.settings)
          .click(config.select.settings)
          .wait('#clickable-checkout-module')
          .click('#clickable-checkout-module')
          .wait('#checkout-module-display')
          .wait('#input-patron-identifier')
          .insert('#input-patron-identifier', 'wrong-patron-id')
          .wait('#clickable-find-patron')
          .click('#clickable-find-patron')
          .wait('#section-patron div[class*="Error"]')
          .evaluate(() => {
            const errorText = document.querySelector('#section-patron div[class*="Error"]').innerText;
            if (!errorText.startsWith('User')) {
              throw new Error('Error message not found for invalid user input');
            }
          })
          .then(done)
          .catch(done);
      });
      it('should set patron scan ID to "User"', (done) => {
        nightmare
          .wait(config.select.settings)
          .click(config.select.settings)
          .wait('#clickable-settings')
          .wait('a[href="/settings/circulation"]')
          .click('a[href="/settings/circulation"]')
          .wait('a[href="/settings/circulation/checkout"]')
          .click('a[href="/settings/circulation/checkout"]')
          .wait('#username-checkbox')
          .wait(1111)
          .evaluate(() => {
            const list = document.querySelectorAll('[data-checked="true"]');
            list.forEach(el => (el.click()));
          })
          .then(() => {
            nightmare
              .wait(222)
              .wait('#username-checkbox')
              .click('#username-checkbox')
              .wait('#clickable-savescanid')
              .click('#clickable-savescanid');
          })
          .then(() => { done(); })
          .catch(done);
      });
      it('should find existing patron', (done) => {
        nightmare
          .wait('#clickable-checkout-module')
          .click('#clickable-checkout-module')
          .wait('#input-item-barcode')
          .insert('#input-item-barcode', null)
          .insert('#input-patron-identifier', null)
          .click('#clickable-plugin-find-user')
          .wait('#clickable-filter-pg-faculty')
          .click('#clickable-filter-pg-faculty')
          .wait(uselector)
          .click(uselector)
          .wait('#patron-form ~ div a > strong')
          .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_sleep, 10) : 555) // debugging
          .then(() => { done(); })
          .catch(done);
      });
      it('should show error when entering wrong item ID', (done) => {
        nightmare
          .insert('#input-item-barcode', 'wrong-item-barcode')
          .click('#clickable-add-item')
          .wait('#section-item div[class*="Error"]')
          .evaluate(() => {
            const errorText = document.querySelector('#section-item div[class*="Error"]').innerText;
            if (!errorText.startsWith('No item with barcode')) {
              throw new Error('Error message not found for wrong item barcode');
            }
          })
          .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_sleep, 10) : 555) // debugging
          .then(() => { done(); })
          .catch(done);
      });
    });
  });
};
