import {
  clickable,
  interactor,
  isPresent,
} from '@bigtest/interactor';

@interactor class MultipieceModalInteractor {
  present = isPresent('[data-test-multipiece-modal-confirm-btn]');
  clickConfirm = clickable('[data-test-multipiece-modal-confirm-btn]');
}

export default MultipieceModalInteractor;
