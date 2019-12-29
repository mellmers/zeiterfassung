import { Component, Fragment } from 'preact';
import {Link, route} from 'preact-router';
import {Icon, Toolbar as OnsToolbar, ToolbarButton} from 'react-onsenui';

import Logo from './../../assets/icons/logo-512x512-transparent_bg.png';

import styles from './styles.scss';

export default class Toolbar extends Component {

    logout() {
        route('/logout');
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
                            <ToolbarButton onClick={()=>{location.reload()}}>
                                <Icon icon="fa-redo" size={18}/>
                            </ToolbarButton>
                            <ToolbarButton onClick={this.logout.bind(this)}>
                                <Icon icon="fa-sign-out-alt" size={20}/>
                            </ToolbarButton>
                        </div>
                    ) : null}
                </OnsToolbar>
            </Fragment>
        );
    }
}
