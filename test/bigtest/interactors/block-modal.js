import {
  interactor,
  isPresent,
  collection,
  scoped,
} from '@bigtest/interactor';

@interactor class BlockModalInteractor {
  static defaultScope = 'body';

  modalPresent = isPresent('[data-test-block-modal]');
  modalMessage = collection('[data-test-block-message]');
  closeButton = scoped('[data-test-close-patron-block-modal]');

  whenBlockModalLoaded() {
    return this.when(() => this.modalPresent);
  }
}

export default BlockModalInteractor;
