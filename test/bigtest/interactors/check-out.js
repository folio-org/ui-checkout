import {
  clickable,
  fillable,
  interactor,
  isPresent,
  text,
} from '@bigtest/interactor';

export default interactor(class CheckOutInteractor {
  static defaultScope = '[data-test-check-out-scan]';
  patronIdentifierPresent = isPresent('#input-patron-identifier');
  patronEnterBtnPresent = isPresent('#clickable-find-patron');
  fillPatronBarcode = fillable('#input-patron-identifier');
  clickEnter = clickable('#clickable-find-patron');
  patronFullName = text('[data-test-check-out-patron-full-name]');
  awaitPickupModalPresent = isPresent('#awaiting-pickup-modal');
});
