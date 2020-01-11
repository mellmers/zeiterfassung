import UserModel from '../models/User';

// Generiere zufällige v4 UUIDs - source: https://gist.github.com/LeverOne/1308368
export function generateUUIDVersion4(n, r){for(r=n=""; n++<36; r+=51*n&52?(15^n?8^Math.random()*(20^n?16:4):4).toString(16):"-");return r};

export async function UserIsAdmin(id, next) {
    return new Promise( resolve => {
        UserModel.findById(id).exec( (err, user) => {
            if (err) {
                next(err);
                return;
            }
            if (user && ( user.role === 'Terminal' || user.role === 'Administrator' )) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

export async function UserIsTerminal(id, next) {
    return new Promise( resolve => {
        UserModel.findById(id).exec( (err, user) => {
            if (err) {
                next(err);
                return;
            }
            if (user && ( user.role === 'Terminal')) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

export async function isRequestedUser(req, userId) {
    return new Promise( resolve => {
        if (req.user.id === userId) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

export async function isRequestedUserOrAdmin(req, userId, next) {
    if (req.user.id === userId) {
        return new Promise( resolve => { resolve('requested'); });
    } else {
        const userIsAdmin = await UserIsAdmin(req.user.id, next);
        if (userIsAdmin) {
            return new Promise( resolve => { resolve('admin'); });
        } else {
            return new Promise( resolve => { resolve(false); });
        }
    }
}
