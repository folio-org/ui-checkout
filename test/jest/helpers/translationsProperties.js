import stripesComponentsTranslations from '@folio/stripes-components/translations/stripes-components/en';
import stripesCoreTranslations from '@folio/stripes-core/translations/stripes-core/en';

import translations from '../../../translations/ui-checkout/en';

const translationsProperties = [
  {
    prefix: 'ui-checkout',
    translations,
  },
  {
    prefix: 'stripes-components',
    translations: stripesComponentsTranslations,
  },
  {
    prefix: 'stripes-core',
    translations: stripesCoreTranslations,
  }
];

export default translationsProperties;
