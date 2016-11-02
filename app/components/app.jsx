import React from 'react';
import Navbar from 'components/navbar';
import LoginActions from 'actions/login-actions';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    LoginActions.loadLocalUser();
  }
  render() {
    var navbar;
    if (this.props.location.pathname !== '/login' &&
        this.props.location.pathname !== '/projects') {
      navbar = <Navbar {...this.props}/>;
    }
    return (
      <div className="">
        {navbar}
        {this.props.children}
      </div>
    );
  }
}
