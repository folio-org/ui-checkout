import {
  clickable,
  fillable,
  interactor,
  isPresent,
  isVisible,
  text,
  scoped,
  Interactor,
  property,
  collection,
} from '@bigtest/interactor';

@interactor class ScanItemsInteractor {
  multipieceModalPresent = isPresent('#multipiece-modal');
}

@interactor class MultipieceModalInteractor {
  present = isPresent('[data-test-multipiece-modal-confirm-btn]');
  clickConfirm = clickable('[data-test-multipiece-modal-confirm-btn]');
}

@interactor class CheckoutNoteModalInteractor {
  present = isPresent('[data-test-checkoutnotemodal-confirm-button]');
  clickConfirm = clickable('[data-test-checkoutnotemodal-confirm-button]');
}

@interactor class ErrorModal {
  static defaultScope = '[data-test-error-modal]';

  closeBtnIsVisible = isVisible('[data-test-close-button]');
  overrideBtnIsVisible = isVisible('[data-test-override-button]');
  clickOverrideBtn = clickable('[data-test-override-button]');
  clickCloseBtn = clickable('[data-test-close-button]');

  overrideButton = scoped('[data-test-override-button]');
  closeButton = scoped('[data-test-close-button]');
}

@interactor class OverrideModal {
  static defaultScope = '[data-test-override-modal]';

  dueDatePicker = scoped('[data-test-override-modal-due-date-picker]');
  comment = scoped('[data-test-override-modal-comment]');

  saveAndCloseBtnDisabled = property('[data-test-override-modal-save-and-close]', 'disabled');
  saveAndCloseBtnIsVisible = isVisible('[data-test-override-modal-save-and-close]');
  cancelBtnIsVisible = isVisible('[data-test-override-modal-cancel]');

  clickSaveAndCloseBtn = clickable('[data-test-override-modal-save-and-close]');
  clickCancelBtn = clickable('[data-test-override-modal-cancel]');
}

@interactor class Item {
  title = scoped('[data-test-item-title]');
  loanPolicy = scoped('[data-test-item-loan-policy]');
  barcode = scoped('[data-test-item-barcode]');
  dueDate = scoped('[data-test-item-due-date]');
  time = scoped('[data-test-item-time]');
  actions = scoped('[data-test-item-actions]');
  whenLoaded() {
    return this.when(() => this.isPresent);
  }
}

export default interactor(class CheckOutInteractor {
  static defaultScope = '[data-test-check-out-scan]';

  patronIdentifierPresent = isPresent('#input-patron-identifier');
  patronEnterBtnPresent = isPresent('#clickable-find-patron');
  checkoutNotesPresent = isPresent('[data-test-checkout-notes]');
  checkoutNotes = new Interactor('[data-test-checkout-notes]');
  clickCheckoutNotesBtn = clickable('[data-test-checkout-notes]');
  fillPatronBarcode = fillable('#input-patron-identifier');
  clickPatronBtn = clickable('#clickable-find-patron');
  selectElipse = clickable('[data-test-elipse-select] button');
  itemBarcodePresent = isPresent('#input-item-barcode');
  fillItemBarcode = fillable('#input-item-barcode');
  clickItemBtn = clickable('#clickable-add-item');

  patronFullName = text('[data-test-check-out-patron-full-name]');
  awaitPickupModalPresent = isPresent('#awaiting-pickup-modal');

  errorModal = new ErrorModal();
  overrideModal = new OverrideModal();
  checkoutNoteModal = new CheckoutNoteModalInteractor();
  multipieceModal = new MultipieceModalInteractor('#multipiece-modal');
  scanItems = new ScanItemsInteractor('[data-test-scan-items]');
  items = collection('#list-items-checked-out div[class^="mclScrollable--"] > div[class^="mclRow--"]', Item);

  whenUserIsLoaded() {
    return this.when(() => this.patronFullName.isPresent);
  }
});
