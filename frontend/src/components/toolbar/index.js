import { Icon, Toolbar as OnsToolbar, ToolbarButton } from 'react-onsenui';

import Logo from '../../assets/icons/logo-512x512-transparent_bg.png';

import style from './style.scss';

const Toolbar = (props, state, context) => (
    <OnsToolbar>
        <div className='left'>
            <img src={Logo} alt='Zeiterfassung' className={style.logo} />
        </div>
        <div className='center'>
            {props.headline}
        </div>
        <div className='right'>
            <ToolbarButton>
                <Icon icon="md-menu" />
            </ToolbarButton>
        </div>
    </OnsToolbar>
);

export default Toolbar;
