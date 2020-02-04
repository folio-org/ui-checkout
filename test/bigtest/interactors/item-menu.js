import {
  clickable,
  interactor,
  isPresent,
} from '@bigtest/interactor';

@interactor class ItemMenuInteractor {
  static defaultScope = 'body';

  clickItemMenu = clickable('[data-test-item-menu] button');
  selectItemDetails = clickable('[data-test-show-item-details]');
  selectLoanDetails = clickable('[data-test-show-loan-details');
  selectLoanPolicy = clickable('[data-test-show-loan-policy]');
  changeDueDate = clickable('[data-test-date-picker]');
  changeDueDateDialogPresent = isPresent('div[class^="modalControls---"]');
  clickCloseDueDate = clickable('div[class^="modalControls---"] button[class^="iconButton---"]');
}

export default ItemMenuInteractor;
