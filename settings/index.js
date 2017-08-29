import React from 'react';
import Settings from '@folio/stripes-components/lib/Settings';

import ScanCheckoutSettings from './ScanCheckoutSettings';

const pages = [
  {
    route: 'checkout',
    label: 'Scan ID',
    component: ScanCheckoutSettings,
  },
];

export default props => <Settings {...props} pages={pages} paneTitle="Check out" />;
