import { Component } from 'preact';
import { Page, Tab, Tabbar } from 'react-onsenui';

import Home from '../routes/home';
import Profile from '../routes/profile';

import Toolbar from '../components/toolbar';

export default class Tabs extends Component {

    state = {
        index: 0,
        show: false
    };

    componentWillMount() {
        // TODO: Change on specific route
        // setTimeout( () => {
        // 	this.setState({index:1})
        // }, 1000);

        // Bottom border is wrong at loading, so we wait some milliseconds to show the tab bar
        setTimeout( () => {
            this.setState({show:true})
        }, 250);
    }

    renderTabs() {
        const { currentUser, navigator} = this.props;
        return [
            {
                content: <Home key='home' navigator={navigator} currentUser={currentUser} />,
                tab: <Tab key='home' label='Home' icon='fa-home' />
            },
            {
                content: <Profile key='me' navigator={navigator} user='me' />,
                tab: <Tab key='me' label='Mein Profil' icon='fa-user-circle' />
            },
            {
                content: <Profile key='profile' navigator={navigator} />,
                tab: <Tab key='profile' label='Profil' icon='fa-id-card' />
            },
        ];
    }

    render(props, state, context) {
        return (
            <Page>
                <Toolbar headline='Home' />
                {state.show ? (
                    <Tabbar
                        index={state.index}
                        onPreChange={({index}) => this.setState(index)}
                        position='bottom'
                        renderTabs={this.renderTabs.bind(this)}
                        swipeable={true}
                    />
                ) : null}
            </Page>
        );
    }
}