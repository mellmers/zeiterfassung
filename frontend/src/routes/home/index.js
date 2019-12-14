import { Component } from 'preact';

import style from './style.scss';

export default class Home extends Component {

    render(props, state, context) {

        return (
            <div className={style.home}>
                <h1>Home</h1>
                <p>This is the Home component.</p>
            </div>
        );
    }
}
