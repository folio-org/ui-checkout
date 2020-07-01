import {
  clickable,
  interactor,
  isPresent,
} from '@bigtest/interactor';

@interactor class ProxyModalInteractor {
  modalPresent = isPresent('#proxy-form');
  clickAsSelf = clickable('[for="sponsor-1"]');
  clickAsProxy = clickable('[for="proxy-2"]');

  clickContinue = clickable('#proxy-form button[type="submit"]');
  clickCancel = clickable('#proxy-form button:first-of-type');
}

export default ProxyModalInteractor;
