import React from 'react';
import PropTypes from 'prop-types';
import ConfigManager from '@folio/stripes-smart-components/lib/ConfigManager';
import Select from '@folio/stripes-components/lib/Select';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import { Field } from 'redux-form';
import { patronIdentifierTypes } from '../constants';

const identifierTypeOptions = patronIdentifierTypes.map(i => (
  {
    id: i.key,
    label: i.label,
    value: i.key,
  }
));

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

  render() {
    return (
      <this.configManager label={this.props.label} moduleName="CHECKOUT" configName="pref_patron_identifier">
        <Row>
          <Col xs={12}>
            <Field
              component={Select}
              id="patronScanId"
              label="Scan ID for patron check out"
              placeholder="---"
              name="pref_patron_identifier"
              dataOptions={identifierTypeOptions}
            />
          </Col>
        </Row>
      </this.configManager>
    );
  }
}

export default ScanCheckoutSettings;
