import {Component} from 'preact';
import {Fab, Icon, List, ListItem, Page} from 'react-onsenui';

import AddStaff from './../addStaff';
import StaffDetails from './../staffDetails/staffDetails';

import API from './../../utils/API';

import styles from './styles.scss';

export default class Staff extends Component {

    state = {
        error: null,
        staffList: null
    };

    componentWillMount() {
        this.updateStaffList();
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (JSON.stringify(this.props.currentUser) !== JSON.stringify(nextProps.navigator.props.initialRoute.props.currentUser)) {
            this.updateStaffList();
        }
    }

    gotoComponent(component, props) {
        this.props.navigator.pushPage({comp: component, props});
    }

    updateStaffList() {
        API.getInstance()._fetch('/users', 'GET')
            .then(response => {
                this.setState({staffList: response.data.users})
            })
            .catch(err => {
                this.setState({error: 'Das Gerät ist offline. Die Mitarbeiterliste konnte nicht geladen werden.'});
            });
    }

    render(props, {error, staffList}, context) {

        if (error) {
            return (
                <Page>
                    <p>{error}</p>
                </Page>
            );
        }

        return (
            <Page>
                {staffList && staffList.length > 0 ? (
                    <List
                        dataSource={staffList}
                        renderRow={ row => (
                            <ListItem
                                className={styles.listItem}
                                modifier='chevron'
                                onClick={this.gotoComponent.bind(this,
                                    StaffDetails, {
                                        key: 'staff-details-' + row.staffNumber,
                                        user: row,
                                        onUserChanged: this.updateStaffList.bind(this),
                                        currentUser: props.currentUser,
                                        currentUserChanged: props.currentUserChanged.bind(this)
                                    })
                                }
                                tappable
                            >
                                <div className='left'>
                                    <Icon icon={row.role === 'Administrator' ? 'fa-user-shield' : (row.role === 'Terminal' ? 'fa-terminal' : 'fa-user')}/>
                                </div>
                                <div className={'center ' + styles.listItemCenter}>
                                    <div>{row.firstName} {row.familyName}</div>
                                    <div>{row.role}</div>
                                </div>
                            </ListItem>
                        )}
                    />
                ) : <h2>Liste wird geladen ...</h2>}

                <Fab position='right bottom' modifier='material' onClick={this.gotoComponent.bind(this, AddStaff, { key: 'add-staff', onStaffAdded: this.updateStaffList.bind(this) })}>
                    <Icon icon='fa-plus'/>
                </Fab>
            </Page>
        );
    }
}
