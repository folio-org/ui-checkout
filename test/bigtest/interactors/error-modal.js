import {
  collection,
  interactor,
  scoped,
  text,
} from '@bigtest/interactor';

@interactor class ErrorModal {
  static defaultScope = '[data-test-error-modal]';

  content = text('[class^="modalContent---"] p:first-child');
  overrideButton = scoped('[data-test-override-button]');
  closeButton = scoped('[data-test-close-button]');
  errorsList = scoped('[data-test-error-item]');
  errorsListCollection = collection('[data-test-error-item]');
}

export default ErrorModal;
