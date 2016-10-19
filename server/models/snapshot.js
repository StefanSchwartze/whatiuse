import mongoose from 'mongoose';

const SnapshotSchema = new mongoose.Schema({
	pageId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'page'
	},
	captured:  {
		type: 		Date,
		default: 	Date.now
	},
	pageSupport: Number,
	missingSupport: Number,
	partialSupport: Number,
	browserCollection: [],
	elementCollection: [],
	syntaxErrors: [],
	whatIfIUse: [],
	whatIfIDelete: [],
	scope: String,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	}
});

export default mongoose.model('snapshot', SnapshotSchema);
