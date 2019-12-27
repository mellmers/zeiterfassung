import { Component, Fragment } from 'preact';
import { Button } from 'react-onsenui';
import ReactQRCode from 'qrcode.react';

import styles from './styles.scss';

export default class QRCode extends Component {

    printQRCode() {

        if (window.print) {
            // SVG holen und in dafür vorbereitetes div mit weißem Hintergrund einsetzen, dann anzeigen und drucken
            const svg = document.getElementById(this.props.id || 'QRCode').cloneNode(true);
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
            <Fragment>
                <ReactQRCode id={props.id || 'QRCode'} className={styles.qrCode + (props.className ? ' ' + props.className : '')} value={props.value} size={256} renderAs='svg' />
                <Button className={styles.printButton + (props.btnClassName ? ' ' + props.btnClassName : '')} onClick={this.printQRCode.bind(this)}>QR-Code drucken</Button>
            </Fragment>
        );
    }
}
