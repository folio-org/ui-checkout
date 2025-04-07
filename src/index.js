import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import CheckOut from './CheckOut';

class CheckOutRouting extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
    match: PropTypes.shape({
      path: PropTypes.string,
    }).isRequired,
  }

  constructor(props) {
    super(props);
    this.connectedApp = props.stripes.connect(CheckOut);
  }

  noMatch = () => {
    return (
      <div data-testid="noMatch">
        <h2>
          <FormattedMessage id="ui-checkout.error.oops" />
        </h2>
        <FormattedMessage
          id="ui-checkout.error.routing"
          values={{ pathname: <tt>{this.props.location.pathname}</tt> }}
        />
      </div>
    );
  };

  render() {
    const {
      match: { path },
    } = this.props;

    return (
      <Switch>
        <Route
          path={path}
          render={() => (
            <this.connectedApp {...this.props} />
          )}
        />
        <Route render={this.noMatch} />
      </Switch>
    );
  }
}

export default CheckOutRouting;
