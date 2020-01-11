import mongoose from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Definition des Benutzerschemas
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

export default mongoose.model('User', UserSchema);
