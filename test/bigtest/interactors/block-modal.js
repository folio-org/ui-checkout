import {
  interactor,
  isPresent,
  collection,
} from '@bigtest/interactor';

@interactor class BlockModalInteractor {
  static defaultScope = 'body';

  modalPresent = isPresent('[data-test-block-modal]');
  modalMessage = collection('[data-test-block-message]');

  whenBlockMessageIsLoaded() {
    return this.when(() => this.modalMessage.isPresent);
  }
}

export default BlockModalInteractor;
