import {Component} from 'preact';
import {route} from 'preact-router';
import ons from 'onsenui';
import {Button, Input, Page} from 'react-onsenui';
import QRReader from 'react-qr-reader'

import Toolbar from './../../components/toolbar';

import API from './../../utils/API';

import styles from './styles.scss';

export default class Terminal extends Component {

    state = {
        disableActions: false,
        pinCode: null,
        scanData: null,
        showQRScanner: false,
        staffNumber: null,
    };

    handleInputChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    handleLogin(e) {
        e.preventDefault();
        const { staffNumber, pinCode } = this.state;

        this.setState({ disableActions: true });


        // TODO: Anmeldung lokal, Arbeitszeit erfassen und wenn online synchronisieren

        /*
        if (staffNumber && pinCode) {
            API.getInstance().login(staffNumber, pinCode)
                .then( response => {
                    if (this.props.onLogin) this.props.onLogin(response.data.user);
                    if (this.props.next) route(this.props.next); else route('/');
                }, ()=>{} )
                .then( () => {
                    this.setState({ disableActions: false });
                })
                .catch(err => {
                    ons.notification.toast({
                        force: true,
                        message: 'Du bist offline. Du kannst dich leider nicht einloggen.',
                        timeout: 3000
                    });
                });
        }
        */
    }

    handleScan(data) {
        console.log('DATA:', data);
        if (data) {
            this.setState({
                scanData: data
            });
        }

        this.setState({ showQRScanner: false });
    }

    handleError(err) {
        alert(err);
    }

    openQRCodeScanner() {
        this.setState({ showQRScanner: true });
    }

    render(props, state, context) {

        if (state.showQRScanner) {
            return (
                <QRReader
                    delay={500}
                    onError={this.handleError.bind(this)}
                    onScan={this.handleScan.bind(this)}
                    style={{ width: '100%' }}
                />
            );
        }

        return (
            <Page renderToolbar={() => <Toolbar headline='Terminal' />}>
                <div className={'page-with-toolbar ' + styles.terminal}>
                    <form onSubmit={this.handleLogin.bind(this)}>
                        <h1>Arbeitszeit erfassen</h1>
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
                            <button className={'button' + ( !ons.platform.isIOS() ? ' button--material' : '') } type='submit' disabled={state.disableActions}>Anmelden</button>
                        </p>

                        <p className={styles.spacer}>oder</p>

                        <Button onClick={this.openQRCodeScanner.bind(this)} disabled={state.disableActions}>QR-Code scannen</Button>

                        <div>{state.scanData}</div>
                    </form>
                </div>
            </Page>
        );
    }
}
