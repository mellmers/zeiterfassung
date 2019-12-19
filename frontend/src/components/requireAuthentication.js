import { Component, h } from 'preact';
import { route } from 'preact-router';
import LocalDB from "../utils/LocalDB";

export default class AuthComponent extends Component {

    state = {
        currentUser: null
    };

    componentWillMount() {
        LocalDB.currentUser.get(0).then( user => {
            if (user && user._id && user.token) {
                this.setState({ currentUser: user });
            } else {
                route('/login' + (this.props.path ? '?next=' + this.props.path : null), true);
            }
        });
    }

    render(props, { currentUser}, context) {
        console.log(props)
        if (currentUser !== null) {
            return h(props.component, props);
        }
        return null;
    }
}