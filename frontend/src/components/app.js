import { Component } from 'preact';
import { Router } from 'preact-router';
import ons from 'onsenui';

import AuthComponent from './requireAuthentication';

// Code-splitting is automated for routes
import Login from './../routes/login';
import Tabs from './../routes/tabs';

import LocalDB from './../utils/LocalDB';
import {updateCurrentUser} from './../utils/helpers';

export default class App extends Component {

	state = {
		currentUser: null,
		toast: null
	};

	componentWillMount() {
		LocalDB.currentUser.get(0).then( user => {
			if (user && user._id && user.token) {
				this.setState({ currentUser: user });
			}
		});
	}

	componentDidMount() {
		// Quelle: https://whatwebcando.today/online-state.html
		window.addEventListener('online', this.handleNetworkStatusChange.bind(this));
		window.addEventListener('offline', this.handleNetworkStatusChange.bind(this));
	}

	handleNetworkStatusChange() {
		// Wenn offline, dann dauerhaft eine Benachrichtigung anzeigen
		if (!navigator.onLine) {
			this.setState({
				toast: {
					message: 'Du bist seit ' + new Date().toTimeString().split(' ')[0] + ' Uhr offline.'
				}
			});
		} else {
			this.setState({ toast: null });
		}
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

	renderToast() {
		const { toast } = this.state;

		if (toast === null) return;

		return (
			<div className={'toast' + ( !ons.platform.isIOS() ? ' toast--material' : '') }>
				<div className={'toast__message' + ( !ons.platform.isIOS() ? ' toast--material__message' : '') }>
					{toast && toast.message ? toast.message : ''}
				</div>
			</div>
		);
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

				{this.renderToast()}

				<div id='printWrapper'/>
			</div>
		);
	}
}
