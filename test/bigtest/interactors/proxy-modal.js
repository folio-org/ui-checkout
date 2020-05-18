import {
  clickable,
  interactor,
  isPresent,
} from '@bigtest/interactor';

@interactor class ProxyModalInteractor {
  modalPresent = isPresent('#proxy-form');
  clickAsSelf = clickable('[data-test-acting-as-self]');
  clickAsProxy = clickable('[data-test-acting-as-proxy]');

  clickContinue = clickable('#OverlayContainer [data-test-continue-button]');
  clickCancel = clickable('#OverlayContainer [data-test-cancel-button]');
}

export default ProxyModalInteractor;
