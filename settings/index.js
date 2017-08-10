import React from 'react';
import Settings from '@folio/stripes-components/lib/Settings';

import ScanCheckoutSettings from './ScanCheckoutSettings';
import LoanPolicySettings from './LoanPolicySettings';

const pages = [
  {
    route: 'checkout',
    label: 'Check-out',
    component: ScanCheckoutSettings,
  },
  {
    route: 'loan-policies',
    label: 'Loan policies',
    component: LoanPolicySettings,
  },
];

export default props => <Settings {...props} pages={pages} paneTitle="Scan" />;
