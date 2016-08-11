// created by @tomaash
// source: https://github.com/tomaash/react-example-filmdb/blob/master/app/components/login-new/index.js
import React from 'react';
import AltContainer from 'alt-container';

import LoginStore from 'stores/login-store';

import LoginPage from './login-page';

export default class Login extends React.Component {
	render() {
		return (
			<AltContainer
				stores={{
					LoginStore: LoginStore
				}}>
				<LoginPage/>
			</AltContainer>
		);
	}
}
