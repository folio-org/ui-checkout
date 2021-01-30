import {
  interactor,
  isPresent,
  collection, scoped,
} from '@bigtest/interactor';

@interactor class BlockModalInteractor {
  static defaultScope = 'body';

  modalPresent = isPresent('[data-test-block-modal]');
  modalMessage = collection('[data-test-block-message]');
  overrideButton = scoped('[data-test-override-patron-block-button]');
}

export default BlockModalInteractor;
