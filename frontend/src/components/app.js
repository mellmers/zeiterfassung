import { Component, h } from 'preact';
import { Router, route } from 'preact-router';
import { List, ListItem, Navigator, Page, Splitter, SplitterContent, SplitterSide, Tab, Tabbar } from 'react-onsenui';

// Code-splitting is automated for routes
import Home from '../routes/home';
import Login from '../routes/Login';
import Profile from '../routes/profile';

class Tabs extends Component {

	state = {
		index: 0
	};

	componentWillMount() {
		// TODO: Change on specific route
		// setTimeout( () => {
		// 	this.setState({index:1})
		// }, 1000);
	}

	renderTabs() {
		return [
			{
				content: <Home key='home' navigator={this.props.navigator} />,
				tab: <Tab key='home' label='Home' icon='md-home' />
			},
			{
				content: <Profile key='me' navigator={this.props.navigator} user='me' />,
				tab: <Tab key='me' label='Mein Profil' icon='md-home' />
			},
			{
				content: <Profile key='profile' navigator={this.props.navigator} />,
				tab: <Tab key='profile' label='Profil' icon='md-home' />
			},
		];
	}

	render(props, state, context) {
		return (
			<Page>
				<Tabbar
					index={state.index}
					onPreChange={({index}) => this.setState(index)}
					position='bottom'
					renderTabs={this.renderTabs.bind(this)}
					swipeable={true}
				/>
			</Page>
		);
	}
}

export default class App extends Component {

	/** Gets fired when the route changes.
	 *	@param {Object} e		'change' event from [preact-router](http://git.io/preact-router)
	 *	@param {string} e.url	The newly routed URL
	 */
	handleRoute = e => {
		switch (e.url) {
			case '/':
				// TODO: currentUser
				if (this.props.currentUser === null) {
					route('/login', true);
				}
				break;
			default:
				break;
		}
	};

	renderPage(route, navigator) {
		route.props = route.props || {};
		route.props.navigator = navigator;

		return h(route.comp, route.props);
	}

	render(props, state, context) {
		return (
			<div id='app'>
				<Router onChange={this.handleRoute}>
					<Navigator path='/' renderPage={this.renderPage} initialRoute={{comp: Tabs, props: { key: 'tabs' }}}/>
					<Login path='/login/'/>
					<Profile path='/profile/' user='me'/>
					<Profile path='/profile/:user'/>
				</Router>
			</div>
		);
	}
}
