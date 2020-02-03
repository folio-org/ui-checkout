import {
  clickable,
  interactor,
  isPresent,
} from '@bigtest/interactor';

@interactor class CheckoutNoteModalInteractor {
  present = isPresent('[data-test-checkoutnotemodal-confirm-button]');
  clickConfirm = clickable('[data-test-checkoutnotemodal-confirm-button]');
}

export default CheckoutNoteModalInteractor;
