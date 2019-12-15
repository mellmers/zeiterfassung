import { Component } from 'preact';
import { Page } from 'react-onsenui';

import Toolbar from '../../components/toolbar';

import style from './style.scss';

export default class Home extends Component {

    render(props, state, context) {

        return (
            <Page renderToolbar={() => <Toolbar headline='Home' />}>
                <h1>Home</h1>
            </Page>
        );
    }
}
