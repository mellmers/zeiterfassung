import LocalDB from './LocalDB';

export function updateCurrentUser(currentUser) {
    LocalDB.currentUser.put(currentUser, 0);
}

export async function getCurrentUser() {
    return new Promise( resolve => {
        LocalDB.currentUser.get(0).then( user => {
            if (user && user._id && user.token) {
                resolve(user);
            } else {
                resolve(null);
            }
        });
    });
}