import {
  clickable,
  fillable,
  interactor,
  isPresent,
  text,
  scoped,
} from '@bigtest/interactor';

@interactor
class ScanItemsInteractor {
  multipieceModalPresent = isPresent('#multipiece-modal');
}

@interactor
class CheckoutNoteModalInteractor {
  present = isPresent('[data-test-checkoutNoteModal-confirm-button]');
  clickConfirm = clickable('[data-test-checkoutNoteModal-confirm-button]');
}

@interactor
class ErrorModal {
  static defaultScope = '[data-test-error-modal]';

  overrideButton = scoped('[data-test-override-button]');
  closeButton = scoped('[data-test-close-button]');
}

@interactor
class OverrideModal {
  static defaultScope = '[data-test-override-modal]';

  dueDatePicker = scoped('[ data-test-override-modal-due-date-picker]');
  comment = scoped('[data-test-override-modal-comment]');
  saveAndCloseButton = scoped('[data-test-override-modal-save-and-close]');
  cancelButton = scoped('[data-test-override-modal-cancel]');
}


export default interactor(class CheckOutInteractor {
  static defaultScope = '[data-test-check-out-scan]';
  scanItems = new ScanItemsInteractor('[data-test-scan-items]');
  checkoutNoteModal = new CheckoutNoteModalInteractor();
  patronIdentifierPresent = isPresent('#input-patron-identifier');
  patronEnterBtnPresent = isPresent('#clickable-find-patron');
  fillPatronBarcode = fillable('#input-patron-identifier');
  clickPatronBtn = clickable('#clickable-find-patron');

  itemBarcodePresent = isPresent('#input-item-barcode');
  fillItemBarcode = fillable('#input-item-barcode');
  clickItemBtn = clickable('#clickable-add-item');

  patronFullName = text('[data-test-check-out-patron-full-name]');
  awaitPickupModalPresent = isPresent('#awaiting-pickup-modal');

  overrideModal = new OverrideModal();
  errorModal = new ErrorModal();
});
