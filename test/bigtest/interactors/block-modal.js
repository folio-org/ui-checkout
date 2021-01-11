import {
  interactor,
  isPresent,
  collection,
} from '@bigtest/interactor';

@interactor class BlockModalInteractor {
  static defaultScope = 'body';

  modalPresent = isPresent('[data-test-block-modal]');
  modalMessage = collection('[data-test-block-message]');

  whenBlockModalLoaded() {
    return this.when(() => this.modalPresent);
  }
}

export default BlockModalInteractor;
