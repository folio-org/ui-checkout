import React from 'react';
import PropTypes from 'prop-types';
import ConfigManager from '@folio/stripes-smart-components/lib/ConfigManager';

import { patronIdentifierTypes } from '../constants';
import ScanCheckoutForm from './ScanCheckoutForm';

class ScanCheckoutSettings extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.configManager = props.stripes.connect(ConfigManager);
  }

  // eslint-disable-next-line class-methods-use-this
  getInitialValues(settings) {
    const value = settings.length === 0 ? '' : settings[0].value;
    const values = (value) ? value.split(',') : [];
    const idents = patronIdentifierTypes.map(i => (values.indexOf(i.key) >= 0));
    return { idents };
  }

  render() {
    return (
      <this.configManager
        label={this.props.label}
        moduleName="CHECKOUT"
        configName="pref_patron_identifier"
        getInitialValues={this.getInitialValues}
        configFormComponent={ScanCheckoutForm}
      />
    );
  }
}

export default ScanCheckoutSettings;
