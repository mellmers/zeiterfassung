import { Component } from 'preact';
import { Page } from 'react-onsenui';

import EditProfile from './../../components/editProfile';
import QRCode from './../../components/QRCode';

import styles from './styles.scss';

export default class Profile extends Component {

	render(props, state, context) {
		return (
			<Page>
				<EditProfile {...props} />

				<QRCode value={'' + props.user.staffNumber} btnClassName={styles.btnQR} />
			</Page>
		);
	}
}
