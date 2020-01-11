import mongoose from 'mongoose';

// Definition des Punktschemas - https://mongoosejs.com/docs/geojson.html
const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

// Definition des Arbeitszeitschemas
const Schema = mongoose.Schema;
const WorkingTimeSchema = new Schema({
    start: {
        time: Date,
        location: pointSchema
    },
    end: {
        time: Date,
        location: pointSchema
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: {} });

export default mongoose.model('WorkingTime', WorkingTimeSchema);
