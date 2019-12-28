import { Component, Fragment } from 'preact';
import {Link, route} from 'preact-router';
import ons from 'onsenui';
import {Icon, List, ListHeader, ListItem, Toolbar as OnsToolbar, ToolbarButton} from 'react-onsenui';

import LocalDB from './../../utils/LocalDB';

import Logo from './../../assets/icons/logo-512x512-transparent_bg.png';

import styles from './styles.scss';

export default class Toolbar extends Component {

    state = {
        sideMenuIsOpen: false
    };

    gotoUrl(url) {
        if (url === '/logout') {
            this.logout();
        } else {
            route(url);
        }
    }

    logout() {
        this.closeSideMenu();
        route('/logout');
    }

    closeSideMenu() {
        this.setState({ sideMenuIsOpen: false });
    }

    showSideMenu() {
        this.setState({ sideMenuIsOpen: true });
    }

    renderSideMenu() {
        return (
            <Fragment>
                <div className={styles.sideMenu + (this.state.sideMenuIsOpen ? ' ' + styles.sideMenuOpen : '')}>
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
                                        <div className='left'>
                                            <Icon icon={row.icon} />
                                        </div>
                                        <div className='center'>
                                            {row.name}
                                        </div>
                                    </Fragment>
                                ) : row.name}
                            </ListItem>
                        }
                    />
                </div>
                <div className={styles.sideMenuBackdrop  + (this.state.sideMenuIsOpen ? ' ' + styles.sideMenuOpen : '')} onClick={this.closeSideMenu.bind(this)} />
            </Fragment>
        );
    }

    render(props, state, context) {
        return (
            <Fragment>
                <OnsToolbar>
                    <div className='left'>
                        <Link href='/'><img src={Logo} alt='Zeiterfassung' className={styles.logo}/></Link>
                    </div>
                    <div className='center'>
                        {props.headline}
                    </div>
                    {props.showMenuToggle ? (
                        <div className='right'>
                            <ToolbarButton onClick={this.showSideMenu.bind(this)}>
                                <Icon icon="md-menu"/>
                            </ToolbarButton>
                        </div>
                    ) : null}
                </OnsToolbar>

                {this.renderSideMenu()}
            </Fragment>
        );
    }
}
