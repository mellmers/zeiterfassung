import UserModel from '../models/User';

// generate random v4 UUIDs - source: https://gist.github.com/LeverOne/1308368
export function generateUUIDVersion4(n, r){for(r=n=""; n++<36; r+=51*n&52?(15^n?8^Math.random()*(20^n?16:4):4).toString(16):"-");return r};

export function UserIsAdmin(id, res, next, callback) {
    return new Promise(resolve => {
        UserModel.findById(id).exec(function (err, user) {
            if (err) {
                next(err);
                return;
            }
            if (user && ( user.role === 'Terminal' || user.role === 'Administrator' )) {
                if (callback) callback(user);
                resolve('resolve');
            } else {
                res.status(403).json({status: 'error', message: "You are not allowed to save a working time for a different user."});
            }
        });
    });
}
