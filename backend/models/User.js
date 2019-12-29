import mongoose from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

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
    },
}, { timestamps: {} });

UserSchema.plugin(AutoIncrement, { id: 'staffNumberSeq', inc_field: 'staffNumber' });

// UserSchema.set('autoIndex', false);

export default mongoose.model('User', UserSchema);
