import {
  interactor,
  isPresent,
} from '@bigtest/interactor';
import {loanPolicyWithLimitId, loanPolicyWithLimitName} from "../constants";

@interactor class ScanItemsInteractor {
  multipieceModalPresent = isPresent('#multipiece-modal');
  itemListPresent = isPresent('#list-items-checked-out');
}

export default ScanItemsInteractor;
