import { Component } from 'preact';
import { getCurrentUrl, route, Router } from 'preact-router';
import ons from 'onsenui';

import AuthComponent from './requireAuthentication';

// Code-splitting is automated for routes
import Invitation from './../routes/invitation';
import Login from './../routes/login';
import Logout from './../routes/logout';
import NotFound from './../routes/notFound';
import Tabs from './../routes/tabs';
import Terminal from './../routes/terminal';

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

				this.checkIsTerminal(user);
			}
		});
	}

	componentDidMount() {
		// Quelle: https://whatwebcando.today/online-state.html
		window.addEventListener('online', this.handleNetworkStatusChange.bind(this));
		window.addEventListener('offline', this.handleNetworkStatusChange.bind(this));
		// Bei Aufruf der Anwendung testen, wie der Netzwerstatus ist
		this.handleNetworkStatusChange();

		// PWA Installationsaufforderung abfangen und für später speichern
		window.addEventListener('beforeinstallprompt', function (e) {
			window.deferredInstallPrompt = e;
		});
	}

	handleNetworkStatusChange() {
		// Wenn offline, dann dauerhaft eine Benachrichtigung anzeigen
		if (!navigator.onLine) {
			this.setState({
				toast: {
					message: 'Das Gerät ist seit ' + new Date().toTimeString().split(' ')[0] + ' Uhr offline.'
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
		this.checkIsTerminal();
	};

	// Wenn Benutzerrolle 'Terminal, dann leite auf /terminal weiter
	checkIsTerminal(user = this.state.currentUser) {
		if (user && user.role === 'Terminal') {
			switch (getCurrentUrl()) {
				case '/login':
				case '/logout':
					break;
				default:
					route('/terminal');
					break;
			}
		}
	}

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
			<div className={'toast' + ( !ons.platform.isIOS() ? ' toast--material' : '') } style={{ pointerEvents: 'none' }}>
				<div className={'toast__message' + ( !ons.platform.isIOS() ? ' toast--material__message' : '') }>
					{toast && toast.message ? toast.message : ''}
				</div>
			</div>
		);
	}

	render(props, {currentUser}, context) {
		return (
			<div id='app'>
				<Router onChange={this.handleRoute.bind(this)}>
					<AuthComponent path='/' component={Tabs} currentUser={currentUser} currentUserChanged={this.updateCurrentUser.bind(this)} />
					<AuthComponent path='/profil' component={Tabs} currentUser={currentUser} currentUserChanged={this.updateCurrentUser.bind(this)} />
					<AuthComponent path='/mitarbeiter' component={Tabs} requiredRole='Administrator' currentUser={currentUser} currentUserChanged={this.updateCurrentUser.bind(this)} />
					<AuthComponent path='/terminal' component={Terminal} requiredRole='Terminal' />
					<Login path='/login' onLogin={this.updateCurrentUser.bind(this)} />
					<Logout path='/logout' onLogout={this.updateCurrentUser.bind(this)} />
					<Invitation path='/user/invitation/:id' />
					<NotFound default />
				</Router>

				{this.renderToast()}

				<div id='printWrapper'/>
			</div>
		);
	}
}
