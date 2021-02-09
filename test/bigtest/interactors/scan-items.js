import {
  interactor,
  isPresent,
} from '@bigtest/interactor';

@interactor class ScanItemsInteractor {
  multipieceModalPresent = isPresent('#multipiece-modal');
  itemListPresent = isPresent('#list-items-checked-out');
}

export default ScanItemsInteractor;
