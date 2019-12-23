import {Component} from 'preact';
import {BackButton, Input, Page, Select, Toolbar} from 'react-onsenui';
import ons from 'onsenui';

import API from './../../utils/API';

import styles from './styles.scss';

export default class AddStaff extends Component {

    state = {
        disableSubmit: false,
        userData: {
            firstName: '',
            familyName: '',
            pinCode: '',
            role: 'Mitarbeiter'
        }
    };

    handleInputChange(e) {
        this.setState({
            userData: {
                ...this.state.userData,
                [e.target.name]: e.target.value
            }
        });
    }

    createStaff(e) {
        e.preventDefault();
        const { userData } = this.state;

        this.setState({ disableSubmit: true });

        API.getInstance()._fetch('/users/create', 'POST', userData)
            .then( response => {

                ons.notification.toast({
                    buttonLabel: 'Ok',
                    force: true,
                    message: 'Mitarbeiter wurde erfolgreich mit der Personalnummer ' + response.data.user.staffNumber + ' hinzugefügt',
                    timeout: 5000
                });

                this.props.navigator.popPage();

                this.props.onStaffAdded();
            }, ()=>{} )
            .then( () => {
                this.setState({ disableSubmit: false });
            });
    }

    render(props, state, context) {
        return (
            <Page>
                <Toolbar>
                    <div className='left'>
                        <BackButton>
                            Zurück
                        </BackButton>
                    </div>
                    <div className='center'>
                        Mitarbeiter hinzufügen
                    </div>
                </Toolbar>
                <div className={styles.pageContent}>
                    <form onSubmit={this.createStaff.bind(this)}>

                        <p>
                            <label>Status</label>
                        </p>
                        <p>
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
                            <label htmlFor='pinCode'>Pin</label>
                        </p>
                        <p>
                            <Input
                                id='pinCode'
                                name='pinCode'
                                placeholder='Bitte ausfüllen'
                                value={state.userData.pinCode}
                                modifier='material'
                                onChange={this.handleInputChange.bind(this)}
                                type='password'
                                maxLength={4}
                                required
                            >
                            </Input>
                        </p>

                        <p>
                            <button className={'button' + ( !ons.platform.isIOS() ? ' button--material' : '') } type='submit' disabled={state.disableSubmit}>Hinzufügen</button>
                        </p>
                    </form>
                </div>
            </Page>
        )
    }
}
