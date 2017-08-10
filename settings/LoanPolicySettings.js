import React from 'react';
import PropTypes from 'prop-types';

import EntrySelector from './EntrySelector';
import LoanPolicyDetail from './LoanPolicyDetail';

class LoanPolicySettings extends React.Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
    mutator: PropTypes.shape({
      loanPolicies: PropTypes.shape({
        POST: PropTypes.func,
        DELETE: PropTypes.func,
        GET: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    loanPolicies: {
      type: 'okapi',
      records: 'loanPolicies',
      path: 'loan-policy-storage/loan-policies',
    },
  });

  constructor(props) {
    super(props);

    this.createNewPolicy = this.createNewPolicy.bind(this);
  }

  createNewPolicy() {
    this.props.mutator.loanPolicies.POST({
      name: 'Untitled',
      loanable: true,
      loansPolicy: {
        profileId: '2',  // TODO: update when this is switched to a GUID
        closedLibraryDueDateManagementId: '4',  // TODO: update when this is switched to a GUID
      },
      renewable: true,
      renewalsPolicy: {
        unlimited: false,
        renewFromId: '2', // TODO: update when this is switched to a GUID
        differentPeriod: false,
      },
    });
  }

  render() {
    const policies = _.sortBy(this.props.data.loanPolicies, ['name']);

    return (
      <EntrySelector
        {...this.props}
        detailComponent={LoanPolicyDetail}
        allEntries={policies}
        entryCreator={this.createNewPolicy}
        parentMutator={this.props.mutator}
        paneTitle="Loan policies"
        addButtonTitle="Add loan policy"
      />
    );
  }

}

export default LoanPolicySettings;
