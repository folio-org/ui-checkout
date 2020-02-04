import {
  interactor,
  isPresent,
} from '@bigtest/interactor';

@interactor class BlockModalInteractor {
  static defaultScope = 'body';

  modalPresent = isPresent('[data-test-block-modal]');
}

export default BlockModalInteractor;
