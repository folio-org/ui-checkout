/* global it describe Nightmare before after  */
module.exports.test = function uiTest(uiTestCtx) {
  const { config, helpers: { login, openApp, clickApp, clickSettings, logout, circSettingsCheckoutByBarcodeAndUsername, findActiveUserBarcode }, meta: { testVersion } } = uiTestCtx;

  describe('Module test: checkout ("error-messages").', function checkout() {
    const nightmare = new Nightmare(config.nightmare);
    this.timeout(Number(config.test_timeout));

    describe('Open app > Trigger error messages > Logout', () => {
      let activeUserBarcode = null;

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
       * Clicking out to a different app and then back into checkin
       * restores checkin to its virgin state with all fields empty.
       * We need empty fields so we can accurately test the error messages
       * that appear when bad data, or out of order data, is added to different
       * fields.
       */
      it('should navigate to settings', (done) => {
        clickSettings(nightmare, done);
      });

      it('should navigate to checkout', (done) => {
        clickApp(nightmare, done, 'checkout');
      });

      it('should show error when scanning item before patron card', (done) => {
        nightmare
          .wait('#input-item-barcode')
          .click('#input-item-barcode')
          .insert('#input-item-barcode', 'item-before-patron')
          .click('#clickable-add-item')
          .wait('#section-patron span[class*="error"]')
          .evaluate(() => {
            const errorText = document.querySelector('#section-patron span[class*="error"]').innerText;
            if (!errorText.startsWith('Please fill')) {
              throw new Error('Error message not found for item entered before patron found');
            }
          })
          .then(done)
          .catch(done);
      });

      it('should navigate to settings', (done) => {
        clickSettings(nightmare, done);
      });

      it('should navigate to checkout', (done) => {
        clickApp(nightmare, done, 'checkout');
      });

      it('should show error when entering wrong patron ID', (done) => {
        nightmare
          .wait('#input-patron-identifier')
          .insert('#input-patron-identifier', 'wrong-patron-id')
          .wait('#clickable-find-patron')
          .click('#clickable-find-patron')
          .wait('#section-patron span[class*="error"]')
          .evaluate(() => {
            const errorText = document.querySelector('#section-patron span[class*="error"]').innerText;
            if (!(errorText.startsWith('User with this') && errorText.endsWith('does not exist'))) {
              throw new Error(`Error message not found for invalid user input: ${errorText}`);
            }
          })
          .then(done)
          .catch(done);
      });

      it('should configure checkout for barcode and username', (done) => {
        circSettingsCheckoutByBarcodeAndUsername(nightmare, config, done);
      });

      it('should navigate to users', (done) => {
        clickApp(nightmare, done, 'users');
      });

      it('should find an active user barcode', (done) => {
        findActiveUserBarcode(nightmare, 'faculty')
          .then(bc => {
            done();
            activeUserBarcode = bc;
          })
          .catch(done);
      });

      it('should navigate to checkout', (done) => {
        clickApp(nightmare, done, 'checkout');
      });

      it('should find existing patron', (done) => {
        nightmare
          .wait('#input-item-barcode')
          .insert('#input-item-barcode', null)
          .wait('#input-patron-identifier')
          .insert('#input-patron-identifier', activeUserBarcode)
          .wait('#clickable-find-patron')
          .click('#clickable-find-patron')
          .wait('#patron-form ~ div a > strong')
          .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_sleep, 10) : 555) // debugging
          .then(() => { done(); })
          .catch(done);
      });

      it('should show error when entering wrong item ID', (done) => {
        nightmare
          .insert('#input-item-barcode', 'wrong-item-barcode')
          .click('#clickable-add-item')
          .wait('#OverlayContainer [class^="modalContent--"]')
          .evaluate(() => {
            const errorText = document.querySelector('#OverlayContainer [class^="modalContent--"]').innerText;
            if (!errorText.startsWith('No item with barcode')) {
              throw new Error(`Error message not found for wrong item barcode: ${errorText}`);
            }
          })
          .then(done)
          .catch(done);
      });
    });
  });
};
