import {
  interactor,
  isPresent,
  text,
} from '@bigtest/interactor';

@interactor class BlockModalInteractor {
  static defaultScope = 'body';

  modalPresent = isPresent('[data-test-block-modal]');
  modalMessage = text('[data-test-block-message] b');

  whenBlockMessageIsLoaded() {
    return this.when(() => this.modalMessage.isPresent);
  }
}

export default BlockModalInteractor;
