import React from 'react';
import Navbar from 'components/navbar';
import LoginActions from 'actions/login-actions';

export default class App extends React.Component {

  static propTypes = { children: React.PropTypes.node }
  static contextTypes = { flux: React.PropTypes.object.isRequired }

  constructor(props) {
    super(props);
    //LoginActions.loadLocalUser();
  }
  render() {
    var navbar;
    if (this.props.location.pathname !== '/login' &&
        this.props.location.pathname !== '/projects') {
      navbar = <Navbar {...this.props}/>;
    }
    return (
      <div className="content">
        {navbar}
        {this.props.children}
      </div>
    );
  }
}
