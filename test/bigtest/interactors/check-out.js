import {
  clickable,
  fillable,
  interactor,
  isPresent,
  text,
  Interactor,
  collection,
  count,
  value,
} from '@bigtest/interactor';

import MultiColumnListInteractor from '@folio/stripes-components/lib/MultiColumnList/tests/interactor';
import ConfirmModalInteractor from '@folio/stripes-components/lib/ConfirmationModal/tests/interactor';
import SelectItemModalInteractor from './select-item-modal';

import ScanItemsInteractor from './scan-items';
import ItemMenuInteractor from './item-menu';
import BlockModalInteractor from './block-modal';
import MultipieceModalInteractor from './multipiece-modal';
import CheckoutNoteModalInteractor from './checkout-note-modal';
import ErrorModal from './error-modal';
import OverrideModal from './override-modal';
import Item from './item';
import ProxyModalInteractor from './proxy-modal';

import { DEFAULT_TIMEOUT } from '../constants/config';

export default interactor(class CheckOutInteractor {
  static defaultScope = '[data-test-check-out-scan]';

  scanItems = new ScanItemsInteractor({ scope: '[data-test-scan-items]', timeout: DEFAULT_TIMEOUT });
  itemMenu = new ItemMenuInteractor({ timeout: DEFAULT_TIMEOUT });
  blockModal = new BlockModalInteractor({ timeout: DEFAULT_TIMEOUT });
  proxyModal = new ProxyModalInteractor({ timeout: DEFAULT_TIMEOUT });

  suspendedAccount = new Interactor({ scope: '[data-test-suspended-account]', timeout: DEFAULT_TIMEOUT });
  openRequestsCount = new Interactor({ scope: '[data-test-open-requests-count]', timeout: DEFAULT_TIMEOUT });
  patronIdentifierPresent = isPresent('#input-patron-identifier');
  patronEnterBtnPresent = isPresent('#clickable-find-patron');
  createInventoryEnterBtnPresent = isPresent('#clickable-create-inventory-records');
  checkoutNotes = new Interactor({ scope: '[data-test-checkout-notes]', timeout: DEFAULT_TIMEOUT });
  fillPatronBarcode = fillable('#input-patron-identifier');
  clickPatronBtn = clickable('#clickable-find-patron');
  selectElipse = clickable('[data-test-elipse-select] button');
  itemBarcodePresent = isPresent('#input-item-barcode');
  fillItemBarcode = fillable('#input-item-barcode');
  clickItemBtn = clickable('#clickable-add-item');
  clickFindUserBtn = clickable('#clickable-find-user');
  clickEndSessionBtn = clickable('#clickable-done-footer');
  endSessionBtnPresent = isPresent('#clickable-done-footer');

  patronFullName = text('#patron-detail [data-test-check-out-patron-full-name]');
  proxyFullName = text('#proxy-detail [data-test-check-out-patron-full-name]');
  itemBarcode = value('#input-item-barcode');

  patronFullNameIsPresent = isPresent('#patron-detail [data-test-check-out-patron-full-name]');

  errorModal = new ErrorModal({ timeout: DEFAULT_TIMEOUT });
  overrideModal = new OverrideModal({ timeout: DEFAULT_TIMEOUT });
  checkoutNoteModal = new CheckoutNoteModalInteractor({ timeout: DEFAULT_TIMEOUT });
  confirmStatusModal = new ConfirmModalInteractor({ scope: '#test-confirm-status-modal', timeout: DEFAULT_TIMEOUT });
  selectItemModal = new SelectItemModalInteractor({ timeout: DEFAULT_TIMEOUT });
  items = collection('#list-items-checked-out [class*=mclRowContainer---] [class^="mclRow---"]', Item);
  itemsCount = count('#list-items-checked-out [class*=mclRowContainer---] [class^="mclRow---"]', Item);

  patronErrorPresent = isPresent('#section-patron [class*=error---]');
  confirmStatusModalPresent = isPresent('#test-confirm-status-modal');
  patronDetailIsPresent = isPresent('#patron-detail');
  proxyDetailIsPresent = isPresent('#proxy-detail');

  checkoutItem(barcode) {
    return this
      .fillItemBarcode(barcode)
      .clickItemBtn();
  }

  multipieceModal = new MultipieceModalInteractor({ scope: '#multipiece-modal', timeout: DEFAULT_TIMEOUT });
  itemList = new MultiColumnListInteractor({ scope: '#list-items-checked-out', timeout: DEFAULT_TIMEOUT });
  itemListEmptyMessage = text('[data-test-scan-items] [class*=mclEmptyMessage---]');

  whenUserIsLoaded() {
    return this.when(() => this.patronFullNameIsPresent, 5000);
  }

  whenItemListIsPresent() {
    return this.when(() => this.itemList.itemListPresent && this.itemList.rowCount > 0);
  }

  whenProxyModalIsPresent() {
    return this.when(() => this.proxyModal.isPresent);
  }

  whenConfirmStatusModalPresent() {
    return this.when(() => this.confirmStatusModal.isPresent);
  }
});
