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
			title: String,
			count: 	Number,
			impact: Number,
			message: String,
			partial: [],
			missing: []
		}],
		scope: String
	}],
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	}
});

export default mongoose.model('page', PageSchema);
