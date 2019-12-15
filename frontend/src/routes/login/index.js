import { Component } from 'preact';
import { Input, Page } from 'react-onsenui';

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
        console.log('Validate', staffNumber, pinCode);
        if (staffNumber && pinCode) {
            console.log('TODO: LOGIN', staffNumber, pinCode);
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
