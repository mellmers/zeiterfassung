import {Component} from 'preact';
import ons from 'onsenui';
import {BackButton, Button, Page, Toolbar} from 'react-onsenui';

import EditProfile from './../editProfile';

import API from './../../utils/API';

import styles from './styles.scss';

export default class StaffDetails extends Component {

    deleteStaff() {
        ons.notification.confirm('Mitarbeiter (' + this.props.user.firstName + ' ' + this.props.user.familyName + ') wirklich löschen?').then( accepted => {
            if (accepted) {
                API.getInstance()._fetch('/users/' + this.props.user._id, 'DELETE')
                    .then( response => {

                        ons.notification.toast({
                            buttonLabel: 'Ok',
                            force: true,
                            message: 'Mitarbeiter wurde erfolgreich gelöscht',
                            timeout: 5000
                        });

                        this.props.navigator.popPage();
                        this.props.onUserChanged();
                    });
            }
        });
    }

    onUserChanged(changedUser) {
        this.props.navigator.popPage();

        if (this.props.currentUser && this.props.currentUser._id === changedUser._id) {
            this.props.currentUserChanged(changedUser);
        }

        this.props.onUserChanged();
    }

    render(props, state, context) {
        return (
            <Page className={styles.staffDetail}>
                <Toolbar>
                    <div className='left'>
                        <BackButton>
                            Zurück
                        </BackButton>
                    </div>
                    <div className='center'>
                        Mitarbeiter bearbeiten
                    </div>
                </Toolbar>

                <EditProfile user={props.user} userChanged={this.onUserChanged.bind(this)} roleEditable />
                {props.currentUser && props.currentUser._id !== props.user._id ? <Button onClick={this.deleteStaff.bind(this)} style={{ backgroundColor: 'red' }}>Mitarbeiter löschen</Button> : null}

            </Page>
        )
    }
}
