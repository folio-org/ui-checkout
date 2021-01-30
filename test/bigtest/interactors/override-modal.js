import {
  interactor,
  property,
  scoped,
} from '@bigtest/interactor';

@interactor class OverrideModal {
  static defaultScope = '[data-test-override-modal]';

  dueDatePicker = scoped('[data-test-override-modal-due-date-picker]');
  comment = scoped('[data-test-override-modal-comment]');
  commentTextarea = scoped('[data-test-override-modal-comment] textarea');
  saveAndCloseButton = scoped('[data-test-override-modal-save-and-close]');
  saveAndCloseButtonDisabled = property('[data-test-override-modal-save-and-close]', 'disabled');
  cancelButton = scoped('[data-test-override-modal-cancel]');
  label = scoped('h1');
}

export default OverrideModal;
