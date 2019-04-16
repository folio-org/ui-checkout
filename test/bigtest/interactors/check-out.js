import {
  clickable,
  fillable,
  interactor,
  isPresent,
  text,
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
}

export default interactor(class CheckOutInteractor {
  static defaultScope = '[data-test-check-out-scan]';
  scanItems = new ScanItemsInteractor('[data-test-scan-items]');
  itemMenu = new ItemMenuInteractor();

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
