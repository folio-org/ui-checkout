import {
  clickable,
  interactor,
  isPresent,
} from '@bigtest/interactor';

@interactor class MultipieceModalInteractor {
  present = isPresent('[data-test-multipiece-modal-confirm-btn]');
  clickConfirm = clickable('[data-test-multipiece-modal-confirm-btn]');
  clickCancel = clickable('[data-test-multipiece-modal-cancel-btn]');
}

export default MultipieceModalInteractor;
