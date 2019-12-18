import { Component } from 'preact';
import ons from 'onsenui';
import {Input, Page} from 'react-onsenui';

import API from '../../utils/API';

import style from './style.scss';

export default class Profile extends Component {

	constructor(props) {
		super(props);

		const { currentUser } = props;
		this.state = {
			disableSubmit: false,
			userData: {
				firstName: currentUser.firstName,
				familyName: currentUser.familyName,
			}
		};
	}

	handleInputChange(e) {
		this.setState({
			userData: {
				...this.state.userData,
				[e.target.name]: e.target.value
			}
		});
	}

	handleChangeUserData(e) {
		e.preventDefault();
		const { userData } = this.state;

		this.setState({ disableSubmit: true });

		API.getInstance()._fetch('/user', 'UPDATE', userData)
			.then( response => {
				if (this.props.onLogin) this.props.onLogin(response.data.user);
			}, ()=>{} )
			.then( () => {
				this.setState({ disableSubmit: false });
			});
	}

	render({ currentUser }, state, context) {
		return (
			<Page>
				<div className={style.profile}>
					<h1>Benutzerdaten ändern</h1>
					<form onSubmit={this.handleChangeUserData.bind(this)}>
						<p>
							<label>Personalnummer</label>
						</p>
						<p>
							<label>{currentUser.staffNumber}</label>
						</p>

						<p>
							<label htmlFor="firstName">Vorname</label>
						</p>
						<p>
							<Input
								id='firstName'
								name='firstName'
								placeholder='Bitte ausfüllen'
								value={state.userData.firstName}
								modifier='material'
								onChange={this.handleInputChange.bind(this)}
								required
							>
							</Input>
						</p>

						<p>
							<label htmlFor="familyName">Nachname</label>
						</p>
						<p>
							<Input
								id='familyName'
								name='familyName'
								placeholder='Bitte ausfüllen'
								value={state.userData.familyName}
								modifier='material'
								onChange={this.handleInputChange.bind(this)}
								required
							>
							</Input>
						</p>

						<p>
							<button className={'button' + ( !ons.platform.isIOS() ? ' button--material' : '') } type='submit' disabled={state.disableSubmit}>Daten ändern</button>
						</p>
					</form>
				</div>
			</Page>
		);
	}
}
