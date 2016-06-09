import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema({
	title: 			String,
	url: 			String,
	latestSupport: Number,
	imgSrc: String,
	snapshots:     [{
		captured:  {
			type: 		Date,
			default: 	Date.now
		},
		pageSupport: Number,
		browserCollection: [],
		elementCollection: [{
			name: 	String,
			count: 	Number,
			impact: Number,
			message: String
		}],
		scope: String
	}],
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	}
});

export default mongoose.model('page', PageSchema);
