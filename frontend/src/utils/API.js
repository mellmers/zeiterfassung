import ons from 'onsenui';

import LocalDB from '../utils/LocalDB';

export default class API {

    /**
     * @returns API instance
     */
    static getInstance() {
        if (!this['singleton']) {
            this['singleton'] = new API();
        }
        return this['singleton'];
    }

    login(staffNumber, pinCode) {
        return new Promise( (resolve, reject) => {
            this._fetch('/users/authenticate', 'POST', {staffNumber: staffNumber, pinCode: pinCode}).then( result => {
                console.log('Login:', result);

                ons.notification.toast({
                    buttonLabel: result.status === 'error' ? 'Ok' : '',
                    force: true,
                    message: result.message,
                    timeout: result.status === 'error'? 10000 : 3000
                });

                if (result.status === 'success' && result.data.user) {
                    // TODO: Save result in IndexedDB
                    LocalDB.currentUser.put(result.data.user, 0).then( user => {
                        console.log(user);
                        resolve(result);
                    });
                } else {
                    reject(result);
                }
            });
        });
    }

    _fetch(url, method = 'GET', body = null, query = null, header = {}, contentType = 'application/x-www-form-urlencoded') {
        return new Promise((resolve, reject) => {
            if (url.indexOf('http') === -1) {
                header = Object.assign({}, {
                    'Accept': 'application/json',
                    'Content-Type': contentType
                }, header);
                url = '/api' + url;
            }

            let headers = new Headers();
            for (let key in header) {
                if (!header.hasOwnProperty(key)) continue;
                headers.append(key, header[key]);
            }

            if (query) {
                url += '?';
                let keys = Object.keys(query);
                keys.forEach((key, index) => {
                    if (!query.hasOwnProperty(key)) return;
                    url += key + '=' + query[key];
                    if (keys.length-1 > index) {
                        url += '&';
                    }
                });
            }

            let formBody = null;
            if (body) {
                formBody = [];
                for (const property in body) {
                    const encodedKey = encodeURIComponent(property);
                    const encodedValue = encodeURIComponent(body[property]);
                    formBody.push(encodedKey + '=' + encodedValue);
                }
                formBody = formBody.join('&');
            }

            fetch(url, {
                headers: headers,
                body: formBody,
                method: method
            })
                .then(this._parseJson)
                .then(json => {
                    if (json.error) {
                        console.error('Status: ' + json.status + ', Error: ' + json.error + ', Message: ' + json.message);
                        reject(this._parseError(json));
                    }
                    resolve(json);
                })
                .catch(error => {
                    console.error('Unexpected error in API fetch event', error);
                    reject({error: this._parseError(error)});
                });
        });
    }

    _parseJson(response) {
        return [204, 409].includes(parseInt(response.status)) ? { status: response.status } : response.json();
    }

    _parseError(error) {
        if (error && error.message) {
            switch (error.message) {
                default:
                    return {
                        message: 'Unbekannter Fehler - Bitte kontaktiere einen Admin'
                    };
            }
        } else {
            return error;
        }
    }
}