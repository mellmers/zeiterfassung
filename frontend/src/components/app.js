import { Component, h } from 'preact';
import { Router, route } from 'preact-router';

// Code-splitting is automated for routes
import Login from '../routes/Login';
import Profile from '../routes/profile';
import Tabs from '../routes/tabs';

import LocalDB from '../utils/LocalDB';

export default class App extends Component {

	state = {
		currentUser: null
	};

	componentWillMount() {
		LocalDB.currentUser.get(0).then( user => {
			console.log(user);
			if (user && user._id && user.token) {
				this.setState({ currentUser: user });
			} else {
				route('/login', true);
			}
		});
	}

	/** Gets fired when the route changes.
	 *	@param {Object} e		'change' event from [preact-router](http://git.io/preact-router)
	 *	@param {string} e.url	The newly routed URL
	 */
	handleRoute (e) {
		console.log(e.url);
		// switch (e.url) {
		// 	case '/':
		// 		break;
		// 	default:
		// 		break;
		// }
	};

	onLogin(user) {
		console.log('on login', user);
		this.setState({ currentUser: user });

		route('/');
	}

	renderPage(route, navigator) {
		route.props = route.props || {};
		route.props.navigator = navigator;

		return h(route.comp, route.props);
	}

	render(props, state, context) {
		return (
			<div id='app'>
				<Router onChange={this.handleRoute}>
					{/*<Navigator path='/' renderPage={this.renderPage} initialRoute={{comp: Tabs, props: { key: 'tabs' }}}/>*/}
					<Tabs path='/' currentUser={state.currentUser} />
					<Login path='/login/' onLogin={this.onLogin.bind(this)} />
					<Profile path='/profile/' user='me'/>
					<Profile path='/profile/:user'/>
				</Router>
			</div>
		);
	}
}
