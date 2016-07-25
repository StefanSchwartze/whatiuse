import mongoose from 'mongoose';

const SnapshotSchema = new mongoose.Schema({
	page: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'page'
	},
	captured:  {
		type: 		Date,
		default: 	Date.now
	},
	pageSupport: Number,
	browserCollection: [],
	elementCollection: [],
	scope: String,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	}
});

export default mongoose.model('snapshot', SnapshotSchema);
