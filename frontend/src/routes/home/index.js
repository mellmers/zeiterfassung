import { Component } from 'preact';
import { Page } from 'react-onsenui';

import Toolbar from '../../components/toolbar';

import style from './style.scss';

export default class Home extends Component {

    render(props, state, context) {

        return (
            <Page>
                <h1>Home</h1>
                { props.currentUser ? <p>Hallo {props.currentUser.firstName} {props.currentUser.familyName}</p> : null}
            </Page>
        );
    }
}
