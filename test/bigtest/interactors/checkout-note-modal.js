import {
  clickable,
  interactor,
  isPresent,
} from '@bigtest/interactor';

@interactor class CheckoutNoteModalInteractor {
  present = isPresent('[data-test-checkoutnotemodal-confirm-button]');
  clickConfirm = clickable('[data-test-checkoutnotemodal-confirm-button]');
  clickCancel = clickable('[data-test-checkoutnotemodal-cancel-button]');
}

export default CheckoutNoteModalInteractor;
