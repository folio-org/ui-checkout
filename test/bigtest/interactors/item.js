import {
  interactor,
  scoped,
} from '@bigtest/interactor';

@interactor class Item {
  title = scoped('[data-test-item-title]');
  loanPolicy = scoped('[data-test-item-loan-policy]');
  barcode = scoped('[data-test-item-barcode]');
  dueDate = scoped('[data-test-item-due-date]');
  time = scoped('[data-test-item-time]');
  actions = scoped('[data-test-item-actions]');

  whenLoaded() {
    return this.when(() => this.isPresent);
  }
}

export default Item;
