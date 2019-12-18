import { Component, h } from 'preact';
import { Router, route } from 'preact-router';

// Code-splitting is automated for routes
import Login from '../routes/Login';
import Tabs from '../routes/tabs';

import LocalDB from '../utils/LocalDB';

export default class App extends Component {

	state = {
		currentUser: null
	};

	componentWillMount() {
		LocalDB.currentUser.get(0).then( user => {
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
		// console.log(e.url);
		// switch (e.url) {
		// 	case '/':
		// 		break;
		// 	default:
		// 		break;
		// }
	};

	onLogin(user) {
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
					<Tabs path='/' currentUser={state.currentUser} />
					<Tabs path='/profil/' currentUser={state.currentUser} />
					<Tabs path='/mitarbeiter/' currentUser={state.currentUser} />
					<Login path='/login/' onLogin={this.onLogin.bind(this)} />
				</Router>
			</div>
		);
	}
}
