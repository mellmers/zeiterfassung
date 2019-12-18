import Dexie from 'dexie';

const LocalDB = new Dexie('zeiterfassung');
LocalDB.version(1).stores({
    currentUser: ', _id, firstName, lastName, staffNumber, role',
    users: '_id, firstName, familyName, staffNumber, role',
    workingTime: '_id, userId'
});

export default LocalDB;