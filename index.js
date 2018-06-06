import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import Scan from './Scan';
import { translate } from './util';

class CheckOutRouting extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  }

  static childContextTypes = {
    history: PropTypes.object,
    translate: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.connectedApp = props.stripes.connect(Scan);
  }

  getChildContext() {
    return {
      history: this.props.history,
      translate: (message, values) =>
        translate(message, values, { namespace: 'ui-checkout' }, this.props.stripes),
    };
  }

  NoMatch() {
    return (
      <div>
        <h2>Uh-oh!</h2>
        <p>How did you get to <tt>{this.props.location.pathname}</tt>?</p>
      </div>
    );
  }

  render() {
    const { match: { path } } = this.props;
    return (
      <Switch>
        <Route
          path={`${path}`}
          render={() => <this.connectedApp {...this.props} />}
        />
        <Route component={() => { this.NoMatch(); }} />
      </Switch>
    );
  }
}

export default CheckOutRouting;
