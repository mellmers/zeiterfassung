import { Component, Fragment } from 'preact';
import { getCurrentUrl, route } from 'preact-router';
import { Icon, List, ListHeader, ListItem, Page, Splitter, SplitterContent, SplitterSide, Tab, Tabbar } from 'react-onsenui';

import Zeiterfassung from './zeiterfassung';
import Login from '../routes/Login';
import Profile from '../routes/profile';

import Toolbar from '../components/toolbar';

import LocalDB from '../utils/LocalDB';
import ons from "onsenui";

const Logout = (props, state, context) => (
    <Page><p>Logout</p></Page>
);

export default class Tabs extends Component {

    state = {
        tabIndex: 0,
        show: false,
        sideMenuIsOpen: false
    };

    componentWillMount() {
        // Bottom border is wrong at loading, so we wait some milliseconds to show the tab bar
        setTimeout( () => {
            this.setState({show:true});
        }, 250);

        // Set tab based on url
        setTimeout(() => {
            let tabIndex = 0;
            switch(getCurrentUrl()) {
                case '/':
                    tabIndex = 0;
                    break;
                case '/profil':
                    tabIndex = 1;
                    break;
                case '/mitarbeiter':
                    tabIndex = 2;
                    break;
            }
            this.setState({
                tabIndex: tabIndex
            });
        }, 1000)
    }

    gotoUrl(url) {
        if (url === '/logout') {
            this.logout();
        } else {
            route(url);
        }
    }

    logout() {
        LocalDB.currentUser.delete(0);
        this.closeSideMenu();
        ons.notification.toast({
            force: true,
            message: 'Abgemeldet',
            timeout: 3000
        });
        route('/login');
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

    showSideMenu() {
        this.setState({ sideMenuIsOpen: true });
    }

    closeSideMenu() {
        this.setState({ sideMenuIsOpen: false });
    }

    renderTabs() {
        const { currentUser} = this.props;
        return [
            {
                content: <Zeiterfassung key='zeiterfassung' currentUser={currentUser} />,
                tab: <Tab key='zeiterfassung' label='Zeiterfassung' icon='fa-user-clock' />
            },
            {
                content: <Profile key='profile' currentUser={currentUser} />,
                tab: <Tab key='profile' label='Profil' icon='fa-user-edit' />
            },
            {
                content: <Profile key='staff' currentUser={currentUser} />,
                tab: <Tab key='staff' label='Mitarbeiter' icon='fa-users-cog' />
            },
        ];
    }

    render(props, state, context) {
        return (
            <Splitter>
                <SplitterContent>
                    <Page>
                        <Toolbar headline='Zeiterfassung' showMenuToggle={true} onSideMenuButtonClick={this.showSideMenu.bind(this)} />
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
                </SplitterContent>
                <SplitterSide
                    collapse={true}
                    isOpen={state.sideMenuIsOpen}
                    onClose={this.closeSideMenu.bind(this)}
                    swipeable={true}
                    width={200}
                >
                    <Page>
                        <List
                            class='list list--material'
                            renderHeader={() => <ListHeader class='list-header list-header--material'>Zeiterfassung</ListHeader>}
                            dataSource={[
                                {
                                    name: 'Logout',
                                    url: '/logout',
                                    icon: 'fa-sign-out-alt'
                                },
                                {
                                    name: 'Login',
                                    url: '/login',
                                    icon: 'fa-sign-in-alt'
                                }
                            ]}
                            renderRow={(row) =>
                                <ListItem
                                    class='list-item list-item--material'
                                    key={row.name}
                                    modifier='longdivider'
                                    onClick={this.gotoUrl.bind(this, row.url)}
                                    tappable
                                >
                                    { row.icon ? (
                                        <Fragment>
                                            <div className="left">
                                                <Icon icon={row.icon} />
                                            </div>
                                            <div className="center">
                                                {row.name}
                                            </div>
                                        </Fragment>
                                    ) : row.name}
                                </ListItem>
                            }
                        />
                    </Page>
                </SplitterSide>
            </Splitter>
        );
    }
}