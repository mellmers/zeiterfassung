import {Component} from 'preact';
import ons from 'onsenui';
import {BackButton, Button, Input, Page, Toolbar} from 'react-onsenui';

import EditProfile from './../editProfile';
import QRCode from './../QRCode';
import WorkingTimesTable from './../workingTimesTable';

import API from './../../utils/API';

import styles from './styles.scss';

export default class StaffDetails extends Component {

    state = {
        workingTimes: []
    };

    componentWillMount() {
        API.getInstance()._fetch('/working-times/' + this.props.user._id)
            .then(response => {
                if (response.status === 'success') {
                   this.setState({ workingTimes : response.data.workingTimes });
                }
            });
    }

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

    async shareInvitationLink() {
        const invitationLink = window.location.origin + '/user/invitation/' + this.props.user.invitationId;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Mitarbeiterdaten teilen',
                    text: 'Vorsicht: Personen mit Zugriff auf diesen Link können die Mitarbeiterdaten einsehen!',
                    url: invitationLink,
                })
            } catch(err) {
                console.log('Fehler beim Teilen: ', err);
            }
        } else if (localStorage.getItem('shareApiNotWorkingAlreadyShown') !== 'true') {
            confirm('Dieser Browser unterstützt die native Teilen-Funktionalität leider nicht. Der Einladungslink lautet: ' + invitationLink);
            // Nach erstem Klick, wird abgespeichert, dass die Fehlermeldung bereits einmal gezeigt wurde,
            // damit diese in Zukunft nicht mehr gezeigt wird
            localStorage.setItem('shareApiNotWorkingAlreadyShown', 'true');
        }
    }

    render(props, { workingTimes }, context) {
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
                {props.currentUser && props.currentUser._id !== props.user._id ? <Button onClick={this.deleteStaff.bind(this)} style={{ backgroundColor: 'red', display: 'table', margin: '15px 0' }}>Mitarbeiter löschen</Button> : null}

                <QRCode btnClassName={styles.btnQR} value={'' + props.user.staffNumber} id={'staff-' + props.user.staffNumber} />

                <p>
                    <label htmlFor='invitationLink'><strong>Einladungslink</strong></label>
                </p>
                <p>
                <Input
                    id='invitationLink'
                    name='invitationLink'
                    value={window.location.origin + '/user/invitation/' + props.user.invitationId}
                    modifier='material'
                >
                </Input>
                </p>
                {
                    // Zeige Teilen Button nur, wenn Share API unterstützt wird
                    localStorage.getItem('shareApiNotWorkingAlreadyShown') !== 'true' ? <Button className={styles.btnInvitation} onClick={this.shareInvitationLink.bind(this)}>Einladunglink teilen</Button> : null
                }

                <p>
                    <label><strong>Arbeitszeiten</strong></label>
                </p>
                <WorkingTimesTable workingTimes={workingTimes} />
            </Page>
        )
    }
}
