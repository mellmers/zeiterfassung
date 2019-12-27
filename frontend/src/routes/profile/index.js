import { Component } from 'preact';
import { Button, Page } from 'react-onsenui';
import QRCode from 'qrcode.react';

import EditProfile from './../../components/editProfile';

import styles from './styles.scss';

export default class Profile extends Component {

	printQRCode() {

		if (window.print) {
			// SVG holen und in dafür vorbereitetes div mit weißem Hintergrund einsetzen, dann anzeigen und drucken
			const svg = document.getElementById('myQRCode').cloneNode(true);
			let printWrapper = document.getElementById('printWrapper');
			printWrapper.className = 'show';
			printWrapper.appendChild(svg); // Dann SVG einsetzen

			// Wenn gedruckt oder abgebrochen wurde, div leer machen und printWrapper verschwinden lassen
			window.onafterprint = () => {
				printWrapper.className = '';
				printWrapper.innerHTML = '';
			};

			window.print();
		} else {
			alert('Dieser Browser unterstützt die Druckfunktion leider nicht.');
		}
	}

	render(props, state, context) {
		return (
			<Page>
				<EditProfile {...props} />

				<QRCode id='myQRCode' className={styles.qrCode} value={'' + props.user.staffNumber} size={256} renderAs='svg' />
				<Button onClick={this.printQRCode.bind(this)}>QR-Code ausdrucken</Button>
			</Page>
		);
	}
}
