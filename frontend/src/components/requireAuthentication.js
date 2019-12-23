import { Component, h } from 'preact';
import { route } from 'preact-router';

import LocalDB from '../utils/LocalDB';

export default class AuthComponent extends Component {

    state = {
        currentUser: null
    };

    componentWillMount() {
        LocalDB.currentUser.get(0).then( currentUser => {
            if (currentUser && currentUser._id && currentUser.token) {
                this.setState({ currentUser: currentUser });
            } else {
                route('/login' + (this.props.path ? '?next=' + this.props.path : null), true);
            }

            // Weiterleitung zur Startseite, wenn nicht die benötigte Rolle
            const { requiredRole } = this.props;
            if (requiredRole) {
                if (requiredRole.constructor === Array) {
                    if (requiredRole.indexOf(currentUser.role) === -1) {
                        route('/', true);
                    }
                } else if (requiredRole !== currentUser.role) {
                    route('/', true);
                }
            }
        });
    }

    render(props, { currentUser}, context) {
        if (currentUser !== null) {
            return h(props.component, props);
        }
        return null;
    }
}
