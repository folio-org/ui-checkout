import {
  clickable,
  fillable,
  interactor,
  isPresent,
  text,
  scoped,
  Interactor,
  property,
  collection,
} from '@bigtest/interactor';

@interactor class ScanItemsInteractor {
  multipieceModalPresent = isPresent('#multipiece-modal');
  itemListPresent = isPresent('#list-items-checked-out');
}

@interactor class ItemMenuInteractor {
  static defaultScope = 'body';
  clickItemMenu = clickable('[data-test-item-menu] button');
  selectItemDetails = clickable('[data-test-show-item-details]');
  selectLoanDetails = clickable('[data-test-show-loan-details');
  selectLoanPolicy = clickable('[data-test-show-loan-policy]');
  changeDueDate = clickable('[data-test-date-picker]');
  changeDueDateDialogPresent = isPresent('div[class^="modalControls---"]');
  clickCloseDueDate = clickable('div[class^="modalControls---"] button[class^="iconButton---"]');
}

@interactor class BlockModalInteractor {
  static defaultScope = 'body';
  modalPresent = isPresent('[data-test-block-modal]');
}

@interactor class CheckoutNoteModalInteractor {
  present = isPresent('[data-test-checkoutnotemodal-confirm-button]');
  clickConfirm = clickable('[data-test-checkoutnotemodal-confirm-button]');
}

@interactor class ErrorModal {
  static defaultScope = '[data-test-error-modal]';

  overrideButton = scoped('[data-test-override-button]');
  closeButton = scoped('[data-test-close-button]');
}

@interactor class OverrideModal {
  static defaultScope = '[data-test-override-modal]';

  dueDatePicker = scoped('[data-test-override-modal-due-date-picker]');
  comment = scoped('[data-test-override-modal-comment]');
  saveAndCloseButton = scoped('[data-test-override-modal-save-and-close]');
  saveAndCloseButtonDisabled = property('[data-test-override-modal-save-and-close]', 'disabled');
  cancelButton = scoped('[data-test-override-modal-cancel]');
}

@interactor class Item {
  title = scoped('[data-test-item-title]');
  loanPolicy = scoped('[data-test-item-loan-policy]');
  barcode = scoped('[data-test-item-barcode]');
  dueDate = scoped('[data-test-item-due-date]');
  time = scoped('[data-test-item-time]');
  actions = scoped('[data-test-item-actions]');
}

export default interactor(class CheckOutInteractor {
  static defaultScope = '[data-test-check-out-scan]';
  scanItems = new ScanItemsInteractor('[data-test-scan-items]');
  itemMenu = new ItemMenuInteractor();
  blockModal = new BlockModalInteractor();

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
  //scanItems = new ScanItemsInteractor('[data-test-scan-items]');
  items = collection('#list-items-checked-out div[class^="mclScrollable--"] > div[class^="mclRow--"]', Item);

  checkoutItem(barcode) {
    console.log("test fn called with", barcode)
    return this
      .fillItemBarcode(barcode)
      .clickItemBtn();
  }
});
