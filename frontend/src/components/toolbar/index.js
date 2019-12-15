import { Toolbar as OnsToolbar } from 'react-onsenui';

import Logo from '../../assets/icons/android-chrome-512x512.png';

import style from './style.scss';

const Toolbar = (props, state, context) => (
    <OnsToolbar>
        <div className='left'>
            <img src={Logo} alt='Zeiterfassung' className={style.logo} />
        </div>
        <div className='center'>
            {props.headline}
        </div>
    </OnsToolbar>
);

export default Toolbar;
