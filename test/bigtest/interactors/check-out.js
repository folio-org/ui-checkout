import {
  clickable,
  fillable,
  interactor,
  isPresent,
  text,
} from '@bigtest/interactor';

@interactor class ScanItemsInteractor {
  multipieceModalPresent = isPresent('#multipiece-modal');
}

@interactor class CheckoutNoteModalInteractor {
  present = isPresent('[data-test-checkoutNoteModal-confirm-button]');
  clickConfirm = clickable('[data-test-checkoutNoteModal-confirm-button]');
}


export default interactor(class CheckOutInteractor {
  static defaultScope = '[data-test-check-out-scan]';
  scanItems = new ScanItemsInteractor('[data-test-scan-items]')
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
});
