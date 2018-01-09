import React from 'react';
import PropTypes from 'prop-types';
import Callout from '@folio/stripes-components/lib/Callout';
import CheckoutForm from './CheckoutForm';

class ScanCheckoutSettings extends React.Component {
  static propTypes = {
    resources: PropTypes.object.isRequired,
    label: PropTypes.string,
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
      path: 'configurations/entries?query=(module=CHECKOUT and configName=pref_patron_identifier)',
      POST: {
        path: 'configurations/entries',
      },
      PUT: {
        path: 'configurations/entries/%{userIdentifierPrefRecordId}',
      },
    },
  });

  constructor(props) {
    super(props);
    this.save = this.save.bind(this);
  }

  save(data) {
    const prefRecord = this.props.resources.userIdentifierPref.records[0];
    const value = data.identifier;

    if (prefRecord) {
      if (prefRecord.metadata) delete prefRecord.metadata;
      // preference has been set previously, can proceed with update here
      this.props.mutator.userIdentifierPrefRecordId.replace(prefRecord.id);
      prefRecord.value = value;
      this.props.mutator.userIdentifierPref.PUT(prefRecord);
    } else {
      // no preference exists, so create a new one
      this.props.mutator.userIdentifierPref.POST(
        {
          module: 'CHECKOUT',
          configName: 'pref_patron_identifier',
          value,
        },
      );
    }

    this.callout.sendCallout({ message: 'Setting was successfully updated.' });
  }

  render() {
    const userIdentifierPref = this.props.resources.userIdentifierPref || {};
    const selectedIdentifier = userIdentifierPref.records || [];
    const identifier = (selectedIdentifier.length === 0 ? '' : selectedIdentifier[0].value);

    return (
      <div style={{ width: '100%' }}>
        <CheckoutForm
          label={this.props.label}
          onSubmit={this.save}
          initialValues={{ identifier }}
        />
        <Callout ref={ref => (this.callout = ref)} />
      </div>
    );
  }

}

export default ScanCheckoutSettings;
