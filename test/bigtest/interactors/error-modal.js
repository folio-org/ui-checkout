import {
  interactor,
  scoped,
} from '@bigtest/interactor';

@interactor class ErrorModal {
  static defaultScope = '[data-test-error-modal]';

  overrideButton = scoped('[data-test-override-button]');
  closeButton = scoped('[data-test-close-button]');
}

export default ErrorModal;
