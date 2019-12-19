import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const AutoIncrement = require('mongoose-sequence')(mongoose);

import { generateUUIDVersion4 } from '../utils/helpers';

// Define the user schema
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    familyName: {
        type: String,
        trim: true,
        required: true,
    },
    firstName: {
        type: String,
        trim: true,
        required: true,
    },
    invitationId: String,
    staffNumber: Number,
    pinCode: {
        type: String,
        trim: true,
        required: true,
    },
    role: {
        type: String,
        enum: ['Terminal', 'Administrator', 'Mitarbeiter']
    }
}, { timestamps: {} });

UserSchema.plugin(AutoIncrement, { id: 'staffNumberSeq', inc_field: 'staffNumber' });

export const saltRounds = 10;
UserSchema.pre('create', function(next) {
    this.invitationId = generateUUIDVersion4();
    // hash user pinCode before saving into database
    this.pinCode = bcrypt.hashSync(this.pinCode, saltRounds);
    next();
});

// UserSchema.set('autoIndex', false);

export default mongoose.model('User', UserSchema);
