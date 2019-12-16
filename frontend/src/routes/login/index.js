import { Component } from 'preact';
import { Input, Page } from 'react-onsenui';
import ons from 'onsenui';

import Toolbar from '../../components/toolbar';

import style from './style.scss';

export default class Login extends Component {

    state = {
        staffNumber: null,
        pinCode: null
    };

    handleInputChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    handleLogin(e) {
        e.preventDefault();
        const { staffNumber, pinCode } = this.state;
        if (staffNumber && pinCode) {
            console.log('LOGIN: ', staffNumber, pinCode);
            ons.notification.toast({
                message: 'Erfolgreich angemeldet',
                timeout: 3000,
            });
        } else {
            ons.notification.alert('Personalnummer oder Pin falsch!');
        }
    }

    render(props, state, context) {

        return (
            <Page renderToolbar={() => <Toolbar headline='Zeiterfassung' />}>
                <div className={style.login}>
                    <form onSubmit={this.handleLogin.bind(this)}>
                        <h1>Anmeldung</h1>
                        <p>
                            <Input
                                id='staffNumber'
                                name='staffNumber'
                                placeholder='Personalnummer'
                                modifier='material'
                                required
                                onChange={this.handleInputChange.bind(this)}
                            >
                            </Input>
                        </p>

                        <p>
                            <Input
                                id='pinCode'
                                name='pinCode'
                                placeholder='Pin'
                                type='password'
                                modifier='material'
                                onChange={this.handleInputChange.bind(this)}
                                maxLength={4}
                                required
                            >
                            </Input>
                        </p>

                        <p>
                            <button className='button--material button' type='submit'>Anmelden</button>
                        </p>
                    </form>
                </div>
            </Page>
        );
    }
}
