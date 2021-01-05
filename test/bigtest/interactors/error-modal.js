import {
  interactor,
  scoped,
  text,
} from '@bigtest/interactor';

@interactor class ErrorModal {
  static defaultScope = '[data-test-error-modal]';

  content = text('[class^="modalContent---"] p');
  overrideButton = scoped('[data-test-override-button]');
  closeButton = scoped('[data-test-close-button]');
}

export default ErrorModal;
