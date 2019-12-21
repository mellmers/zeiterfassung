import {Component, h} from 'preact';
import {Navigator} from 'react-onsenui';

import StaffList from '../../components/staffList';

export default class Staff extends Component {

    renderPage(route, navigator) {
        route.props = route.props || {};
        route.props.navigator = navigator;

        return h(route.comp, route.props);
    }

    render(props, state, context) {
        return (
            <Navigator
                initialRoute={{comp: StaffList, props: { key: 'staff-list', currentUser: props.currentUser, currentUserChanged: props.currentUserChanged.bind(this) }}}
                renderPage={this.renderPage.bind(this)}
            />
        );
    }
}
