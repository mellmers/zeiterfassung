import { Component } from 'preact';
import ons from 'onsenui';
import {Input, Select} from 'react-onsenui';

import API from './../../utils/API';

import styles from './styles.scss';

export default class EditProfile extends Component {

	constructor(props) {
		super(props);

		const { roleEditable, user } = props;
		let userData = {
			firstName: user.firstName,
			familyName: user.familyName
		};

		if (roleEditable) {
			userData.role = user.role;
		}

		this.state = {
			disableSubmit: false,
			userData: userData
		};
	}

	componentWillReceiveProps(nextProps, nextContext) {
		if (this.props.user.firstName !== nextProps.user.firstName) {
			this.setState({userData: { ...this.state.userData, firstName: nextProps.user.firstName}})
		}
		if (this.props.user.familyName !== nextProps.user.familyName) {
			this.setState({userData: { ...this.state.userData, familyName: nextProps.user.familyName}})
		}
		if (nextProps.roleEditable && this.props.user.role !== nextProps.user.role) {
			this.setState({userData: { ...this.state.userData, role: nextProps.user.role}})
		}
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

		API.getInstance()._fetch('/users/' + this.props.user._id, 'PATCH', userData)
			.then( response => {
				let message = response.message;
				if (response.status === 'success') {
					// Benachrichtigungstext
					message = 'Daten erfolgreich geändert';
					// und User an übergeordnete Komponent weitergeben
					this.props.userChanged(response.data.user);
				}
				// Eine kleine Benachrichtigung
				ons.notification.toast({
					force: true,
					message: message,
					timeout: 3000
				});
			}, ()=>{} )
			.then( () => {
				this.setState({ disableSubmit: false });
			});
	}

	render({ roleEditable, user }, state, context) {
		return (
			<div className={styles.profile}>
				<form onSubmit={this.handleChangeUserData.bind(this)}>
					<p>
						<label>Personalnummer</label>
					</p>
					<p>
						<span>{user.staffNumber}</span>
					</p>

					<p>
						<label>Status</label>
					</p>
					<p>
						{roleEditable ? (
							<Select
								id='role'
								name='role'
								value={state.userData.role}
								onChange={this.handleInputChange.bind(this)}
							>
								<option value='Mitarbeiter'>Mitarbeiter</option>
								<option value='Administrator'>Administrator</option>
								<option value='Terminal'>Terminal</option>
							</Select>
						) : <span>{user.role}</span>}
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
		);
	}
}
