import React, { PropTypes } from 'react';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import Scan from './Scan';
import Settings from './settings';

class CheckOutRouting extends React.Component {

  static childContextTypes = {
    history: React.PropTypes.object,
  };

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    showSettings: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.connectedApp = props.stripes.connect(Scan);
  }

  getChildContext() {
    return { history: this.props.history };
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
    if (this.props.showSettings) {
      return <Settings {...this.props} />;
    }

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
