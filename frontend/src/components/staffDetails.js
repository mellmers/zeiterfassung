import {Component} from 'preact';
import {BackButton, Page, Toolbar} from 'react-onsenui';

import Profile from '../routes/profile';
import {getCurrentUser} from "../utils/helpers";

export default class AddStaff extends Component {

    onUserChanged(changedUser) {
        this.props.navigator.popPage();

        getCurrentUser().then( currentUser => {
            if (changedUser._id === currentUser._id) {
                this.props.currentUserChanged(changedUser);
            }
        });

        this.props.onUserChanged(changedUser);
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
                        Mitarbeiter bearbeiten
                    </div>
                </Toolbar>

                <Profile user={props.user} userChanged={this.onUserChanged.bind(this)} roleEditable />
            </Page>
        )
    }
}
