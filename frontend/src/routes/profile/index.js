import { Component } from 'preact';
import ons from 'onsenui';
import {Input, Page} from 'react-onsenui';

import API from '../../utils/API';
import {updateCurrentUser} from '../../utils/helpers';

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

		API.getInstance()._fetch('/users/' + this.props.currentUser._id, 'PATCH', userData)
			.then( response => {
				// Merge alten User mit neuen Daten, damit Token nicht verloren geht
				let newCurrentUser = {...this.props.currentUser, ...response.data.user};
				// Neue Daten in LocalDB sichern und an andere Components weitergeben
				updateCurrentUser(newCurrentUser);
				this.props.currentUserChanged(newCurrentUser);
				// und noch eine kleine Benachrichtigung
				ons.notification.toast({
					force: true,
					message: 'Daten erfolgreich geändert',
					timeout: 3000
				});
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
							<label>Status</label>
						</p>
						<p>
							<label>{currentUser.role}</label>
						</p>

						<p>
							<label htmlFor='firstName'>Vorname</label>
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
							<label htmlFor='familyName'>Nachname</label>
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
