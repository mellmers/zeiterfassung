import { Component } from 'preact';
import { Page } from 'react-onsenui';

import QRCode from '../../components/QRCode';

import EditProfile from './../../components/editProfile';

export default class Profile extends Component {

	render(props, state, context) {
		return (
			<Page>
				<EditProfile {...props} />

				<QRCode value={'' + props.user.staffNumber} />
			</Page>
		);
	}
}
