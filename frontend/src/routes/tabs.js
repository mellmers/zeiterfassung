import { Component } from 'preact';
import { getCurrentUrl, route } from 'preact-router';
import { Page, Tab, Tabbar } from 'react-onsenui';

import Zeiterfassung from './zeiterfassung';
import Profile from './../routes/profile';
import Staff from './../routes/staff';

import Toolbar from './../components/toolbar';

export default class Tabs extends Component {

    defaultToolbarHeadline = 'Zeiterfassung';

    state = {
        show: false,
        tabIndex: 0,
        toolbarHeadline: this.defaultToolbarHeadline
    };

    componentWillMount() {
        // Bottom border is wrong at loading, so we wait some milliseconds to show the tab bar
        setTimeout( () => {
            this.setState({show:true});
        }, 250);

        // Set tab based on url
        setTimeout(this.setTabBasedOnUrl.bind(this, getCurrentUrl()), 1000)
    }

    componentWillUpdate(nextProps, nextState, nextContext) {
        if (this.props.path !== nextProps.path) {
            this.setTabBasedOnUrl(nextProps.path);
        }
    }

    onTabBarPreChange(event) {
        this.setState(event.index);
        switch (event.index) {
            case 0:
                route('/');
                break;
            case 1:
                route('/profil');
                break;
            case 2:
                route('/mitarbeiter');
                break;
        }
    }

    setTabBasedOnUrl(path) {
        let tabIndex = 0,
            toolbarHeadline = this.defaultToolbarHeadline;
        switch(path) {
            case '/':
                tabIndex = 0;
                break;
            case '/profil':
                tabIndex = 1;
                toolbarHeadline = 'Meine Benutzerdaten';
                break;
            case '/mitarbeiter':
                tabIndex = 2;
                toolbarHeadline = 'Mitarbeiterverwaltung';
                break;
        }
        this.setState({
            tabIndex: tabIndex,
            toolbarHeadline: toolbarHeadline
        });
    }

    renderTabs() {
        const { currentUser} = this.props;
        let tabs = [
            {
                content: <Zeiterfassung key='zeiterfassung' currentUser={currentUser} />,
                tab: <Tab key='zeiterfassung' label='Zeiterfassung' icon='fa-user-clock' />
            },
            {
                content: <Profile key='profile' user={currentUser} userChanged={this.props.currentUserChanged.bind(this)} />,
                tab: <Tab key='profile' label='Profil' icon='fa-user-edit' />
            }
        ];
        if (currentUser.role === 'Administrator') {
            tabs.push({
                content: <Staff key='staff' currentUser={currentUser} currentUserChanged={this.props.currentUserChanged.bind(this)} />,
                tab: <Tab key='staff' label='Mitarbeiter' icon='fa-users-cog' />
            });
        }

        return tabs;
    }

    render(props, state, context) {
        return (
            <Page>
                <Toolbar headline={state.toolbarHeadline} showMenuToggle={true} />
                {state.show ? (
                    <Tabbar
                        index={state.tabIndex}
                        onPreChange={this.onTabBarPreChange.bind(this)}
                        position='bottom'
                        renderTabs={this.renderTabs.bind(this)}
                        swipeable={true}
                    />
                ) : null}
            </Page>
        );
    }
}
