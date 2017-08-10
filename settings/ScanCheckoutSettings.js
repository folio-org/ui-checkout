import React, { PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import Pane from '@folio/stripes-components/lib/Pane';
import Select from '@folio/stripes-components/lib/Select';

import { patronIdentifierTypes } from '../constants';

class ScanCheckoutSettings extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    mutator: PropTypes.shape({
      userIdentifierPrefRecordId: PropTypes.shape({
        replace: PropTypes.func,
      }),
      userIdentifierPref: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    userIdentifierPrefRecordId: {},
    userIdentifierPref: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries?query=(module=SCAN and configName=pref_patron_identifier)',
      POST: {
        path: 'configurations/entries',
      },
      PUT: {
        path: 'configurations/entries/${userIdentifierPrefRecordId}',
      },
    },
  });

  constructor(props) {
    super(props);
    this.onChangeIdentifier = this.onChangeIdentifier.bind(this);
  }

  onChangeIdentifier(e) {
    const prefRecord = this.props.data.userIdentifierPref[0];
    if (prefRecord) {
      // preference has been set previously, can proceed with update here
      this.props.mutator.userIdentifierPrefRecordId.replace(prefRecord.id);
      prefRecord.value = e.target.value;
      this.props.mutator.userIdentifierPref.PUT(prefRecord);
    } else {
      // no preference exists, so create a new one
      this.props.mutator.userIdentifierPref.POST(
        {
          module: 'SCAN',
          configName: 'pref_patron_identifier',
          value: e.target.value,
        },
      );
    }
  }

  render() {
    const selectedIdentifier = this.props.data.userIdentifierPref || [];
    const value = (selectedIdentifier.length === 0) ? '' : selectedIdentifier[0].value;
    const identifierTypeOptions = patronIdentifierTypes.map(i => (
      {
        id: i.key,
        label: i.label,
        value: i.key,
      }
    ));

    return (
      <Pane defaultWidth="fill" fluidContentWidth paneTitle="Check-out">
        <Row>
          <Col xs={12}>
            <Select
              id="patronScanId"
              label="Scan ID for patron check-out"
              placeholder="---"
              value={value}
              dataOptions={identifierTypeOptions}
              onChange={this.onChangeIdentifier}
            />
          </Col>
        </Row>
      </Pane>
    );
  }

}

export default ScanCheckoutSettings;
