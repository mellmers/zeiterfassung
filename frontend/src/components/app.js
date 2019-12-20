import { Component, h } from 'preact';
import { Router, route } from 'preact-router';

import AuthComponent from './requireAuthentication';

// Code-splitting is automated for routes
import Login from '../routes/Login';
import Tabs from '../routes/tabs';

import LocalDB from '../utils/LocalDB';
import {updateCurrentUser} from '../utils/helpers';

export default class App extends Component {

	state = {
		currentUser: null
	};

	componentWillMount() {
		LocalDB.currentUser.get(0).then( user => {
			if (user && user._id && user.token) {
				this.setState({ currentUser: user });
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

	updateCurrentUser(user) {
		// Merge alten User mit neuen Daten, damit Token nicht verloren geht
		let newCurrentUser = {...this.state.currentUser, ...user};
		// Neue Daten in LocalDB sichern
		updateCurrentUser(newCurrentUser);

		// und an andere Components weitergeben
		this.setState({ currentUser: newCurrentUser });
	}

	render(props, {currentUser}, context) {
		return (
			<div id='app'>
				<Router onChange={this.handleRoute}>
					<AuthComponent path='/' component={Tabs} currentUser={currentUser} currentUserChanged={this.updateCurrentUser.bind(this)} />
					<AuthComponent path='/profil' component={Tabs} currentUser={currentUser} currentUserChanged={this.updateCurrentUser.bind(this)} />
					<AuthComponent path='/mitarbeiter' component={Tabs} requiredRole='Administrator' currentUser={currentUser} currentUserChanged={this.updateCurrentUser.bind(this)} />
					<Login path='/login' onLogin={this.updateCurrentUser.bind(this)} />
				</Router>
			</div>
		);
	}
}
