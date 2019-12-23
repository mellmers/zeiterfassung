import { Link } from 'preact-router';
import { Icon, Toolbar as OnsToolbar, ToolbarButton } from 'react-onsenui';

import Logo from './../../assets/icons/logo-512x512-transparent_bg.png';

import style from './style.scss';

const Toolbar = (props, state, context) => (
    <OnsToolbar>
        <div className='left'>
            <Link href='/'><img src={Logo} alt='Zeiterfassung' className={style.logo} /></Link>
        </div>
        <div className='center'>
            {props.headline}
        </div>
        {props.showMenuToggle ? (
            <div className='right'>
                <ToolbarButton onClick={() => { if (props.onSideMenuButtonClick) props.onSideMenuButtonClick() }}>
                    <Icon icon="md-menu" />
                </ToolbarButton>
            </div>
        ) : null }
    </OnsToolbar>
);

export default Toolbar;
